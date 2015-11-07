(function() {
	'use strict';

	var config = require('config');
	var logger = require('log4js').getLogger();
	var express = require('express');
	var compression = require('compression');
	var fs = require('fs');
	var path = require('path');
	var async = require('async');

	// Setup express.
	function _setupExpress() {
		var app = express();
		app.use(compression());
		app.use(express.static('build', {maxAge: '1y'}));
		return app;
	}

	// Convert to channel name from channel ID
	function _getChannelName(channelId) {
		return config.recorder.channelNames[channelId];
	}

	// Setup route.
	function _routing(app) {
		app.get('/api/recorder', function(req, res) {
			async.waterfall([
				function(callback) {
					callback(null, {});
				},
				function _getReserves(state, callback) {
					fs.readFile(path.resolve('../chinachu/data/reserves.json'), 'utf8', function(err, data) {
						if (err) return callback(err);
						state.reserves = JSON.parse(data).map(function(d) {
							return {
								channel: _getChannelName(d.channel.id),
								isConflict: d.isConflict,
								startTime: d.start,
								endTime: d.end,
								title: d.title,
								episode: d.episode,
							};
						});
						callback(null, state);
					});
				},
				function _getRecorded(state, callback) {
					fs.readFile(path.resolve('../chinachu/data/recorded.json'), 'utf8', function(err, data) {
						if (err) return callback(err);
						state.recorded = JSON.parse(data).map(function(d) {
							return {
								channel: _getChannelName(d.channel.id),
								isConflict: d.isConflict,
								startTime: d.start,
								endTime: d.end,
								title: d.title,
								episode: d.episode,
							};
						});
						callback(null, state);
					});
				},
				function _getRules(state, callback) {
					fs.readFile(path.resolve('../chinachu/rules.json'), 'utf8', function(err, data) {
						if (err) return callback(err);
						state.rules = JSON.parse(data).map(function(d) {
							return {
								channel: d.channels ? _getChannelName(d.channels[0]) : null,
								title: d.reserve_titles[0],
							};
						});
						callback(null, state);
					});
				},
			], function(err, state) {
				if (err) {
					logger.warn(err);
					return res.sendStatus(500);
				}
				res.json(state);
			});
		});
	}

	// Start express server.
	function start() {
		var app = _setupExpress();
		_routing(app);

		app.listen(config.server.port, config.server.host, function() {
			logger.info('Listen %s:%s', config.server.host, config.server.port);
		});
	}

	module.exports = {
		start: start,
	};
})();


