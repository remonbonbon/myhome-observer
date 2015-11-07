(function(global) {
	'use strict';

	var m = require('mithril');

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

	// Define View-Model
	app.vm = {
		init: function() {
			app.vm.programs = m.request({
				method: 'GET',
				url: '/api/recorder/programs',
				type: app.RecoderProgram,
				initialValue: [],
				background: true,
			});
			m.sync([app.vm.programs]).then(m.redraw);
		}
	};

	// Define controller
	app.controller = function() {
		app.vm.init();
	};

	app.view = function() {
		return m('.container-fluid', [
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