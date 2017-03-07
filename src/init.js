'use strict';

// Init connection to RabbitMQ

const config = require('config');
const logger = require('../lib/logger');
const RabbitMQ = require('../lib/rabbit');
const os = require('os');
const uuid = require('uuid');
const Promise = require('bluebird');

// Create service queue
const initServiceQueue = ({ rabbit }) => {
  const queue = new RabbitMQ.Queue({
    logger,
    queue: config.get('rabbitmq.queue'),
    ch: rabbit.getDefaultChannel(),
    options: {
      durable: true, // survive process restart
    },
  });

  return queue.assert();
};

// Create process queue
const initProcessQueue = ({ rabbit }) => {
  const processQueue = `${os.hostname()}_${config.get('rabbitmq.queue')}_${process.pid}_${uuid.v4()}`;

  const queue = new RabbitMQ.Queue({
    logger,
    queue: processQueue,
    ch: rabbit.getDefaultChannel(),
    options: {
      durable: false, // survive process restart
      autoDelete: true,
      exclusive: true,
    },
  });

  return queue.assert();
};

// Init service exchange
const initServiceExchange = ({ rabbit, queue }) => {
  const exchange = new RabbitMQ.Exchange({
    logger,
    exchange: config.get('rabbitmq.exchange'),
    ch: rabbit.getDefaultChannel(),
    type: 'fanout',
    options: {
      durable: true,
    },
  });

  // Bind process queue to exchange with routingKeys
  return exchange.assert()
    .then(() => queue.bind({ exchange }));
};

// Init events exchange
const initEventsExchange = ({ rabbit, queue }) => {
  const exchange = new RabbitMQ.Exchange({
    logger,
    exchange: 'events',
    ch: rabbit.getDefaultChannel(),
    type: 'topic',
    options: {
      durable: true,
    },
  });

  // Bind service queue to exchange with routingKeys
  return exchange.assert()
    .then(() =>
      config.has('rabbitmq.events.binds') ?
        Promise.all(config.get('rabbitmq.events.binds').map(routingKey => queue.bind({ exchange, routingKey }))) :
        null);
};

// Connect
// Create queues
// Create exchanges and bind
module.exports.boot = () => {
  const rabbit = new RabbitMQ.Connection({ logger });
  return rabbit.connect(config.get('rabbitmq'))
    .then(() => Promise.props({
      service: initServiceQueue({ rabbit }),
      process: initProcessQueue({ rabbit }),
    }))
    .then(queues => Promise.props({
      service: initServiceExchange({ rabbit, queue: queues.process }),
      events: initEventsExchange({ rabbit, queue: queues.service }),
    }).then(exchanges => ({
      queues,
      exchanges,
      rabbit,
    })));
};

module.exports.initEventsExchange = initEventsExchange;
module.exports.initServiceExchange = initServiceExchange;
module.exports.initServiceQueue = initServiceQueue;
module.exports.initProcessQueue = initProcessQueue;
