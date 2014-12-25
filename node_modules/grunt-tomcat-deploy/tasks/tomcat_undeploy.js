/*
 * grunt-tomcat-deploy
 * https://github.com/elebescond/grunt-tomcat-deploy
 *
 * Copyright (c) 2013 Erwan Le Bescond
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  grunt.registerTask('tomcat_undeploy', 'Undeploy your webapp from a tomcat server.', function() {



    var done = this.async();

    grunt.config.requires('tomcat_deploy.login');
    grunt.config.requires('tomcat_deploy.password');
    grunt.config.requires('tomcat_deploy.host');
    grunt.config.requires('tomcat_deploy.port');
    grunt.config.requires('tomcat_deploy.deploy');
    grunt.config.requires('tomcat_deploy.path');

    var tomcat = grunt.config('tomcat_deploy');

    var options = {
      auth: tomcat.login + ':' + tomcat.password,
      hostname: tomcat.host,
      port: tomcat.port,
      path: tomcat.undeploy + '?path=' + tomcat.path,
      method: 'GET'
    };

    var content = '';

    var req = require('http').request(options, function(res) {
      res.setEncoding('utf8');
      res.on('data', function (chunk) {
        content += chunk;

      });
      res.on('err', function (chunk) {
        grunt.log.error(chunk);
        done(false);
      });
      res.on('end', function (chunk) {
        if(/^OK.*$/m.test(content)) {
          grunt.log.writeln(content);
          done();
        }
        else {
          grunt.log.error(content);
          done(false);
        }
      });
    });

    req.end();


  });

};
