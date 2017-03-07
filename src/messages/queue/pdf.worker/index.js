const Promise = require('bluebird');
const logger = require('../../../../lib/logger');
const send = require('../../../../lib/rabbit').Message.send;

const max = 10000;
const min = 2000;

module.exports = ({ content, ch }) => {
  logger.info({ content }, 'Converting pdf ...');
  const generation_time = Math.random() * (max - min) + min;
  return Promise.delay(generation_time).then(() => {
    logger.info('... done converting pdf');
    send({
      ch,
      message: {
        source: content,
        generation_time,
      },
      meta: {
        exchange: 'events',
        routingKey: 'pdf.generated',
      },
    });
  });
};
