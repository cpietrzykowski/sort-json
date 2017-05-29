'use strict';

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _commander = require('commander');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const program = new _commander.Command().usage('<file>').parse(process.argv);

/**
 * JSON.stringify replacer method
 * @method sortObject
 * @param  {*}        value input
 * @param  {boolean}  deep  true if deep sort
 * @return {*}              sorted input or passthrough
 */
function sortObject(value, deep) {
  if (Object(value) === value) {
    if (!Array.isArray(value)) {
      return Object.keys(value).sort(function (l, r) {
        return l.localeCompare(r);
      }).reduce(function (memo, k) {
        memo[k] = value[k];
        return memo;
      }, {});
    }
  }

  return value;
}

function sortJsonFile(path, keys) {
  _fs2.default.readFile(path, function (err, data) {
    if (err) throw err;

    const obj = JSON.parse(data);
    const sortedobj = Object.keys(obj).reduce(function (memo, k) {
      if (keys.includes(k)) {
        memo[k] = sortObject(obj[k], true);
      } else {
        memo[k] = obj[k];
      }

      return memo;
    }, {});

    // replace 'path' contents on disk
    const json = JSON.stringify(sortedobj, null, 2) + '\n';
    _fs2.default.writeFile(path, json, function (err) {
      if (err) throw err;
    });
  });
}

const keystosort = ['dependencies', 'devDependencies'];

if (program.args[0]) {
  const jsonfile = program.args[0];
  _fs2.default.access(jsonfile, _fs2.default.constants.R_OK | _fs2.default.constants.W_OK, function (err) {
    console.log(err);
    if (err) throw err;
    sortJsonFile(jsonfile, keystosort);
  });
} else {
  program.outputHelp(function (help) {
    return help;
  });
}