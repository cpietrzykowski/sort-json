import fs from 'fs';
import { Command } from 'commander';
const program = new Command().usage('<file>').parse(process.argv);

/**
 * @param  {object}        value input
 * @param  {boolean}  deep  true if deep sort
 * @return {object}              a new sorted object or passthrough
 */
function sortObjectKeys(value, deep = false) {
  if (Object(value) === value) {
    if (!Array.isArray(value)) {
      return Object.keys(value)
        .sort(function(l, r) {
          return l.localeCompare(r);
        })
        .reduce(function(memo, k) {
          memo[k] = sortObjectKeys(value[k]);
          return memo;
        }, {});
    }
  }

  return value;
}

/**
 *
 * @param {string} path
 * @return {Promise} resolving with {string}
 */
function readJsonFile(path) {
  return new Promise(function(resolve, reject) {
    fs.readFile(path, function(err, data) {
      if (err) return reject(err);

      try {
        const jsonObject = JSON.parse(data);
        return resolve(jsonObject);
      } catch (reason) {
        return reject(reason);
      }
    });
  });
}

/**
 *
 * @param {string} path
 * @param {object} obj
 * @return {Promise}
 */
function writeJsonToFile(path, obj) {
  const json = JSON.stringify(obj, null, 2);

  return new Promise(function(resolve, reject) {
    fs.writeFile(path, `${json}\n`, function(err) {
      if (err) return reject(err);
      return resolve();
    });
  });
}

// command line driver
if (program.args[0]) {
  const filePath = program.args[0];
  readJsonFile(filePath)
    .then(function(obj) {
      // process object (sorting keys)
      return sortObjectKeys(obj);
    })
    .then(function(obj) {
      return writeJsonToFile(filePath, obj);
    })
    .then(function() {
      console.info(`finished sorting: ${filePath}`);
    });
} else {
  program.outputHelp(function(help) {
    return help;
  });
}
