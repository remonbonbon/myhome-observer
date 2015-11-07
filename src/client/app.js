(function(global) {
	'use strict';

	var m = require('mithril');

	var app = {};

	// Define Model class
	app.RecoderRule = function(data) {
		this.channel = m.prop(data.channel);
		this.title = m.prop(data.title);
	};
	app.RecoderProgram = function(data) {
		this.channel = m.prop(data.channel);
		this.title = m.prop(data.title);
		this.episode = m.prop(data.episode);
		this.isConflict = m.prop(data.isConflict);
		this.startTime = m.prop(new Date(data.startTime));
		this.endTime = m.prop(new Date(data.endTime));
		this.timeLength = m.prop(data.endTime - data.startTime);
	};

	// Define View-Model
	app.vm = {
		init: function() {
			app.vm.rules = m.prop([]);
			app.vm.reserves = m.prop([]);
			app.vm.recorded = m.prop([]);
			m.request({
				method: 'GET',
				url: '/api/recorder',
			}).then(function(responce) {
				app.vm.rules(
					responce.rules.map(function(data) {
						return new app.RecoderRule(data);
					})
				);
				app.vm.reserves(
					responce.reserves.map(function(data) {
						return new app.RecoderProgram(data);
					})
				);
				app.vm.recorded(
					responce.recorded.map(function(data) {
						return new app.RecoderProgram(data);
					})
				);
			});
		}
	};

	// Define controller
	app.controller = function() {
		app.vm.init();
	};

	app.view = function() {
		return m('div', [
			m('h3', 'Reserves'),
			m('table', {border: 1}, [
				m('tr', [
					m('th', 'Channel'),
					m('th', 'Title'),
					m('th', 'Episode'),
					m('th', 'Conflict'),
					m('th', 'Start time'),
					m('th', 'End time'),
					m('th', 'Recording length'),
				]),
				app.vm.reserves().map(function(d) {
					return m('tr', [
						m('td', d.channel()),
						m('td', d.title()),
						m('td', d.episode()),
						m('td', d.isConflict()),
						m('td', d.startTime().toLocaleString()),
						m('td', d.endTime().toLocaleString()),
						m('td', d.timeLength() / 1000 / 60 + ' min'),
					]);
				}),
			]),
			m('h3', 'Recoded'),
			m('table', {border: 1}, [
				m('tr', [
					m('th', 'Channel'),
					m('th', 'Title'),
					m('th', 'Episode'),
					m('th', 'Conflict'),
					m('th', 'Start time'),
					m('th', 'End time'),
					m('th', 'Recording length'),
				]),
				app.vm.recorded().map(function(d) {
					return m('tr', [
						m('td', d.channel()),
						m('td', d.title()),
						m('td', d.episode()),
						m('td', d.isConflict()),
						m('td', d.startTime().toLocaleString()),
						m('td', d.endTime().toLocaleString()),
						m('td', d.timeLength() / 1000 / 60 + ' min'),
					]);
				}),
			]),
			m('h3', 'Rules'),
			m('table', {border: 1}, [
				m('tr', [
					m('th', 'Channel'),
					m('th', 'Title'),
				]),
				app.vm.rules().map(function(d) {
					return m('tr', [
						m('td', d.channel()),
						m('td', d.title()),
					]);
				}),
			]),
		]);
	};

	//initialize the application
	m.mount(global.document.getElementById('app'), {
		controller: app.controller,
		view: app.view
	});
})((this || 0).self || global);