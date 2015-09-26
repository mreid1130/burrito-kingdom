var fs = require('fs');
var chokidar = require('chokidar');

module.exports.burritoWatch = function(directory) {
  var watcher = chokidar.watch(directory, {
    ignored: /[\/\\]\./,
    persistent: true
  });

  watcher
    .on('add', function(path, stats) {
      console.log('File', path, 'has been added');
    });

  watcher
    .on('change', function(path, stats) {
      console.log('File', path, 'has been changed');
    });

};

// no need for cron for nows
// var CronJob = require('cron').CronJob;
// var job = new CronJob('00 */10 * * * *', function() {
//   console.log('running cron jobs!!!!');
// }, function() {
//   console.log('done');
// });
