'use strict';

var path = require('path'),
fs = require('graceful-fs'),
gutil = require('gulp-util'),
map = require('map-stream'),
tempWrite = require('temp-write'),
cachebust = require('cachebust');

module.exports = function (options) {
	if(!options){
		options = {};
	}
	return map(function (file, cb) {
		if (file.isNull()) {
			return cb(null, file);
		}

		if (file.isStream()) {
			return cb(new gutil.PluginError('gulp-cachebust', 'Streaming not supported'));
		}
		if(!options.basePath){
			options.basePath = path.dirname(path.resolve(file.path))+'/';
		}

		tempWrite(file.contents, path.extname(file.path))
		.then(function (tempFile) {
			if (!tempFile) {
				return cb(new gutil.PluginError('gulp-cachebust', err));
			}

			fs.stat(tempFile, function (err, stats) {
				if (err) {
					return cb(new gutil.PluginError('gulp-cachebust', err));
				}
				options = options || {};

				fs.readFile(tempFile, { encoding : 'UTF-8'}, function(err, data) {
					if (err) {
						return cb(new gutil.PluginError('gulp-cachebust', err));
					}

					// Call the Node module
					var processedContents = cachebust.busted(data, options);

					if (options.showLog) {
						gutil.log('gulp-cachebust:', gutil.colors.green('✔ ') + file.relative);
					}

					file.contents = new Buffer(processedContents);

					cb(null, file);
				});

			});
		});
	});
};

