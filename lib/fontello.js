(function() {

  var HOST, apiRequest, fontello, fs, needle, open, path, print, unzip;

  fs = require('fs');

  needle = require('needle');

  open = require('open');

  print = require('util').print;

  path = require('path');

  unzip = require('unzip');

  HOST = 'http://fontello.com';

  apiRequest = function(options, successCallback, errorCallback) {

    var data, requestOptions;
    if (options.host == null) {
      options.host = HOST;
    }
    requestOptions = {
      multipart: true
    };
    if (options.proxy != null) {
      requestOptions.proxy = options.proxy;
    }
    data = {
      config: {
        file: options.config,
        content_type: 'application/json'
      }
    };
    return needle.post(options.host, data, requestOptions, function(error, response, body) {
      var sessionId, sessionUrl;
      if (error) {
        throw error;
      }
      sessionId = body;
      if (response.statusCode === 200) {
        sessionUrl = "" + options.host + "/" + sessionId;
        return typeof successCallback === "function" ? successCallback(sessionUrl) : void 0;
      } else {
        return typeof errorCallback === "function" ? errorCallback(response) : void 0;
      }
    });
  };

  fontello = {
    install: function(options) {
      return apiRequest(options, function(sessionUrl) {

        var requestOptions, zipFile;
        requestOptions = {};
        if (options.proxy != null) {
          requestOptions.proxy = options.proxy;
        }
        zipFile = needle.get("" + sessionUrl + "/get", requestOptions, function(error, response, body) {
          if (error) {
            throw error;
          }
        });
        if (options.css && options.font) {
          return zipFile.pipe(unzip.Parse()).on('entry', (function(entry) {
            var cssPath, dirName, fileName, fontPath, pathName, type, _ref;
            pathName = entry.path, type = entry.type;
            if (type === 'File') {
              dirName = (_ref = path.dirname(pathName).match(/\/([^\/]*)$/)) != null ? _ref[1] : void 0;

              fileName = path.basename(pathName);

              var defaultname = 'fontello';
              var cssname = fileName;
              var fontname = fileName;

              if (options.cssname !== null) {
                cssname = fileName.replace(defaultname, options.cssname);
              }

              if (options.fontname !== null) {
                fontname = fileName.replace(defaultname, options.fontname);
              }

              switch (dirName) {
                case 'css':

                  // cssPath = path.join(options.css, fileName);
                  cssPath = path.join(options.css, cssname);
                  return entry.pipe(fs.createWriteStream(cssPath));

                case 'font':

                  // fontPath = path.join(options.font, fileName);
                  fontPath = path.join(options.font, fontname);
                  return entry.pipe(fs.createWriteStream(fontPath));

                default:
                  return entry.autodrain();
              }

            }

          })).on('finish', (function() {

            function searchReplaceFile(regexpFind, replace, cssFileName, scssFileName) {

              var file = fs.createReadStream(cssFileName, 'utf8');
              var newCss = '';

              file.on('data', function (chunk) {
                newCss += chunk.toString().replace(regexpFind, replace).replace(/^(?:[\t ]*(?:\r?\n|\r))+/gm, '');
              });

              file.on('end', function () {
                fs.writeFile(scssFileName, newCss, function(err) {
                  if (err) {
                    return console.log(err);
                  } else {
                    console.log('Updated!');
                  }
                });
              });

            }

            searchReplaceFile(
              /\./g, '%',
              path.join(options.css, 'font-codes.css'),
              path.join(options.css, 'font-codes.scss')
            );

            return console.log('Install complete.\n'.green);

          }));
        } else {
          return zipFile.pipe(unzip.Extract({
            path: '.'
          })).on('finish', (function() {
            return console.log('Install complete.\n'.green);
          }));
        }
      });
    },
    open: function(options) {
      return apiRequest(options, function(sessionUrl) {
        return open(sessionUrl);
      });
    }
  };

  module.exports = fontello;

}).call(this);