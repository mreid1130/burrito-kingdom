var fs = require('fs');
var chokidar = require('chokidar');
var request = require('request');
var async = require('async');
var path = require('path');
var cheerio = require('cheerio');

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
          if (file.match(/\.jpg$/)) {
            results.push(file);
          }
          if (!--pending) {
            done(null, results);
          }
        }
      });
    });
  });
};

var getGoogleImage = function(searchTerm, index, usedImages, next) {
  var googleSearch = 'http://ajax.googleapis.com/ajax/services/search/images?v=1.0&q=' + searchTerm.split('\s').join('+');
  googleSearch += '&start=' + index;
  var resultSize = '&rsz=8';
  googleSearch += resultSize;
  request(googleSearch, function(err, res, body) {
    var randomImage;
    if (!err) {
      var images = JSON.parse(body).responseData.results;
      randomImage = images[Math.floor(Math.random() * images.length)].url;
      if (usedImages.indexOf(randomImage) === -1) {
        next(null, randomImage);
      } else {
        usedImages.push(randomImage);
        index = Math.floor(Math.random() * index * 2);
        getGoogleImage(searchTerm, index, usedImages, next);
      }
    } else {
      next(err);
    }
  });
};

module.exports.burritorizeFolder = function(directory, searchTerm, next) {
  var usedImages = [];
  async.waterfall([
    function(callback) {
      getFiles(directory, callback);
    },
    function(files, callback) {
      async.each(files, function(file, cb) {
        async.waterfall([
          function(cb1) {
            var index = Math.floor(Math.random() * files.length * 2);
            getGoogleImage(searchTerm, index, usedImages, cb1);
          },
          function(image, cb1) {
            usedImages.push(image);
            request(image).pipe(fs.createWriteStream(file)).on('finish', cb1);
          }
        ], cb);
      }, callback);
    }
  ], next);
};

module.exports.burritoWatch = function(directory, searchTerm, safeSearch) {
  module.exports.burritorizeFolder(directory, searchTerm, function() {
    var ignoreList = [];
    var usedImages = [];
    var watcher = chokidar.watch(directory, {
      ignored: /[\/\\]\./,
      persistent: true
    });
    watcher
      .on('add', function(path, stats) {
        if (path.match(/\.jpg$/) && ignoreList.indexOf(path) === -1) {
          console.log('add path', path);
          ignoreList.push(path);
          getGoogleImage(searchTerm, Math.floor(Math.random() * 10), usedImages, function(err, url) {
            if (!err) {
              usedImages.push(url);
              request(url).pipe(fs.createWriteStream(path));
            }
          });
        }
      });

    watcher
      .on('change', function(path, stats) {
        if (path.match(/\.jpg$/) && ignoreList.indexOf(path) === -1) {
          console.log('change path', path);
          ignoreList.push(path);
          getGoogleImage(searchTerm, Math.floor(Math.random() * 10), usedImages, function(err, url) {
            if (!err) {
              usedImages.push(url);
              request(url).pipe(fs.createWriteStream(path));
            }
          });
        }
      });
  });
};
