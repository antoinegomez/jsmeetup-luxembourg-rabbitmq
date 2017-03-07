'use strict';

const config = require('config');
const Logger = require('./lib/logger');
const RabbitMQ = require('./lib/rabbit');
const dispatcher = require('./lib/rabbit/Dispatcher');
const logger = require('./lib/logger');
const uuid = require('uuid');

const rabbit = new RabbitMQ.Connection({ logger });
rabbit.connect(config.get('rabbitmq')).then(() => {
  const queue = new RabbitMQ.Queue({
    ch: rabbit.getDefaultChannel(),
    logger,
    queue: 'pdf.worker',
  });
  return queue;
})
.then((queue) => {
  const sendMessage = () => queue.sendMessage({ message: { link: 'http://convert-this.com/1092827.html', job_id: uuid.v4() } });
  setInterval(sendMessage, 5000);
  sendMessage();
});
