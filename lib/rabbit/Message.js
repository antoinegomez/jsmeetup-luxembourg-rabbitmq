'use strict';

const amqplib = require('amqplib');
const _ = require('lodash');
const logger = require('../logger');

module.exports.send = (_options) => {
  const { ch, meta, message, json, options } = Object.assign({
    ch: null,
    meta: { queue: null, exchange: null, routingKey: null },
    message: null,
    options: { json: true, headers: {} },
  }, _options);

  if (!ch) {
    throw new Error('Cannot send a message without channel');
  }

  if (!message) {
    throw new Error('I will not send an empty message');
  }

  if (typeof options.json !== 'boolean') {
    options.json = true;
  }

  if (typeof options.headers !== 'headers' || !options.headers) {
    options.headers = {};
  }
  
  let encodedMessage;

  console.log(message, options);
  
  if (!(message instanceof Buffer)) {
    encodedMessage = Buffer.from(options.json ? JSON.stringify(message) : message);
  } else {
    encodedMessage = message;
  }

  if (typeof options.headers.json !== "boolean") {
    options.headers = {
      json: options.json,
    };
    delete options.json;
  }

  logger.info({ message, meta, options } , `Sending message`);

  if (meta.queue) {
    return ch.sendToQueue(meta.queue, encodedMessage, options);
  } else if (meta.exchange) {
    return ch.publish(meta.exchange, meta.routingKey, encodedMessage, options);
  } else {
    throw new Error('Invalid meta option, specify a queue or an exchange');
  }
};

module.exports.decodeContent = (message) => {
  if (_.has(message, 'fields') && _.has(message, 'properties.headers') && _.has(message, 'content')) {      
    const json = message.properties.headers.json;
    return json ? JSON.parse(message.content.toString()) : message;
  }

  throw new Error('Invalid rabbitmq message');
};
