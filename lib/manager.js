(function() {

  var colors, config, dirIsValid, fontello, fs, mkdirp, path, pjson, print, program;

  colors = require('colors');
  fs = require('fs');
  mkdirp = require('mkdirp');
  path = require('path');
  pjson = require(path.join(__dirname, '..', 'package.json'));
  program = require('commander');
  print = require('util').print;
  fontello = require(path.join(__dirname, '..', 'lib', 'fontello'));

  dirIsValid = function(path) {
    var e;
    try {
      return fs.statSync(path).isDirectory();
    } catch (_error) {
      e = _error;
      mkdirp.sync(path);
      return true;
    }
  };

  config = 'config.json';

  program.version(pjson.version).usage('[command] [options]').option('--config [path]', 'path to fontello config. defaults to ./config.json').option('--css [path]', 'path to css directory (optional). if provided, --font option is expected.').option('--font [path]', 'path to font directory (optional). if provided, --css option is expected.').option('--host [host]', 'address of fontello instance (optional).').option('--proxy [host]', 'address of the proxy you are behind.').option('--cssname [name]', 'css file name.').option('--fontname [name]', 'font file name.').option('--outfile [name]', 'other style output.').option('--transform [name]', 'type of transformation.');

  program.command('install').description('download fontello. without --css and --font flags, the full download is extracted.').action(function(env, options) {

    if (program.css && program.font) {
      if (!dirIsValid(program.css)) {
        print('--css path provided is not a directory.\n'.red);
        process.exit(1);
      }
      if (!dirIsValid(program.font)) {
        print('--font path provided is not a directory.\n'.red);
        process.exit(1);
      }
    }

    return fontello.install({
      config: program.config || config,
      css: program.css,
      cssname: program.cssname,
      font: program.font,
      fontname: program.fontname,
      outfile: program.outfile,
      transform: program.transform,
      host: program.host,
      proxy: program.proxy
    });

  });

  program.command('open').description('open the fontello website with your config file preloaded.').action(function(env, options) {

    return fontello.open({
      config: program.config || config,
      host: program.host,
      proxy: program.proxy
    });

  });

  program.parse(process.argv);

}).call(this);