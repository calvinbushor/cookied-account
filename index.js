var config  = require('./config'),
		mongojs = require('mongojs'),
		bcrypt  = require('bcrypt'),
		db      = mongojs(config.mongo.url, [config.mongo.dbName]);

var dummyAccount = {
	clientId:  '$2a$10$CHl.FlQ7patWuAC/T52Vwu8lvX/hIhElVt4lzTZj8UTbhPaDogdDO',
	lastTime:  new Date(),
	firstName: 'Cal',
	lastName:  'Bushor',
	email:     '1@2.com'
}

function cookiedAccount(accounts) {
	this.accounts   = accounts || db[config.mongo.dbName];
	this.cookieName = config.cookie.name;
	// this.accounts.remove({});
	// this.accounts.save(dummyAccount);
	this.accounts.find({}).toArray(function(err, result) { console.log(result); });
}

cookiedAccount.prototype.get = function() {
	var that, methods;

	that    = this;
	methods = {};

	methods.clientIdFromRequest = function(req) {
		var id, cookies;

		cookies = req.cookies;

		if ( !cookies ) {
			return null;
		}

		id = cookies[config.cookie.name] || null;

		return id;
	}

	return methods;
}

cookiedAccount.prototype.cookie = function() {
	var that, accounts, methods;

	that     = this;
	methods  = {};
	accounts = that.accounts;

	methods.set = function(res, account, callback) {
		var time;

		if ( !res ) throw new Error('Variable {res} is required.');
		if ( !account ) throw new Error('Variable {account} is required.');
		if ( !callback ) throw new Error('Variable {callback} is required.');

		time = new Date();

		bcrypt.genSalt(10, function(err, salt) {
			bcrypt.hash(time.toString(), salt, function(err, hash) {
				res.cookie[that.cookieName] = hash;
				account['clientId']    = hash;
				account['lastTime']         = time;
				accounts.save(account);

				callback(null, hash);
			});
		});
	}

	return methods;
}

cookiedAccount.prototype.account = function() {
	var that, accounts, methods;

	that     = this;
	methods  = {};
	accounts = that.accounts;

	methods.get = function(req, callback) {
		var id;

		if ( !req ) throw new Error('Variable {req} is required.');
		if ( !callback ) throw new Error('Variable {callback} is required.');

		id = that.get().clientIdFromRequest(req);

		if ( null === id ) {
			callback('Account not found', null);
			return;
		}

		console.log('Finding account by cookie: ' + id);

		accounts.find({clientId: id}).limit(1).toArray(function(err, result) {
			if ( err ) {
				callback(err, null);
				return;
			}

			if ( 0 === result.length ) {
				callback('Account not found', null);
				return;
			}

			result = result[0];

			callback(null, result);
		});
	}

	return methods;
};


module.exports = cookiedAccount;
