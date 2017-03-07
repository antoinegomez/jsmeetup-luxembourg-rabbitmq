'use strict';

const dispatcher = require('./lib/rabbit').Dispatcher;
const init = require('./init');
init().then((props) => {
  props.queues.service.consume({ dispatcher });
  props.queues.process.consume({ dispatcher });
});

