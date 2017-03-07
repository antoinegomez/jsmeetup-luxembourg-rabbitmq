'use strict';

const amqplib = require('amqplib');
const Channel = require('./Channel');

class RabbitMQ_Connection {

  constructor({ logger }) {
    this.con = null;
    this.isConnecting = false;
    this.isConnected = false;
    this.defaultChannel = null;
    this.logger = logger;
  }

  connect(options) {
    if (this.isConnecting) {
      return false;
    }

    this.isConnecting = true;

    const port = options.port || 5672;
    const host = options.host || 'localhost';
    const vhost = (options.vhost || '').replace(/^\//, '%2F');
    const credentials = (options.username && options.password) ?
      `${options.username}:${options.password}@` : '';

    const uri = `amqp://${credentials}${host}:${port}/${vhost}`;
    const safeUri = `amqp://${credentials ? 'xxx@xxx' : '' }${host}:${port}/${vhost}`;
    this.logger.info(`Connecting to rabbitmq (${safeUri})`);

    return amqplib
      .connect(uri)
      .then((con) => {
        this.con = con;
        this.logger.info('Connected to rabbitmq');
        this.isConnected = true;
        const channel = new Channel({ connection: con });
        return channel.create();
        // return this.createChannel();
      })
      .then((ch) => {
        this.defaultChannel = ch;
        this.logger.debug('Default channel created');
      })
      .catch((err) => {
        this.logger.error({ err }, 'Cannot connect to rabbitmq');
        throw err;
      })
      .finally(() => {
        this.isConnecting = false;
      });
  }

  getConnection() {
    return this.con;
  }

  ensureConnection() {
    if (!this.isConnected) {
      throw new Error('Not connected');
    }
  }

  createChannel() {
    this.ensureConnection();
    return this.con.createChannel();
  }

  getDefaultChannel() {
    return this.defaultChannel;
  }

}

module.exports = RabbitMQ_Connection;
