const distribution = require('../config.js');
const id = distribution.util.id;

// 添加调试日志函数
function debug(msg, obj) {
  console.log(`[DEBUG] ${msg}`);
  if (obj) console.log(JSON.stringify(obj, null, 2));
}

const ncdcGroup = {};
const avgwrdlGroup = {};
const cfreqGroup = {};

/*
    The local node will be the orchestrator.
*/
let localServer = null;

const n1 = {ip: '127.0.0.1', port: 7110};
const n2 = {ip: '127.0.0.1', port: 7111};
const n3 = {ip: '127.0.0.1', port: 7112};

test('(20 pts) all.mr:ncdc', (done) => {
  debug("Starting NCDC test");
  
  const mapper = (key, value) => {
    debug(`Mapper called with key=${key}, value=${value}`);
    const words = value.split(/(\s+)/).filter((e) => e !== ' ');
    const out = {};
    out[words[1]] = parseInt(words[3]);
    debug(`Mapper output:`, out);
    return [out];
  };

  const reducer = (key, values) => {
    debug(`Reducer called with key=${key}, values=`, values);
    const out = {};
    out[key] = values.reduce((a, b) => Math.max(a, b), -Infinity);
    debug(`Reducer output:`, out);
    return out;
  };

  const dataset = [
    {'000': '006701199099999 1950 0515070049999999N9 +0000 1+9999'},
    {'106': '004301199099999 1950 0515120049999999N9 +0022 1+9999'},
    {'212': '004301199099999 1950 0515180049999999N9 -0011 1+9999'},
    {'318': '004301265099999 1949 0324120040500001N9 +0111 1+9999'},
    {'424': '004301265099999 1949 0324180040500001N9 +0078 1+9999'},
  ];

  const expected = [{'1950': 22}, {'1949': 111}];

  const doMapReduce = (cb) => {
    debug("Starting MapReduce execution for NCDC");
    distribution.ncdc.mr.exec({keys: getDatasetKeys(dataset), map: mapper, reduce: reducer}, (e, v) => {
      debug("MapReduce execution completed with error=", e);
      debug("MapReduce execution result=", v);
      
      try {
        expect(v).toEqual(expect.arrayContaining(expected));
        done();
      } catch (e) {
        debug("Test failed with error:", e);
        done(e);
      }
    });
  };

  let cntr = 0;
  // Send the dataset to the cluster
  dataset.forEach((o) => {
    const key = Object.keys(o)[0];
    const value = o[key];
    debug(`Storing key=${key}, value=${value}`);
    distribution.ncdc.store.put(value, key, (e, v) => {
      cntr++;
      debug(`Stored data ${cntr}/${dataset.length}`);
      // Once the dataset is in place, run the map reduce
      if (cntr === dataset.length) {
        doMapReduce();
      }
    });
  });
});


test('(20 pts) all.mr:avgwrdl', (done) => {
  debug("Starting AVGWRDL test");
  
  // Calculate the average word length for each document
  const mapper = (key, value) => {
    debug(`Mapper called with key=${key}, value=${value}`);
    const words = value.split(/\s+/).filter((e) => e !== '');
    const out = {};
    out[key] = {
      totalLength: words.reduce((sum, word) => sum + word.length, 0),
      wordCount: words.length,
    };
    debug(`Mapper output:`, out);
    return [out];
  };

  const reducer = (key, values) => {
    debug(`Reducer called with key=${key}, values=`, values);
    const totalLength = values.reduce((sum, v) => sum + v.totalLength, 0);
    const totalCount = values.reduce((sum, v) => sum + v.wordCount, 0);
    const avgLength = totalCount === 0 ? 0 : totalLength / totalCount;
    const out = {};
    out[key] = parseFloat(avgLength.toFixed(2));
    debug(`Reducer output:`, out);
    return out;
  };

  const dataset = [
    {'doca': 'short and simple sentence'},
    {'docb': 'another slightly longer example'},
    {'docc': 'the final example has various word lengths'},
  ];

  const expected = [
    {'doca': 5.5},
    {'docb': 7.0},
    {'docc': 5.14},
  ];

  const doMapReduce = (cb) => {
    debug("Starting MapReduce execution for AVGWRDL");
    distribution.avgwrdl.mr.exec({keys: getDatasetKeys(dataset), map: mapper, reduce: reducer}, (e, v) => {
      debug("MapReduce execution completed with error=", e);
      debug("MapReduce execution result=", v);
      
      try {
        expect(v).toEqual(expect.arrayContaining(expected));
        done();
      } catch (e) {
        debug("Test failed with error:", e);
        done(e);
      }
    });
  };

  let cntr = 0;

  dataset.forEach((o) => {
    const key = Object.keys(o)[0];
    const value = o[key];
    debug(`Storing key=${key}, value=${value}`);
    distribution.avgwrdl.store.put(value, key, (e, v) => {
      cntr++;
      debug(`Stored data ${cntr}/${dataset.length}`);
      if (cntr === dataset.length) {
        doMapReduce();
      }
    });
  });
});

