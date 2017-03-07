'use strict';

/*
Default dispatcher that will read message fields
and dispatch it throught the right file.
*/

const _ = require('lodash');
const path = require('path');
const decodeContent = require('./Message').decodeContent;
const logger = require('../logger');

module.exports = ({ message, ch }) => {
  logger.debug('in dispatcher');
  const content = decodeContent(message);
  const { exchange, routingKey } = message.fields;

  const eventFile = ['src', 'messages'];
  if (exchange) {
    eventFile.push('exchange');
    eventFile.push(exchange.replace(/all/g, ''));
    // action is the routingKey! Just replace . with /
    // for better dir. structure
    eventFile.push(routingKey.replace(/\./g, '/'));
  } else if (!exchange && routingKey) {
    eventFile.push('queue');
    eventFile.push(routingKey);
    // Read action from headers first
    if (_.has(message, 'properties.headers.action')) {
      eventFile.push(message.properties.headers.action);
    } else if (_.has(content, 'action')) {
      // Or we could sent it in content
      eventFile.push(content.action);
    } else {
      // Fallback if no action found
      eventFile.push('index');
    }
  }

  const filename = path.resolve(eventFile.join('/'));

  logger.info(`trying to load file ${filename}`);

  try {
    require.resolve(filename);
    const action = require(filename);
    action({ message, content, ch }).then(() => {
      ch.ack(message);
    }).catch((err) => {
      logger.error({ err }, 'Error processing message');
      ch.reject(message);
    });
  } catch (err) {
    const payload = {};
    if (err.code !== 'MODULE_NOT_FOUND') {
      payload.err = err;
    }

    logger.warn(payload, err.message);
    ch.ack(message);
  }
};
