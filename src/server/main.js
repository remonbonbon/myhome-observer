(function() {
	'use strict';

	var config = require('config');
	var logger = require('log4js').getLogger();
	var express = require('express');
	var compression = require('compression');
	var fs = require('fs');
	var path = require('path');
	var async = require('async');
	var childProcess = require('child_process');

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

	function _extractProgram(filePath, isRecorded, result, callback) {
		fs.readFile(filePath, 'utf8', function(err, data) {
			if (err) return callback(err);
			JSON.parse(data).forEach(function(d) {
				if (d.isSkip) return;	// ignore skipped program
				result.push({
					isRecorded: isRecorded,
					channel: _getChannelName(d.channel.id),
					isConflict: d.isConflict,
					startTime: d.start,
					endTime: d.end,
					title: d.title,
					episode: d.episode,
				});
			});
			callback(null, result);
		});
	}

	// Returns chinachu recorded and reserves.
	function _chinachuPrograms(req, res) {
		async.waterfall([
			function(callback) {
				callback(null, []);
			},
			function _getRecorded(result, callback) {
				_extractProgram(path.resolve('../chinachu/data/recorded.json'), true, result, callback);
			},
			function _getReserves(result, callback) {
				_extractProgram(path.resolve('../chinachu/data/reserves.json'), false, result, callback);
			},
		], function(err, result) {
			if (err) {
				logger.warn(err);
				return res.sendStatus(500);
			}
			res.set('Cache-Control', 'public,max-age=0').json(result);
		});
	}

	// Returns stats of server.
	function _serverStats(req, res) {
		async.waterfall([
			function(callback) {
				childProcess.exec('tail -n 1 cron.csv', function(error, stdout, stderr) {
					if (error) return callback(error);
					var columns = stdout.replace(/[\r\n]/g, '').split(',');
					callback(null, {
						timestamp: new Date(columns[0]),
						disk: {
							total: parseInt(columns[1], 10),
							used: parseInt(columns[2], 10),
							unit: '1KB',
						},
						loadAverage: {
							avg1: parseFloat(columns[3]),
							avg5: parseFloat(columns[4]),
							avg15: parseFloat(columns[5]),
						},
						cpu: {
							temperature: parseFloat(columns[6]),
						},
						room: {
							temperature: parseFloat(columns[7]),
							humidity: parseFloat(columns[8]),
						},
						recorder: {
							isActive: columns[9] !== 'standby',
							isRecording: columns[10] !== 'standby',
						}
					});
				});
			},
		], function(err, result) {
			if (err) {
				logger.warn(err);
				return res.sendStatus(500);
			}
			res.set('Cache-Control', 'public,max-age=0').json(result);
		});
	}

	// Setup route.
	function _routing(app) {
		app.get('/api/recorder/programs', _chinachuPrograms);
		app.get('/api/server/stats', _serverStats);
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


