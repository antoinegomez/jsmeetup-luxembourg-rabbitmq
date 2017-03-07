'use strict';

const RabbitMQ = require('../lib/rabbit');
const logger = require('../lib/logger');
const init = require('./init');
const uuid = require('uuid');
const events = require('events');


const dispatcher = RabbitMQ.Dispatcher;
const customDipatcher = require('./customDispatcher');

init.boot().then(({ queues, rabbit }) => {
  // Init service exchange and queues
  queues.service.consume({ dispatcher });
  queues.process.consume({ dispatcher });

  // Init core exchange and queue
  const coreExchange = new RabbitMQ.Exchange({
    logger,
    ch: rabbit.getDefaultChannel(),
    exchange: 'core.all',
    type: 'direct',
  });

  const coreQueue = new RabbitMQ.Queue({
    logger,
    ch: rabbit.getDefaultChannel(),
    queue: 'core',
    options: {
      durable: true,
    },
  });


  // Send a message to core tadaweb api
  const eventHandler = new events();
  coreExchange.assert()
  .then(() => coreQueue.assert().then(() => coreQueue.bind({ exchange: coreExchange, routingKey: 'replay' })))
  .then(() => coreQueue.consume({ dispatcher: customDipatcher(eventHandler) }))
  .then(() => {
    const messageId = uuid.v4();
    coreExchange.sendMessage({
      message: {
        id: 'xxxxx',
        machineKey: queues.process.getName(),
        messageId,
      },
    }, 'replay');

    // Handle the response from the core
    eventHandler.once(messageId, (content) => {
      logger.info({ content, messageId }, 'response from core');
    });
  });
});
