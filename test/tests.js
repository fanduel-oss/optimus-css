var fs = require('fs'),
  test = require('tape'),
  optimus = require('../optimus'),
  stream = require('stream'),
  path = require('path');

function getWritableMock() {
  var mock = new stream.Writable();
  mock.result = '';
  mock._write = function(chunk, enc, cb) {
    this.result += chunk.toString();
    cb();
  };
  return mock;
}

test('it writes input to output stream', function(t) {
  var result = '';
  var source = fs.createReadStream(__dirname + '/css/simple.css');
  var output = getWritableMock();

  source.pipe(optimus({ path: path.dirname('/css/simple.css') })).pipe(output);

  output.on('finish', function() {
    t.equal(output.result, 'body {\n  color: \'red\';\n}\n');
    t.end();
  });
});

test('it inlines relative image paths', function(t) {
  var result = '';
  var source = fs.createReadStream(__dirname + '/css/relative.css');
  var output = getWritableMock();

  source.pipe(optimus({ cwd: 'test', path: path.dirname('/css/relative.css') })).pipe(output);

  output.on('finish', function() {
    t.equal(output.result, '.relative {\n  background: url(data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAMCAgICAgMCAgIDAwMDBAYEBAQEBAgGBgUGCQgKCgkICQkKDA8MCgsOCwkJDRENDg8QEBEQCgwSExIQEw8QEBD/yQALCAABAAEBAREA/8wABgAQEAX/2gAIAQEAAD8A0s8g/9k=);\n}\n');
    t.end();
  });
});

test('it inlines absolute image paths', function(t) {
  var result = '';
  var source = fs.createReadStream(__dirname + '/css/absolute.css');
  var output = getWritableMock();

  source.pipe(optimus({ cwd: 'test', path: path.dirname('/css/absolute.css') })).pipe(output);

  output.on('finish', function() {
    t.equal(output.result, '.absolute {\n  background: url(data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAMCAgICAgMCAgIDAwMDBAYEBAQEBAgGBgUGCQgKCgkICQkKDA8MCgsOCwkJDRENDg8QEBEQCgwSExIQEw8QEBD/yQALCAABAAEBAREA/8wABgAQEAX/2gAIAQEAAD8A0s8g/9k=);\n}\n');
    t.end();
  });
});

test('it inlines multiple images in stream', function(t) {
  var result = '';
  var source = fs.createReadStream(__dirname + '/css/multiple.css');
  var output = getWritableMock();

  source.pipe(optimus({ cwd: 'test', path: path.dirname('/css/absolute.css') })).pipe(output);

  output.on('finish', function() {
    t.equal(output.result, [
      '.relative {\n  background: url(data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAMCAgICAgMCAgIDAwMDBAYEBAQEBAgGBgUGCQgKCgkICQkKDA8MCgsOCwkJDRENDg8QEBEQCgwSExIQEw8QEBD/yQALCAABAAEBAREA/8wABgAQEAX/2gAIAQEAAD8A0s8g/9k=);\n}',
      '.absolute {\n  background: url(data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAMCAgICAgMCAgIDAwMDBAYEBAQEBAgGBgUGCQgKCgkICQkKDA8MCgsOCwkJDRENDg8QEBEQCgwSExIQEw8QEBD/yQALCAABAAEBAREA/8wABgAQEAX/2gAIAQEAAD8A0s8g/9k=);\n}',
      '.quotes {\n  background: url(data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAMCAgICAgMCAgIDAwMDBAYEBAQEBAgGBgUGCQgKCgkICQkKDA8MCgsOCwkJDRENDg8QEBEQCgwSExIQEw8QEBD/yQALCAABAAEBAREA/8wABgAQEAX/2gAIAQEAAD8A0s8g/9k=);\n}',
      '.quotes-single {\n  background: url(data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAMCAgICAgMCAgIDAwMDBAYEBAQEBAgGBgUGCQgKCgkICQkKDA8MCgsOCwkJDRENDg8QEBEQCgwSExIQEw8QEBD/yQALCAABAAEBAREA/8wABgAQEAX/2gAIAQEAAD8A0s8g/9k=);\n}\n'
      ].join('\n'));
    t.end();
  });
});

test('it logs and ignores local files that do not exist', function(t) {
  var result = '';
  var errors = [];
  var source = fs.createReadStream(__dirname + '/css/notfound.css');
  var output = getWritableMock();

  var transform = optimus({ path: path.dirname('/css/notfound.css') });

  transform.on('notfound', function(data) {
    errors.push(data);
  });

  source.pipe(transform).pipe(output);

  output.on('finish', function() {
    t.equal(output.result, '.notfound {\n  background: url(\'../images/notfound.jpg\');\n}\n');
    t.deepEqual(errors, ['../images/notfound.jpg']);
    t.end();
  });
});

// it('inlines remote images')

// it('logs and ignores remote files that are not images')
