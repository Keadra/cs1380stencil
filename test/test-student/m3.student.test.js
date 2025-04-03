/*
    In this file, add your own test cases that correspond to functionality introduced for each milestone.
    You should fill out each test case so it adequately tests the functionality you implemented.
    You are left to decide what the complexity of each test case should be, but trivial test cases that abuse this flexibility might be subject to deductions.

    Imporant: Do not modify any of the test headers (i.e., the test('header', ...) part). Doing so will result in grading penalties.
*/

const distribution = require('../../config.js');
const id = distribution.util.id;

const testNode1 = {ip: '127.0.0.1', port: 9001};
const testNode2 = {ip: '127.0.0.1', port: 9002};
const testNode3 = {ip: '127.0.0.1', port: 9003};
const testNodes = [testNode1, testNode2, testNode3];

let localTestServer = null;

beforeAll((done) => {
  distribution.node.start((server) => {
    localTestServer = server;
    
    function startNextNode(index) {
      if (index >= testNodes.length) {
        done();
        return;
      }
      
      distribution.local.status.spawn(testNodes[index], (err) => {
        if (err) {
          done(err);
          return;
        }
        startNextNode(index + 1);
      });
    }
    
    startNextNode(0);
  });
});

afterAll((done) => {

  function stopNextNode(index) {
    if (index >= testNodes.length) {
      if (localTestServer) localTestServer.close();
      done();
      return;
    }

    const remote = {
      node: testNodes[index],
      service: 'status',
      method: 'stop'
    };

    distribution.local.comm.send([], remote, (err) => {
      stopNextNode(index + 1);
    });
  }
  
  stopNextNode(0);
});

test('(1 pts) student test', (done) => {

  const testGroup = {};
  const sid1 = id.getSID(testNode1);
  const sid2 = id.getSID(testNode2);
  
  testGroup[sid1] = testNode1;
  testGroup[sid2] = testNode2;

  const config = { gid: 'testGroup1' };

  distribution.local.groups.put(config, testGroup, (err) => {
    if (err) {
      done(err);
      return;
    }
    distribution.local.groups.rem('testGroup1', testNode1, (err, removedGroup) => {
      if (err) {
        done(err);
        return;
      }

      try {
        expect(Object.keys(removedGroup)).toContain(sid2);
        done();
      } catch (error) {
        done(error);
      }
    });
  });
});

test('(1 pts) student test', (done) => {
  const group1 = {};
  group1[id.getSID(testNode1)] = testNode1;

  const config = { gid: 'group1' };

  distribution.local.status.spawn(testNode1, (spawnErr) => {
    if (spawnErr) {
      done(spawnErr);
      return;
    }

    distribution.local.groups.put(config, group1, (err) => {
      if (err) {
        done(err);
        return;
      }
      setTimeout(() => {
        distribution.group1.status.get('nid', (err, result) => {
          try {
            expect(result).toBeDefined();
            expect(Object.keys(result).length).toBeGreaterThan(0);
            done();
          } catch (error) {
            done(error);
          }
        });
      }, 100);
    });
  });
});

test('(1 pts) student test', (done) => {
  const groupName = 'localTestGroup';
  const testNode = {ip: '127.0.0.1', port: 8080};
  const groupData = {
    [id.getSID(testNode)]: testNode
  };
  distribution.local.groups.put(groupName, groupData, (err, putResult) => {
    if (err) {
      done(err);
      return;
    }

    expect(putResult).toEqual(groupData);

    distribution.local.groups.get(groupName, (err, getResult) => {
      try {
        expect(err).toBeNull();
        expect(getResult).toEqual(groupData);
        done();
      } catch (error) {
        done(error);
      }
    });
  });
});
test('(1 pts) student test', (done) => {
  const invalidNode = { ip: '127.0.0.1', port: 9999 };
  
  const message = ['nid'];
  const remote = {
    node: invalidNode,
    service: 'status',
    method: 'get'
  };

  distribution.local.comm.send(message, remote, (err, result) => {
    try {
      expect(err).toBeTruthy();
      expect(result || {}).toEqual({});
      done();
    } catch (error) {
      done(error);
    }
  });
});


test('(1 pts) student test', (done) => {
  const testNode = testNode1; 
  const config = { gid: 'testGroup5' };
  const group = { [id.getSID(testNode)]: testNode };

  distribution.local.groups.put(config, group, (err) => {
    if (err) {
      done(err);
      return;
    }

    const statusRequests = ['nid', 'sid', 'ip'].map(statusType => 
      new Promise((resolve) => {
        distribution.testGroup5.status.get(statusType, (err, result) => {
          resolve({ statusType, err, result });
        });
      })
    );

    Promise.all(statusRequests).then(results => {
      try {
        results.forEach(({ statusType, result }) => {
          expect(result).toBeDefined();
          expect(Object.keys(result).length).toBeGreaterThan(0);
        });
        done();
      } catch (error) {
        done(error);
      }
    });
  });
});