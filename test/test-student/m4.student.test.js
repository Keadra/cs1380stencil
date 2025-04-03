/*
    In this file, add your own test cases that correspond to functionality introduced for each milestone.
    You should fill out each test case so it adequately tests the functionality you implemented.
    You are left to decide what the complexity of each test case should be, but trivial test cases that abuse this flexibility might be subject to deductions.

    Imporant: Do not modify any of the test headers (i.e., the test('header', ...) part). Doing so will result in grading penalties.
*/

const distribution = require('../../config.js');
test('(1 pts) student test', (done) => {
  const user = {first: 'John', last: 'Doe'};
  const key = 'jdoetest';
  
  const mygroupNodes = {
    node1: {ip: '127.0.0.1', port: 8001},
    node2: {ip: '127.0.0.1', port: 8002}
  };
  const config = {gid: 'mygroup'};
  
  distribution.local.groups.put(config, mygroupNodes, (e, v) => {
    distribution.all.mem.put(user, key, (e, v) => {

      distribution.mygroup.mem.get(key, (e, v) => {
        try {
          expect(e).toBeTruthy();
          expect(v).toBeFalsy();
          done();
        } catch (error) {
          done(error);
        }
      });
    });
  });
});

test('(1 pts) student test', (done) => {
  const mygroupNodes = {
    node1: {ip: '127.0.0.1', port: 8001},
    node2: {ip: '127.0.0.1', port: 8002}
  };
  const config = {gid: 'mygroup'};
  
  distribution.local.groups.put(config, mygroupNodes, (e, v) => {
    distribution.mygroup.store.del('nonexistent_key', (e, v) => {
      try {
        expect(e).toBeTruthy();
        expect(v).toBeFalsy();
        done();
      } catch (error) {
        done(error);
      }
    });
  });
});

test('(1 pts) student test', (done) => {
  const user = {first: 'Alice', last: 'Smith'};
  
  distribution.local.mem.put(user, null, (e, v) => {
    distribution.local.mem.get(distribution.util.id.getID(user), (e, v) => {
      try {
        expect(e).toBeFalsy();
        expect(v).toEqual(user);
        done();
      } catch (error) {
        done(error);
      }
    });
  });
});

test('(1 pts) student test', (done) => {
  const key = 'consistent_key';
  const kid = distribution.util.id.getID(key);
  
  const nodeIds1 = [
    distribution.util.id.getNID({ip: '192.168.1.1', port: 8000}),
    distribution.util.id.getNID({ip: '192.168.1.2', port: 8000}),
    distribution.util.id.getNID({ip: '192.168.1.3', port: 8000})
  ];
  
  const nodeIds2 = [
    ...nodeIds1,
    distribution.util.id.getNID({ip: '192.168.1.4', port: 8000})
  ];
  
  const node1 = distribution.util.id.consistentHash(kid, nodeIds1);
  const node2 = distribution.util.id.consistentHash(kid, nodeIds2);
  
  try {
    if (nodeIds1.includes(node2)) {
      expect(node1).toBe(node2);
    }
    done();
  } catch (error) {
    done(error);
  }
});

test('(1 pts) student test', (done) => {
  const user = {first: 'Bob', last: 'Johnson'};
  const key = 'bjohnson';
  
  distribution.local.store.put(user, key, (e, v) => {
    try {
      expect(e).toBeFalsy();
      expect(v).toEqual(user);
    
      distribution.local.store.get(key, (e, v) => {
        expect(e).toBeFalsy();
        expect(v).toEqual(user);
      
        distribution.local.store.del(key, (e, v) => {
          expect(e).toBeFalsy();
          expect(v).toEqual(user);
          
          done();
        });
      });
    } catch (error) {
      done(error);
    }
  });
});
