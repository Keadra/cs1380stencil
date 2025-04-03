jest.setTimeout(10000);
const distribution = require('../config.js');
const id = distribution.util.id;

const mygroupConfig = {gid: 'mygroup'};
const mygroupGroup = {};

/*
   This is necessary since we can not
   gracefully stop the local listening node.
   This is because the process that node is
   running in is the actual jest process
*/
let localServer = null;

const n1 = {ip: '127.0.0.1', port: 9001};
const n2 = {ip: '127.0.0.1', port: 9002};
const n3 = {ip: '127.0.0.1', port: 9003};
const n4 = {ip: '127.0.0.1', port: 9004};
const n5 = {ip: '127.0.0.1', port: 9005};
const n6 = {ip: '127.0.0.1', port: 9006};

test('(2 pts) all.comm.send(status.get(nid))', (done) => {
  const nids = Object.values(mygroupGroup).map((node) => id.getNID(node));
  const remote = {service: 'status', method: 'get'};

  console.log('=== Test 1: all.comm.send(status.get(nid)) ===');
  console.log('mygroupGroup:', mygroupGroup);
  console.log('Calculated nids:', nids);
  console.log('Remote config:', remote);

  distribution.mygroup.comm.send(['nid'], remote, (e, v) => {
    console.log('Response received:');
    console.log('Error:', e);
    console.log('Value:', v);
    
    expect(e).toEqual({});
    try {
      console.log('Testing response length. Expected:', nids.length, 'Got:', Object.values(v).length);
      expect(Object.values(v).length).toBe(nids.length);
      console.log('Testing response values. Expected to contain:', nids);
      console.log('Actual values:', Object.values(v));
      expect(Object.values(v)).toEqual(expect.arrayContaining(nids));
      done();
    } catch (error) {
      console.log('Test failed with error:', error);
      done(error);
    }
  });
});

test('(2 pts) local.comm.send(all.status.get(nid))', (done) => {
  const nids = Object.values(mygroupGroup).map((node) => id.getNID(node));
  const remote = {node: n5, service: 'groups', method: 'put'};

  console.log('=== Test 2: local.comm.send(all.status.get(nid)) ===');
  console.log('mygroupGroup:', mygroupGroup);
  console.log('Calculated nids:', nids);
  console.log('Initial remote config for put:', remote);

  // first register mygroup on n5
  distribution.local.comm.send([mygroupConfig, mygroupGroup], remote, (e, v) => {
    console.log('Group registration response:');
    console.log('Error:', e);
    console.log('Value:', v);
    
    const remote = {node: n5, gid: 'mygroup', service: 'status', method: 'get'};
    console.log('New remote config for get:', remote);

    // from local node, run mygroup.status.get() on n5 via send()
    distribution.local.comm.send(['nid'], remote, (e, v) => {
      console.log('Status get response:');
      console.log('Error:', e);
      console.log('Value:', v);
      console.log('Error:', e);
     expect(e).toEqual({});
      console.log('passed sdaflasjkfejalkfjlkeswjl:', remote);
      try {
        console.log('Testing response length. Expected:', nids.length, 'Got:', Object.values(v).length);
        expect(Object.values(v).length).toBe(nids.length);
        console.log('Testing response values. Expected to contain:', nids);
        console.log('Actual values:', Object.values(v));
        expect(Object.values(v)).toEqual(expect.arrayContaining(nids));
        done();
      } catch (error) {
        console.log('Test failed with error:', error);
        done(error);
      }
    });
  });
});

test('(2 pts) all.comm.send(status.get(random))', (done) => {
  const remote = {service: 'status', method: 'get'};

  console.log('=== Test 3: all.comm.send(status.get(random)) ===');
  console.log('mygroupGroup:', mygroupGroup);
  console.log('Remote config:', remote);

  distribution.mygroup.comm.send(['random'], remote, (e, v) => {
    console.log('Response received:');
    console.log('Error:', e);
    console.log('Value:', v);

    try {
      Object.keys(mygroupGroup).forEach((sid) => {
        console.log(`Testing error for sid ${sid}`);
        expect(e[sid]).toBeDefined();
        expect(e[sid]).toBeInstanceOf(Error);
      });
      expect(v).toEqual({});

      done();
    } catch (error) {
      console.log('Test failed with error:', error);
      done(error);
    }
  });
});

