const distribution = require('../../config.js');
const util = distribution.util;
const id = distribution.util.id;

test('(5 pts) (scenario) use the local store', (done) => {
    /*
      Use the distributed store to put a key-value pair.
      Make sure to run the check() function at the last callback of your solution.
  */

  const user = {first: 'Josiah', last: 'Carberry'};
  const key = 'jcarbspsg';
  distribution.local.store.put(user, key, (e, v) => {
    if (e) {
      done(e);
      return;
    }
    check();
  });

  function check() {
    distribution.local.store.get(key, (e, v) => {
      try {
        expect(v).toEqual(user);
        done();
      } catch (error) {
        done(error);
      }
    });
  }
});


test('(5 pts) (scenario) hash functions return different nodes', () => {
    /*

        Identify two keys that consistentHash maps to the same node. You will
        likely need to try a few (but not many) keys. What can you conclude
        about using consistentHash for a small number of keys.

    */
  const nodeIds = [
    util.id.getNID({ip: '192.168.0.1', port: 8000}),
    util.id.getNID({ip: '192.168.0.2', port: 8000}),
    util.id.getNID({ip: '192.168.0.3', port: 8000}),
    util.id.getNID({ip: '192.168.0.4', port: 8000}),
    util.id.getNID({ip: '192.168.0.5', port: 8000}),
  ];
  
  let key1 = 'key1';
  let key2 = 'key2';
  
  const testKeys = [];
  for (let i = 0; i < 100; i++) {
    testKeys.push('testkey' + i);
  }
  
  const keyNodeMap = {};
  for (const key of testKeys) {
    const kid = util.id.getID(key);
    const node = util.id.consistentHash(kid, nodeIds);
    
    if (!keyNodeMap[node]) {
      keyNodeMap[node] = [];
    }
    keyNodeMap[node].push(key);
  }
  
  for (const node in keyNodeMap) {
    if (keyNodeMap[node].length >= 2) {
      key1 = keyNodeMap[node][0];
      key2 = keyNodeMap[node][1];
      break;
    }
  }

  const kid1 = util.id.getID(key1);
  const kid2 = util.id.getID(key2);

  const key1Node = util.id.consistentHash(kid1, nodeIds);
  const key2Node = util.id.consistentHash(kid2, nodeIds);

  expect(key1Node).toBe(key2Node);
});

test('(5 pts) (scenario) hash functions return the same node', () => {

    /*

        Identify a key for which the three hash functions agree about its placement.
        You will likely need to try a few (but not many) keys.

    */
  const nodeIds = [
    util.id.getNID({ip: '192.168.0.1', port: 8000}),
    util.id.getNID({ip: '192.168.0.2', port: 8000}),
    util.id.getNID({ip: '192.168.0.3', port: 8000}),
    util.id.getNID({ip: '192.168.0.4', port: 8000}),
  ];

  let found = false;
  let key = 'initialkey';
  
  const testKeys = [];
  for (let i = 0; i < 1000; i++) {
    testKeys.push('testkey' + i);
  }
  
  for (const testKey of testKeys) {
    const kid = util.id.getID(testKey);
    
    const a = util.id.naiveHash(kid, nodeIds);
    const b = util.id.rendezvousHash(kid, nodeIds);
    const c = util.id.consistentHash(kid, nodeIds);
    
    if (a === b && b === c) {
      key = testKey;
      found = true;
      break;
    }
  }
    const kid = util.id.getID(key);
    const a = util.id.naiveHash(kid, nodeIds);
    const b = util.id.rendezvousHash(kid, nodeIds);
    const c = util.id.consistentHash(kid, nodeIds);
    
    expect(a).toBe(b);
    expect(b).toBe(c);
  
});



