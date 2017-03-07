const logger = require('../../../../../lib/logger');

module.exports = ({ content }) => {
  logger.info(`User ${content.user_id} is deleted !`);
  return Promise.resolve();
};
