'use strict';

const QUEUE_OPTIONS = ['durable', 'exclusive', 'autoDelete', 'arguments'];
const _ = require('lodash');
const RabbitMQ_Exchange = require('./Exchange');
const Message = require('./Message');

class RabbitMQ_Queue {

  constructor({ ch, logger, queue, options }) {
    this.ch = ch;
    this.logger = logger;
    this.queue = queue;
    this.options = _.pick(options, QUEUE_OPTIONS);
    this.asserted = false;
  }

  assert() {
    this.logger.info({ options: this.options }, `asserting queue ${this.queue}`);
    return this.ch.assertQueue(this.queue, this.options).then(() => {
      this.asserted = true;
      return this;
    });
  }

  check() {
    return this.ch.checkQueue(this.queue);
  }

  consume({ dispatcher }) {
    this.logger.info(`consuming queue ${this.queue}`);
    this.ch.consume(this.queue, (message) => {
      this.logger.info('new message', message);
      dispatcher({ message, ch: this.ch });
    });
  }

  bind({ exchange, routingKey }) {
    if (!(exchange instanceof RabbitMQ_Exchange)) {
      throw new Error('Exchange must be a RabbitMQ_Exchange instance');
    }

    return this.ch.bindQueue(this.queue, exchange.getName(), routingKey);
  }

  // Shortcut
  sendMessage(_options) {
    const { message, meta, options, ch } = Object.assign({
      ch: this.ch,
      message: null,
      options: {},
      meta: { queue: this.queue },
    }, _options);

    return Message.send({ message, meta, options, ch });
  }

}

module.exports = RabbitMQ_Queue;
