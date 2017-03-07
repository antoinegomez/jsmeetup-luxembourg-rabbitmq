'use strict';

const bunyan = require('bunyan');
const config = require('config');

module.exports = bunyan.createLogger({
  serializers: bunyan.stdSerializers,
  name: config.get('logger.name'),
});
