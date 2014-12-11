# Optimus CSS

Node.js stream transform and CLI to inline CSS image references as Base64-encoded data-URIs.

## Install

```sh
npm install optimus-css
```

## Usage

In your terminal (or `package.json` scripts, or `Makefile`):
```sh
optimus app/css/app.css --cwd app --output build --verbose
```

`optimus --help` for options usage, also accepts multiple file paths.

In your code
```js
var optimus = require('optimus-css'),
  path = require('path');

fs.createReadStream(__dirname + '/app/css/app.css')
  .pipe(optimus({ path: path.dirname('/app/css/app.css'), cwd: 'app' }))
  .pipe(fs.createWriteStream(__dirname + '/build/app.css'));
```

Also supports `new Optimus(options)` syntax and will output events:

* `notfound` - when an image file path cannot be resolved, event data will be the path as found in the CSS `url()` declaration.
