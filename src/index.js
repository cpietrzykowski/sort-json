import fs from 'fs';
import { Command } from 'commander';
const program = new Command()
  .usage('<file>')
  .parse(process.argv);

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
      return Object.keys(value).sort(function(l, r) {
        return l.localeCompare(r);
      }).reduce(function(memo, k) {
        memo[k] = value[k];
        return memo;
      }, {});
    }
  }

  return value;
}

function sortJsonFile(path, keys) {
  fs.readFile(path, function(err, data) {
    if (err) throw err;

    const obj = JSON.parse(data);
    const sortedobj = Object.keys(obj).reduce(function(memo, k) {
      if (keys.includes(k)) {
        memo[k] = sortObject(obj[k], true);
      } else {
        memo[k] = obj[k];
      }

      return memo;
    }, {});

    // replace 'path' contents on disk
    const json = JSON.stringify(sortedobj, null, 2) + '\n';
    fs.writeFile(path, json, function(err) {
      if (err) throw err;
    });
  });
}

const keystosort = ['dependencies', 'devDependencies'];

if (program.args[0]) {
  const jsonfile = program.args[0];
  fs.access(jsonfile, fs.constants.R_OK | fs.constants.W_OK, function(err) {
    console.log(err);
    if (err) throw err;
    sortJsonFile(jsonfile, keystosort);
  });
} else {
  program.outputHelp(function(help) {
    return help;
  });
}
