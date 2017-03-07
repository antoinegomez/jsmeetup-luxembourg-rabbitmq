'use strict';

const config = require('config');
const RabbitMQ = require('../lib/rabbit');
const logger = require('../lib/logger');
const uuid = require('uuid');

const rabbit = new RabbitMQ.Connection({ logger });
rabbit.connect(config.get('rabbitmq')).then(() => {
  const queue = new RabbitMQ.Queue({
    ch: rabbit.getDefaultChannel(),
    logger,
    queue: 'pdf.worker',
    options: {
      durable: true,
    },
  });

  return queue;
})
.then((queue) => {
  const sendMessage = () => queue.sendMessage({ message: { link: 'http://convert-this.com/1092827.html', job_id: uuid.v4() } });
  setInterval(sendMessage, 3000);
  sendMessage();
});
