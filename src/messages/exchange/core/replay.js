'use strict';

const logger = require('../../../../lib/logger');

module.exports = ({ message }) => {
  logger.info({ message }, 'Core message');
};
