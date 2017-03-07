const Promise = require('bluebird');
const logger = require('../../../../lib/logger');

const max = 10000;
const min = 2000;

module.exports = ({ content, ch }) => {
  logger.info({ content }, 'Replaying ...');
  const generation_time = Math.random() * (max - min) + min;
  return Promise.delay(generation_time).then(() => {
    logger.info('... done replaying');
  });
};