const n1 = {ip: '127.0.0.1', port: 9001};
const n2 = {ip: '127.0.0.1', port: 9002};
const n3 = {ip: '127.0.0.1', port: 9003};
const n4 = {ip: '127.0.0.1', port: 9004};
const n5 = {ip: '127.0.0.1', port: 9005};
const n6 = {ip: '127.0.0.1', port: 9006};
test('(5 pts) (scenario) use mem.reconf', (done) => {
    /*
  In this scenario, you will use the `mem.reconf` method to reconfigure the placement of items in a group of nodes.
  You will create a group of nodes and place items in them.
  Then, you will remove a node from the group and call `mem.reconf` to place the items in the remaining nodes.
  Finally, you will check if the items are in the right place.
  */
  const mygroupGroup = {};
  mygroupGroup[id.getSID(n1)] = n1;
  mygroupGroup[id.getSID(n2)] = n2;
  mygroupGroup[id.getSID(n3)] = n3;

  const keysAndItems = [
    {key: 'a', item: {first: 'Josiah', last: 'Carberry'}},
    {key: 'b', item: {first: 'John', last: 'Smith'}},
    {key: 'c', item: {first: 'Jane', last: 'Doe'}}
  ];

  const config = {gid: 'mygroup', hash: id.consistentHash};

  distribution.local.groups.put(config, mygroupGroup, (e, v) => {
    distribution.mygroup.mem.put(keysAndItems[0].item, keysAndItems[0].key, (e, v) => {
      distribution.mygroup.mem.put(keysAndItems[1].item, keysAndItems[1].key, (e, v) => {
        distribution.mygroup.mem.put(keysAndItems[2].item, keysAndItems[2].key, (e, v) => {
          const groupCopy = {...mygroupGroup};

          let toRemove = n2;
          delete mygroupGroup[id.getSID(n2)];
          
          distribution.mygroup.groups.rem(
            'mygroup',
            id.getSID(toRemove),
            (e, v) => {
              distribution.mygroup.mem.reconf({hash: id.consistentHash}, (e, v) => {
                checkPlacement();
              });
            });
        });
      });
    });
  });

  const checkPlacement = () => {
    const kid1 = id.getID(keysAndItems[0].key);
    const remainingNodes = [id.getNID(n1), id.getNID(n3)];
    const nodeForKey1 = id.consistentHash(kid1, remainingNodes);
    
    let nodeObj;
    if (nodeForKey1 === id.getNID(n1)) {
      nodeObj = n1;
    } else {
      nodeObj = n3;
    }
    
    const messages = [
      [{key: keysAndItems[0].key, gid: 'mygroup'}],
    ];

    const remote = {node: nodeObj, service: 'mem', method: 'get'};
    distribution.local.comm.send(messages[0], remote, (e, v) => {
      try {
        expect(e).toBeFalsy();
        expect(v).toEqual(keysAndItems[0].item);
        done();
      } catch (error) {
        done(error);
      }
    });
  };
});
let localServer = null;

beforeAll((done) => {
  // First, stop the nodes if they are running
  const remote = {service: 'status', method: 'stop'};

  remote.node = n1;
  distribution.local.comm.send([], remote, (e, v) => {
    remote.node = n2;
    distribution.local.comm.send([], remote, (e, v) => {
      remote.node = n3;
      distribution.local.comm.send([], remote, (e, v) => {
        remote.node = n4;
        distribution.local.comm.send([], remote, (e, v) => {
          remote.node = n5;
          distribution.local.comm.send([], remote, (e, v) => {
            remote.node = n6;
            distribution.local.comm.send([], remote, (e, v) => {
              startNodes();
            });
          });
        });
      });
    });
  });

  const startNodes = () => {
    // Now, start the nodes listening node
    distribution.node.start((server) => {
      localServer = server;
      // Start the nodes
      distribution.local.status.spawn(n1, (e, v) => {
        distribution.local.status.spawn(n2, (e, v) => {
          distribution.local.status.spawn(n3, (e, v) => {
            distribution.local.status.spawn(n4, (e, v) => {
              distribution.local.status.spawn(n5, (e, v) => {
                distribution.local.status.spawn(n6, (e, v) => {
                  done();
                });
              });
            });
          });
        });
      });
    });
  };
});


afterAll((done) => {
  const remote = {service: 'status', method: 'stop'};
  remote.node = n1;
  distribution.local.comm.send([], remote, (e, v) => {
    remote.node = n2;
    distribution.local.comm.send([], remote, (e, v) => {
      remote.node = n3;
      distribution.local.comm.send([], remote, (e, v) => {
        remote.node = n4;
        distribution.local.comm.send([], remote, (e, v) => {
          remote.node = n5;
          distribution.local.comm.send([], remote, (e, v) => {
            remote.node = n6;
            distribution.local.comm.send([], remote, (e, v) => {
              localServer.close();
              done();
            });
          });
        });
      });
    });
  });
});
