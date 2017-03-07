'use strict';

/*
Default dispatcher that will read message fields 
and dispatch it throught the right file.
*/

const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const decodeContent = require('./Message').decodeContent;
const logger = require('../logger');

module.exports = ({ message, ch }) => {
  logger.info('in dispatcher');
  const content = decodeContent(message);
  const { exchange, routingKey } = message.fields;
  
  const eventFile = ['messages'];
  if (exchange) {
    const action = routingKey;
    eventFile.push(exchange);
    // action is the routingKey! Just replace . with /
    // for better dir. structure
    eventFile.push(action.replace(/\./g, '/'));
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
    action({ message }).then(() => {
      ch.ack(message);
    }).catch(err => {
      ch.reject(message);
    });
  } catch (err) {
    logger.warn({ err }, err.message);
    ch.ack(message);
  }
}; 