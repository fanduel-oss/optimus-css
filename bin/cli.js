#!/usr/bin/env node
var optimus = require('./../optimus'),
  fs = require('fs'),
  path = require('path');

var argv = require('yargs')
  .usage('Usage: $0 FILES [--options]')
  .alias('d', 'cwd')
    .default('d', '.')
    .describe('d', 'Working directory to resolve image paths')
  .alias('o', 'output')
    .describe('o', 'Directory to output transfomed files (defaults to process.stdout)')
  .alias('v', 'verbose')
    .describe('verbose', 'Enable verbose logging')
    .boolean('verbose')
  .alias('h', 'help')
  .help('h')
  .argv;

argv._.forEach(function(file) {
  var transform = optimus({ cwd: argv.d, path: path.relative(argv.d, path.dirname(file)) });

  if (argv.v) {
    var warnings = [];

    transform.on('notfound', function(filename) {
      warnings.push(['Could not resolve %s from %s', filename, file]);
    }).on('finish', function() {
      warnings.forEach(function(args) {
        console.warn.apply(console, args);
      });
    });
  }

  var out = argv.o ? fs.createWriteStream(path.join(argv.o, path.basename(file))) : process.stdout;

  fs.createReadStream(file).pipe(transform).pipe(out);
});
