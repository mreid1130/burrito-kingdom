var fs = require('fs');
var chokidar = require('chokidar');
var request = require('request');
var async = require('async');
var path = require('path');

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
          if (!file.match(/node_modules$/)) {
            getFiles(file, function(err, res) {
              results = results.concat(res);
              if (!--pending) {
                done(null, results);
              }
            });
          } else {
            if (!--pending) {
              done(null, results);
            }
          }
        } else {
          if (file.match(/\.(gif|jpg|jpeg|tiff|png)$/i)) {
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

var getGoogleImage = function(searchTerm, index, usedImages, safeSearch, next) {
  var googleSearch = 'http://ajax.googleapis.com/ajax/services/search/images?v=1.0&q=' + searchTerm.split('\s').join('+');
  googleSearch += '&start=' + index;
  var resultSize = '&rsz=8';
  googleSearch += resultSize;
  var safe = '&safe=';
  if (safeSearch) {
    safe += 'active';
  } else {
    safe += 'off';
  }
  googleSearch += safe;
  request(googleSearch, function(err, res, body) {
    var randomImage;
    if (!err) {
      if (JSON.parse(body).responseData) {
        var images = JSON.parse(body).responseData.results;
        randomImage = images[Math.floor(Math.random() * images.length)].url;
        if (usedImages.indexOf(randomImage) === -1) {
          next(null, randomImage);
        } else {
          usedImages.push(randomImage);
          index = Math.floor(Math.random() * index * 2);
          getGoogleImage(searchTerm, index, usedImages, safeSearch, next);
        }
      } else if (index > 1) {
        getGoogleImage(searchTerm, index - 1, usedImages, safeSearch, next);
      } else {
        next(new Error('no Google image search results matching keywords.'));
      }
    } else {
      next(err);
    }
  });
};

module.exports.burritorizeFolder = function(directory, searchTerm, safeSearch, next) {
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
            if (!searchTerm) {
              var fileName = file.split("/").pop().split('.')[0];
              getGoogleImage(fileName, index, usedImages, safeSearch, cb1);

            } else {
              getGoogleImage(searchTerm, index, usedImages, safeSearch, cb1);
            }
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
  module.exports.burritorizeFolder(directory, searchTerm, safeSearch, function() {
    var ignoreList = [];
    var usedImages = [];
    var watcher = chokidar.watch(directory, {
      ignored: /[\/\\]\./,
      persistent: true
    });
    watcher
      .on('add', function(path, stats) {
        if (path.match(/\.(gif|jpg|jpeg|tiff|png)$/i) && ignoreList.indexOf(path) === -1) {
          ignoreList.push(path);
          if (!searchTerm) {
            var fileName = path.split("/").pop().split('.')[0];
            getGoogleImage(fileName, Math.floor(Math.random() * 10), usedImages, safeSearch, function(err, url) {
              if (!err) {
                usedImages.push(url);
                request(url).pipe(fs.createWriteStream(path));
              }
            });
          } else {
            getGoogleImage(searchTerm, Math.floor(Math.random() * 10), usedImages, safeSearch, function(err, url) {
              if (!err) {
                usedImages.push(url);
                request(url).pipe(fs.createWriteStream(path));
              }
            });
          }
        }
      });

    watcher
      .on('change', function(path, stats) {
        if (path.match(/\.(gif|jpg|jpeg|tiff|png)$/i) && ignoreList.indexOf(path) === -1) {
          ignoreList.push(path);
          if (!searchTerm) {
            var fileName = path.split("/").pop().split('.')[0];
            getGoogleImage(fileName, Math.floor(Math.random() * 10), usedImages, safeSearch, function(err, url) {
              if (!err) {
                usedImages.push(url);
                request(url).pipe(fs.createWriteStream(path));
              }
            });
          } else {
            getGoogleImage(searchTerm, Math.floor(Math.random() * 10), usedImages, safeSearch, function(err, url) {
              if (!err) {
                usedImages.push(url);
                request(url).pipe(fs.createWriteStream(path));
              }
            });
          }
        }
      });
  });
};
