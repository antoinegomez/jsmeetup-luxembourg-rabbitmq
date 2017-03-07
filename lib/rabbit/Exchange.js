'use strict';

const EXCHANGE_OPTIONS = ['durable', 'alternateExchange', 'autoDelete', 'arguments'];
const _ = require('lodash');
const Message = require('./Message');

class RabbitMQ_Exchange {

  constructor({ ch, logger, exchange, type, options }) {
    this.ch = ch;
    this.logger = logger;
    this.exchange = exchange;
    this.type = type;
    this.options = _.pick(options, EXCHANGE_OPTIONS);
  }

  getName() {
    return this.exchange;
  }

  assert() {
    this.logger.info({ options: this.options }, `asserting exchange ${this.getName()}`);
    return this.ch.assertExchange(this.getName(), this.type, this.options).then(() => this);
  }

  check() {
    return this.ch.checkExchange(this.getName());
  }

  // Shortcut
  sendMessage(_options, routingKey) {
    const { message, meta, options } = Object.assign({
      message: null,
      options: {},
      meta: { exchange: this.getName(), routingKey },
    }, _options);

    return Message.send({ message, meta, options });
  }

}

module.exports = RabbitMQ_Exchange;