test('(25 pts) all.mr:cfreq', (done) => {
  debug("Starting CFREQ test");
  
  // Calculate the frequency of each character in a set of documents
  const mapper = (key, value) => {
    debug(`Mapper called with key=${key}, value=${value}`);
    const chars = value.replace(/\s+/g, '').split('');
    const out = [];
    chars.forEach((char) => {
      const o = {};
      o[char] = 1;
      out.push(o);
    });
    debug(`Mapper output:`, out);
    return out;
  };

  const reducer = (key, values) => {
    debug(`Reducer called with key=${key}, values=`, values);
    const out = {};
    out[key] = values.reduce((sum, v) => sum + v, 0);
    debug(`Reducer output:`, out);
    return out;
  };

  const dataset = [
    {'doc1': 'hello world'},
    {'doc2': 'map reduce test'},
    {'doc3': 'character counting example'},
  ];

  const expected = [
    {'h': 2}, {'e': 7}, {'l': 4},
    {'o': 3}, {'w': 1}, {'r': 4},
    {'d': 2}, {'m': 2}, {'a': 4},
    {'p': 2}, {'u': 2}, {'c': 4},
    {'t': 4}, {'s': 1}, {'n': 2},
    {'i': 1}, {'g': 1}, {'x': 1},
  ];

  const doMapReduce = (cb) => {
    debug("Starting MapReduce execution for CFREQ");
    distribution.cfreq.mr.exec({keys: getDatasetKeys(dataset), map: mapper, reduce: reducer}, (e, v) => {
      debug("MapReduce execution completed with error=", e);
      debug("MapReduce execution result=", v);
      
      try {
        expect(v).toEqual(expect.arrayContaining(expected));
        done();
      } catch (e) {
        debug("Test failed with error:", e);
        done(e);
      }
    });
  };

  let cntr = 0;

  dataset.forEach((o) => {
    const key = Object.keys(o)[0];
    const value = o[key];
    debug(`Storing key=${key}, value=${value}`);
    distribution.cfreq.store.put(value, key, (e, v) => {
      cntr++;
      debug(`Stored data ${cntr}/${dataset.length}`);
      if (cntr === dataset.length) {
        doMapReduce();
      }
    });
  });
});

/*
    Test setup and teardown
*/

// Helper function to extract keys from dataset (in case the get(null) funnctionality has not been implemented)
function getDatasetKeys(dataset) {
  debug("Getting dataset keys", dataset.map(o => Object.keys(o)[0]));
  return dataset.map((o) => Object.keys(o)[0]);
}

beforeAll((done) => {
  debug("Setting up test environment");
  
  ncdcGroup[id.getSID(n1)] = n1;
  ncdcGroup[id.getSID(n2)] = n2;
  ncdcGroup[id.getSID(n3)] = n3;

  avgwrdlGroup[id.getSID(n1)] = n1;
  avgwrdlGroup[id.getSID(n2)] = n2;
  avgwrdlGroup[id.getSID(n3)] = n3;

  cfreqGroup[id.getSID(n1)] = n1;
  cfreqGroup[id.getSID(n2)] = n2;
  cfreqGroup[id.getSID(n3)] = n3;

  debug("Node groups configured");

  const startNodes = (cb) => {
    debug("Starting nodes");
    distribution.local.status.spawn(n1, (e, v) => {
      debug("Node 1 started");
      distribution.local.status.spawn(n2, (e, v) => {
        debug("Node 2 started");
        distribution.local.status.spawn(n3, (e, v) => {
          debug("Node 3 started");
          cb();
        });
      });
    });
  };

  distribution.node.start((server) => {
    debug("Local server started");
    localServer = server;

    const ncdcConfig = {gid: 'ncdc'};
    startNodes(() => {
      debug("Setting up NCDC group");
      distribution.local.groups.put(ncdcConfig, ncdcGroup, (e, v) => {
        debug("NCDC group configured on local node");
        distribution.ncdc.groups.put(ncdcConfig, ncdcGroup, (e, v) => {
          debug("NCDC group configured on remote nodes");
          
          const avgwrdlConfig = {gid: 'avgwrdl'};
          debug("Setting up AVGWRDL group");
          distribution.local.groups.put(avgwrdlConfig, avgwrdlGroup, (e, v) => {
            debug("AVGWRDL group configured on local node");
            distribution.avgwrdl.groups.put(avgwrdlConfig, avgwrdlGroup, (e, v) => {
              debug("AVGWRDL group configured on remote nodes");
              
              const cfreqConfig = {gid: 'cfreq'};
              debug("Setting up CFREQ group");
              distribution.local.groups.put(cfreqConfig, cfreqGroup, (e, v) => {
                debug("CFREQ group configured on local node");
                distribution.cfreq.groups.put(cfreqConfig, cfreqGroup, (e, v) => {
                  debug("CFREQ group configured on remote nodes");
                  debug("Test setup complete");
                  done();
                });
              });
            });
          });
        });
      });
    });
  });
});

afterAll((done) => {
  debug("Cleaning up test environment");
  
  const remote = {service: 'status', method: 'stop'};
  remote.node = n1;
  distribution.local.comm.send([], remote, (e, v) => {
    debug("Node 1 stopped");
    remote.node = n2;
    distribution.local.comm.send([], remote, (e, v) => {
      debug("Node 2 stopped");
      remote.node = n3;
      distribution.local.comm.send([], remote, (e, v) => {
        debug("Node 3 stopped");
        localServer.close();
        debug("Test cleanup complete");
        done();
      });
    });
  });
});