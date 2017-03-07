'use strict';

const logger = require('../../../../../lib/logger');

module.exports = ({ content }) => {
  logger.info({ content }, 'Cool, a new PDF has been generated !');
  return Promise.resolve();
};
