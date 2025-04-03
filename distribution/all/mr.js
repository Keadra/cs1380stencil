/** @typedef {import("../types").Callback} Callback */

/**
 * Map functions used for mapreduce
 * @callback Mapper
 * @param {any} key
 * @param {any} value
 * @returns {object[]}
 */

/**
 * Reduce functions used for mapreduce
 * @callback Reducer
 * @param {any} key
 * @param {Array} value
 * @returns {object}
 */

/**
 * @typedef {Object} MRConfig
 * @property {Mapper} map
 * @property {Reducer} reduce
 * @property {string[]} keys
 */

function debug(msg, obj) {
  console.log(`[MR] ${msg}`);
  if (obj) console.log(JSON.stringify(obj, null, 2));
}

/*
  Note: The only method explicitly exposed in the `mr` service is `exec`.
  Other methods, such as `map`, `shuffle`, and `reduce`, should be dynamically
  installed on the remote nodes and not necessarily exposed to the user.
*/
function mr(config) {
  const context = {
    gid: config.gid || 'all',
  };

  /**
   * @param {MRConfig} configuration
   * @param {Callback} cb
   * @return {void}
   */
  function exec(configuration, cb) {
    debug(`Starting MapReduce execution for group: ${context.gid}`);

    getKeys(configuration.keys, values => {
      debug(`Got ${values.length} key-value pairs from storage`);
      
      const mapResults = mapPhase(values, configuration.map);
      debug(`Map phase completed with ${mapResults.length} results`);
  
      const shuffledResults = shufflePhase(mapResults);
      debug(`Shuffle phase completed with ${Object.keys(shuffledResults).length} keys`);
      
      const reduceResults = reducePhase(shuffledResults, configuration.reduce);
      debug(`Reduce phase completed with ${reduceResults.length} results`);
      
      cb(null, reduceResults);
    });
  }

  function getKeys(keys, callback) {
    const values = [];
    let count = 0;
    if (!keys || keys.length === 0) {
      callback([]);
      return;
    }
    for (const key of keys) {
      const store = require('../../distribution.js')[context.gid].store;
      
      store.get(key, (err, value) => {
        if (!err && value) {
          values.push({ key, value });
        }
        
        count++;
        if (count === keys.length) {
          callback(values);
        }
      });
    }
  }

  function mapPhase(keyValuePairs, mapFunc) {
    const results = [];
    
    for (const { key, value } of keyValuePairs) {
      try {
        const mapResult = mapFunc(key, value);
        if (Array.isArray(mapResult)) {
          results.push(...mapResult);
        }
      } catch (error) {
        debug(`Error in map function for key ${key}:`, error);
      }
    }
    
    return results;
  }

  function shufflePhase(mapResults) {
    const shuffled = {};
    
    for (const result of mapResults) {
      for (const [key, value] of Object.entries(result)) {
        if (!shuffled[key]) {
          shuffled[key] = [];
        }
        shuffled[key].push(value);
      }
    }
    
    return shuffled;
  }

  function reducePhase(shuffledResults, reduceFunc) {
    const results = [];
    
    for (const [key, values] of Object.entries(shuffledResults)) {
      try {
        const reduceResult = reduceFunc(key, values);
        if (reduceResult) {
          results.push(reduceResult);
        }
      } catch (error) {
        debug(`Error in reduce function for key ${key}:`, error);
      }
    }
    
    return results;
  }

  return { exec };
}

module.exports = mr;
