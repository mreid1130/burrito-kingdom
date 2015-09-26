var fs = require('fs');
var chokidar = require('chokidar');
var request = require('request');
var async = require('async');
var path = require('path');

module.exports.burritoWatch = function(directory) {
  var url = 'http://www.carlosandgabbysbrooklyn.com/images/chicken%20burrito.jpg';
  var getFiles = function(dir, done) {
    var results = [];
    fs.readdir(dir, function(err, list) {
      if (err) {
        return done(err);
      }
      var pending = list.length;
      if (!pending) {
        return done(null, results);
      }
      list.forEach(function(file) {
        file = path.resolve(dir, file);
        fs.stat(file, function(err, stat) {
          if (stat && stat.isDirectory()) {
            getFiles(file, function(err, res) {
              results = results.concat(res);
              if (!--pending) {
                done(null, results);
              }
            });
          } else {
            results.push(file);
            if (!--pending) {
              done(null, results);
            }
          }
        });
      });
    });
  };

  async.waterfall([
    function(callback) {
      getFiles(directory, callback);
    },
    function(files, callback) {
      async.each(files, function(file, cb) {
        if (file.match(/\.jpg$/)) {
          request(url, function() {
            console.log(file);
          }).pipe(fs.createWriteStream(file)).on('end', cb);
        } else {
          cb(null);
        }
      }, callback);
    }
  ], function(err) {
    var ignoreList = [];
    var watcher = chokidar.watch(directory, {
      ignored: /[\/\\]\./,
      persistent: true
    });

    watcher
      .on('add', function(path, stats) {
        if (path.match(/\.jpg$/) && ignoreList.indexOf(path) === -1) {
          request(url, function() {
            console.log(ignoreList);
            ignoreList.push(path);
          }).pipe(fs.createWriteStream(path));
        }
      });

    watcher
      .on('change', function(path, stats) {
        if (path.match(/\.jpg$/) && ignoreList.indexOf(path) === -1) {
          request(url, function() {
            console.log(ignoreList);
            ignoreList.push(path);
          }).pipe(fs.createWriteStream(path));
        }
      });
  });
};
