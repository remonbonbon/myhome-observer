(function() {
  'use strict';

  var _ = require('lodash');
  var Vue = require('vue');
  var Rickshaw = require('rickshaw');

  var vm = new Vue({
    el: 'body'
  });

  var graph = new Rickshaw.Graph({
    element: document.querySelector('#graph'),
    series: [
      {
        color: 'steelblue',
        data: _.times(40, function(index) {
          return {
            x: index,
            y: _.random(0, 1, true),
          };
        })
      }, {
        color: 'lightblue',
        data: _.times(40, function(index) {
          return {
            x: index,
            y: _.random(0, 1, true),
          };
        })
      }
    ]
  });
  graph.render();
})();