'use strict';

const _ = require('lodash');

class RabbitMQ_Channel {

  constructor({ connection, options }) {
    this.connection = connection;
    this.options = options;
  }

  create() {
    return this.connection.createChannel(this.options).then((ch) => {
      this.ch = ch;
      return ch;
    });
  }

  prefetch(count, global) {
    if (!this.ch) {
      throw new Error('Channel not created');
    }

    this.ch.prefetch(count, global);
  }

  getChannel() {
    return this.ch;
  }

}

module.exports = RabbitMQ_Channel;
