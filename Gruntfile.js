'use strict';

var request = require('request');

module.exports = function (grunt) {
  // show elapsed time at the end
  require('time-grunt')(grunt);
  // load all grunt tasks
  require('load-grunt-tasks')(grunt);

  var reloadPort = 35735, files;

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    config: {
      dev: { },
      dist: { }
    },
    develop: {
      server: {
        file: 'index.js'
      }
    },
    watch: {
      options: {
        nospawn: true,
        livereload: reloadPort
      },
      server: {
        files: [
          'app/*.js',
          'index.js'
        ],
        tasks: ['develop', 'delayed-livereload']
      }
    },
    'file-creator': {
      dev: {
        'tmp/config.js': function(fs, fd, done) {
          fs.writeSync(fd, 'module.exports = ' + JSON.stringify(grunt.config('config.dev')) + ';');
          done();
        }
      },
      dist: {
        'tmp/config.js': function(fs, fd, done) {
          fs.writeSync(fd, 'module.exports = ' + JSON.stringify(grunt.config('config.dist')) + ';');
          done();
        }
      }
    }
  });

  grunt.config.requires('watch.server.files');
  files = grunt.config('watch.server.files');
  files = grunt.file.expand(files);

  grunt.registerTask('delayed-livereload', 'Live reload after the node server has restarted.', function () {
    var done = this.async();
    setTimeout(function () {
      request.get('http://localhost:' + reloadPort + '/changed?files=' + files.join(','),  function (err, res) {
          var reloaded = !err && res.statusCode === 200;
          if (reloaded) {
            grunt.log.ok('Delayed live reload successful.');
          } else {
            grunt.log.error('Unable to make a delayed live reload.');
          }
          done(reloaded);
        });
    }, 500);
  });

  grunt.registerTask('default', [
    'file-creator:dev',
    'develop',
    'watch'
  ]);
  grunt.registerTask('heroku:production', ['file-creator:dist']);
};