beforeAll((done) => {
  console.log('[beforeAll] Starting test setup...');
  // First, stop the nodes if they are running
  const remote = {service: 'status', method: 'stop'};
 
  remote.node = n1;
  console.log('[beforeAll] Stopping n1...');
  distribution.local.comm.send([], remote, (e, v) => {
    console.log('[beforeAll] n1 stopped, e=', e, 'v=', v);
    remote.node = n2;
    console.log('[beforeAll] Stopping n2...');
    distribution.local.comm.send([], remote, (e, v) => {
      console.log('[beforeAll] n2 stopped, e=', e, 'v=', v);
      remote.node = n3;
      console.log('[beforeAll] Stopping n3...');
      distribution.local.comm.send([], remote, (e, v) => {
        console.log('[beforeAll] n3 stopped, e=', e, 'v=', v);
        remote.node = n4;
        console.log('[beforeAll] Stopping n4...');
        distribution.local.comm.send([], remote, (e, v) => {
          console.log('[beforeAll] n4 stopped, e=', e, 'v=', v);
          remote.node = n5;
          console.log('[beforeAll] Stopping n5...');
          distribution.local.comm.send([], remote, (e, v) => {
            console.log('[beforeAll] n5 stopped, e=', e, 'v=', v);
            remote.node = n6;
            console.log('[beforeAll] Stopping n6...');
            distribution.local.comm.send([], remote, (e, v) => {
              console.log('[beforeAll] n6 stopped, e=', e, 'v=', v);
              console.log('[beforeAll] All nodes stopped, starting initialization...');
              startNodes();
            });
          });
        });
      });
    });
  });
 
  const startNodes = () => {
    console.log('[beforeAll] Setting up groups...');
    mygroupGroup[id.getSID(n1)] = n1;
    mygroupGroup[id.getSID(n2)] = n2;
    mygroupGroup[id.getSID(n3)] = n3;
    mygroupGroup[id.getSID(n4)] = n4;
    mygroupGroup[id.getSID(n5)] = n5;
 
    console.log('[beforeAll] mygroupGroup setup complete:', mygroupGroup);
 
    const groupInstantiation = () => {
      console.log('[beforeAll] Starting group instantiation...');
      // Create the groups
      distribution.local.groups
          .put(mygroupConfig, mygroupGroup, (e, v) => {
            console.log('[beforeAll] Group put complete, e=', e, 'v=', v);
            console.log('[beforeAll] Setup complete, calling done()');
            done();
          });
    };
 
    // Now, start the nodes listening node
    console.log('[beforeAll] Starting local node...');
    distribution.node.start((server) => {
      console.log('[beforeAll] Local node started, server=', server);
      localServer = server;
 
      // Start the nodes
      console.log('[beforeAll] Spawning nodes...');
      distribution.local.status.spawn(n1, (e, v) => {
        console.log('[beforeAll] n1 spawned, e=', e, 'v=', v);
        distribution.local.status.spawn(n2, (e, v) => {
          console.log('[beforeAll] n2 spawned, e=', e, 'v=', v);
          distribution.local.status.spawn(n3, (e, v) => {
            console.log('[beforeAll] n3 spawned, e=', e, 'v=', v);
            distribution.local.status.spawn(n4, (e, v) => {
              console.log('[beforeAll] n4 spawned, e=', e, 'v=', v);
              distribution.local.status.spawn(n5, (e, v) => {
                console.log('[beforeAll] n5 spawned, e=', e, 'v=', v);
                distribution.local.status.spawn(n6, (e, v) => {
                  console.log('[beforeAll] n6 spawned, e=', e, 'v=', v);
                  console.log('[beforeAll] All nodes spawned, starting group instantiation...');
                  groupInstantiation();
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


