(function(global) {
	'use strict';

	var m = require('mithril');
	var _ = require('lodash');

	var app = {};

	// Define Model class
	app.RecoderProgram = function(data) {
		this.isRecorded = m.prop(data.isRecorded);
		this.channel = m.prop(data.channel);
		this.title = m.prop(data.title);
		this.episode = m.prop(data.episode);
		this.isConflict = m.prop(data.isConflict);
		this.startTime = m.prop(new Date(data.startTime));
		this.endTime = m.prop(new Date(data.endTime));
		this.timeLength = m.prop(Math.floor((data.endTime - data.startTime) / 1000 / 60));
	};

	app.ServerStats = function(data) {
		this.timestamp = m.prop(new Date(_.get(data, 'timestamp', 0)));
		this.diskTotal = m.prop(_.get(data, 'disk.total', 0));
		this.diskUsed = m.prop(_.get(data, 'disk.used', 0));
		this.diskPercentage = m.prop(this.diskUsed() / this.diskTotal() * 100);
		this.loadAverage1 = m.prop(_.get(data, 'loadAverage.avg1', 0));
		this.loadAverage5 = m.prop(_.get(data, 'loadAverage.avg5', 0));
		this.loadAverage15 = m.prop(_.get(data, 'loadAverage.avg15', 0));
		this.cpuTemp = m.prop(_.get(data, 'cpu.temperature', 0));
		this.roomTemp = m.prop(_.get(data, 'room.temperature', 0));
		this.roomHumi = m.prop(_.get(data, 'room.humidity', 0));
		this.recorderIsActive = m.prop(_.get(data, 'recorder.isActive', 0));
		this.recorderIsRecording = m.prop(_.get(data, 'recorder.isRecording', 0));
	};

	// Define View-Model
	app.vm = {
		init: function() {
			app.vm.programs = m.request({
				method: 'GET',
				url: '/api/recorder/programs',
				type: app.RecoderProgram,
				// initialValue: [],
				// background: true,
			});
			app.vm.stats = m.request({
				method: 'GET',
				url: '/api/server/stats',
				type: app.ServerStats,
				// initialValue: new app.ServerStats({}),
				// background: true,
			});
			// m.sync([
				// app.vm.programs,
				// app.vm.stats,
			// ]).then(m.redraw);
		}
	};

	// Define controller
	app.controller = function() {
		app.vm.init();
	};

	app.view = function() {
		var estStorageRatio = 74683.3283018868; // [KB/min]
		var estDiskUsed = _.reduce(app.vm.programs(), function(result, d) {
			if (d.isRecorded()) return result;
			return result + d.timeLength() * estStorageRatio;
		}, 0);
		return m('.container-fluid', [
			m('h2', 'Server Stats'),
			m('dl.dl-horizontal', [
				m('dt', 'Time'),
				m('dd', app.vm.stats().timestamp().toLocaleString()),
				m('dt', 'Load Average'),
				m('dd', [
					app.vm.stats().loadAverage1(),
					app.vm.stats().loadAverage5(),
					app.vm.stats().loadAverage15(),
				].join(' ,')),
				m('dt', 'CPU'),
				m('dd', app.vm.stats().cpuTemp() + ' ℃'),
				m('dt', 'Room'),
				m('dd', [
					app.vm.stats().roomTemp() + ' ℃, ',
					app.vm.stats().roomHumi() + ' %',
				]),
				m('dt', 'Recorder Status'),
				m('dd', [
					app.vm.stats().recorderIsActive() ? 'Active' : 'Sleep',
					app.vm.stats().recorderIsRecording() ? 'recording' : 'standby',
				].join(' ')),
				m('dt', 'Recorder Disk'),
				m('dd.progress', [
					m('.progress-bar.progress-bar-success', {style: {
						width: app.vm.stats().diskPercentage() + '%'
					}}, [
						Math.round(app.vm.stats().diskUsed() / 1024 / 1024),
						' / ',
						Math.round(app.vm.stats().diskTotal() / 1024 / 1024),
						'GB',
					]),
					m('.progress-bar.progress-bar-warning', {style: {
						width: '5em'
					}}, [
						'+ ',
						Math.round(estDiskUsed / 1024 / 1024),
						'GB',
					]),
				]),
			]),
			m('h2', 'Recorder Programs'),
			m('table.table.table-hover.table-condensed', [
				m('thead', m('tr', [
					m('th', 'Channel'),
					m('th', 'Title'),
					m('th', 'Datetime'),
					m('th', 'Length'),
				])),
				m('tbody', app.vm.programs().map(function(d) {
					var trClass = '';
					if (d.isConflict()) {
						trClass = 'danger';
					} else if (d.isRecorded()) {
						trClass = 'success';
					}
					return m('tr', {class: trClass}, [
						m('td', d.channel()),
						m('td', d.title() + (d.episode() ? ' #' + d.episode() : '')),
						m('td', d.startTime().toLocaleString().replace(/\:00$/, '')),
						m('td', d.timeLength() + ' min'),
					]);
				})),
			]),
		]);
	};

	//initialize the application
	m.mount(global.document.body, {
		controller: app.controller,
		view: app.view
	});
})((this || 0).self || global);