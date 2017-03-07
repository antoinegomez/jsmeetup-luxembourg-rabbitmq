'use strict';

const RabbitMQ = require('../lib/rabbit');
const config = require('config');
const logger = require('../lib/logger');

const rabbit = new RabbitMQ.Connection({ logger });
rabbit.connect(config.get('rabbitmq'))
  .then(() => {
    const exchange = new RabbitMQ.Exchange({
      exchange: 'events',
      ch: rabbit.getDefaultChannel(),
    });
    exchange.sendMessage({ message: { user_id: 16844 } }, 'user.deleted');
  });
