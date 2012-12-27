var config = {}

config.mongo = {};
config.mongo.url    = process.env.MONGODB_URL ||  'flex-accounts';
config.mongo.dbName = 'flex-accounts';

config.cookie = {};
config.cookie.name = 'flexId';

module.exports = config;