'use strict';

const RabbitMQ = require('../lib/rabbit');
const logger = require('../lib/logger');
const init = require('./init');

const dispatcher = RabbitMQ.Dispatcher;

init.boot().then(({ rabbit, queues }) => {
  // queues.service.consume({ dispatcher });
  // queues.process.consume({ dispatcher });

  // Create new channel for our worker
  const channel = new RabbitMQ.Channel({ connection: rabbit.getConnection() });
  channel.create()
    .then((ch) => {
      // Only accept one job at a time
      channel.prefetch(1);
      // Create worker queue
      const worker = new RabbitMQ.Queue({
        logger,
        queue: 'pdf.worker',
        ch,
        options: {
          durable: true,
        },
      });
      return worker.assert().then(() => worker);
    })
    .then((worker) => {
      worker.consume({ dispatcher });
    });
});
