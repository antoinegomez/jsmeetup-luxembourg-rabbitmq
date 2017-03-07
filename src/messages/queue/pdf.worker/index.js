const Promise = require('bluebird');
const logger = require('../../../lib/logger');

module.exports = ({ message }) => {
  logger.info('Converting pdf ...');
  return Promise.delay(60000).then(() => {
    logger.info('... done converting pdf');
  });
};