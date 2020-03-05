const {noopLogger} = require('./lib/utils');
const bluebird = require('bluebird');
const redis = require('redis');
const StatsCollector = require('jambonz-stats-collector');
bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

module.exports = function(opts, logger) {
  logger = logger || noopLogger;
  const client = redis.createClient(opts);
  ['ready', 'connect', 'reconnecting', 'error', 'end', 'warning']
    .forEach((event) => {
      client.on(event, (...args) => {
        logger.debug({args}, `redis event ${event}`);
      });
    });

  const stats = new StatsCollector(logger);

  return {
    client,
    updateCallStatus: require('./lib/update-call-status').bind(null, client, logger),
    retrieveCall: require('./lib/retrieve-call').bind(null, client, logger),
    deleteCall: require('./lib/delete-call').bind(null, client, logger),
    listCalls: require('./lib/list-calls').bind(null, client, logger),
    purgeCalls: require('./lib/purge-calls').bind(null, client, logger),
    synthAudio: require('./lib/synth-audio').bind(null, client, logger, stats)
  };
};
