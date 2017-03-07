'use strict';

const dispatcher = require('../lib/rabbit').Dispatcher;
const decodeContent = require('../lib/rabbit/Message').decodeContent;
const _ = require('lodash');

module.exports = eventHandler => ({ message, ch }) => {
  // Handle core messages
  if (_.has(message, 'fields') && message.fields.exchange === 'core.all') {
    const content = decodeContent(message);
    eventHandler.emit(content.messageId, content);
    ch.ack(message);
  } else {
    dispatcher({ message });
  }
};
