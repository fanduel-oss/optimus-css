var imageType = require('image-type'),
  Transform = require('stream').Transform,
  util = require('util'),
  fs = require('fs'),
  path = require('path'),
  mime = require('mime');

util.inherits(Optimus, Transform);
function Optimus(options) {
  if (!(this instanceof Optimus)) {
    return new Optimus(options);
  }

  Transform.call(this, options);

  this.options = options;
  this.buffer = '';
  this.finder = /url\(\s*[\'"]*(.+?)[\'"]*\s*\)/;
}

Optimus.prototype._transform = function(chunk, encoding, done) {
  this.buffer += chunk.toString();

  var match,
    index,
    length,
    filename,
    contents,
    base64Contents,
    mimeType;

  while(match = this.finder.exec(this.buffer)) {
    index = match.index;
    length = match[0].length;
    filename = decodeURI(match[1]);
    this.push(this.buffer.slice(0, index));
    try {
      if (filename[0] !== '/') {
        filename = path.resolve(path.join(this.options.cwd, this.options.path), filename);
      } else {
        filename = path.join(this.options.cwd || '', filename);
      }
      contents = fs.readFileSync(filename);
      base64Contents = contents.toString('base64');
      mimeType = mime.lookup(imageType(contents));
      this.push('url(data:' + mimeType + ';base64,' + base64Contents + ')');
    } catch (ex) {
      this.emit('notfound', match[1]);
      this.push(match[0]);
    }
    this.buffer = this.buffer.slice(index + length);
  }

  done();
};

Optimus.prototype._flush = function(done) {
  this.push(this.buffer);
  done();
};

module.exports = Optimus;
