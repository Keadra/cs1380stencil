jest.setTimeout(10000);
const distribution = require('../config.js');
const id = distribution.util.id;

test('(3 pts) all.groups.del(random)', (done) => {
  distribution.group4.groups.del('random', (e, v) => {
    try {
      Object.keys(group4Group).forEach((sid) => {
        expect(e[sid]).toBeDefined();
        expect(e[sid]).toBeInstanceOf(Error);
      });
      expect(v).toEqual({});
      done();
    } catch (error) {
      done(error);
    }
  });
});

test('(2 pts) all.groups.put(browncs)', (done) => {
  const g = {
    '507aa': {ip: '127.0.0.1', port: 8080},
    '14ab0': {ip: '127.0.0.1', port: 8081},
  };

  distribution.group4.groups.put('browncsgp', g, (e, v) => {
    try {
      expect(e).toEqual({});
      Object.keys(group4Group).forEach((sid) => {
        expect(v[sid]).toEqual(g);
      });
      done();
    } catch (error) {
      done(error);
    }
  });
});

test('(2 pts) all.groups.put/get(browncs)', (done) => {
  const g = {
    '507aa': {ip: '127.0.0.1', port: 8080},
    '14ab0': {ip: '127.0.0.1', port: 8081},
  };

  distribution.group4.groups.put('browncsgpg', g, (e, v) => {
    distribution.group4.groups.get('browncsgpg', (e, v) => {
      try {
        expect(e).toEqual({});
        Object.keys(group4Group).forEach((sid) => {
          expect(v[sid]).toEqual(g);
        });
        done();
      } catch (error) {
        done(error);
      }
    });
  });
});

test('(3 pts) all.groups.put/get/del(browncs)', (done) => {
  const g = {
    '507aa': {ip: '127.0.0.1', port: 8080},
    '14ab0': {ip: '127.0.0.1', port: 8081},
  };

  distribution.group4.groups.put('browncsgpgd', g, (e, v) => {
    distribution.group4.groups.get('browncsgpgd', (e, v) => {
      distribution.group4.groups.del('browncsgpgd', (e, v) => {
        try {
          expect(e).toEqual({});
          Object.keys(group4Group).forEach((sid) => {
            expect(v[sid]).toEqual(g);
          });
          done();
        } catch (error) {
          done(error);
        }
      });
    });
  });
});

test('(3 pts) all.groups.put/get/del/get(browncs)', (done) => {
  const g = {
    '507aa': {ip: '127.0.0.1', port: 8080},
    '14ab0': {ip: '127.0.0.1', port: 8081},
  };

  distribution.group4.groups.put('browncsgpgdg', g, (e, v) => {
    distribution.group4.groups.get('browncsgpgdg', (e, v) => {
      distribution.group4.groups.del('browncsgpgdg', (e, v) => {
        distribution.group4.groups.get('browncsgpgdg', (e, v) => {
          try {
            expect(e).toBeDefined();
            Object.keys(group4Group).forEach((sid) => {
              expect(e[sid]).toBeInstanceOf(Error);
            });
            expect(v).toEqual({});
            done();
          } catch (error) {
            done(error);
          }
        });
      });
    });
  });
});

test('(3 pts) all.groups.put(dummy)/add(n1)/get(dummy)', (done) => {
  const g = {
    '507aa': {ip: '127.0.0.1', port: 8080},
    '14ab0': {ip: '127.0.0.1', port: 8081},
  };

  distribution.group4.groups.put('dummygpag', g, (e, v) => {
    const n1 = {ip: '127.0.0.1', port: 8082};

    distribution.group4.groups.add('dummygpag', n1, (e, v) => {
      const expectedGroup = {
        ...g, ...{[id.getSID(n1)]: n1},
      };

      distribution.group4.groups.get('dummygpag', (e, v) => {
        try {
          expect(e).toEqual({});
          Object.keys(group4Group).forEach((sid) => {
            expect(v[sid]).toEqual(expectedGroup);
          });
          done();
        } catch (error) {
          done(error);
        }
      });
    });
  });
});

test('(3 pts) all.groups.put(dummy)/rem(n1)/get(dummy)', (done) => {
  const g = {
    '507aa': {ip: '127.0.0.1', port: 8080},
    '14ab0': {ip: '127.0.0.1', port: 8081},
  };

  console.log('=== Test put/rem/get dummy ===');
  console.log('Initial group:', g);
  
  distribution.group4.groups.put('dummygprg', g, (e, v) => {
    console.log('After put - error:', e);
    console.log('After put - value:', v);
    
    distribution.group4.groups.rem('dummygprg', '507aa', (e, v) => {
      console.log('After rem - error:', e);
      console.log('After rem - value:', v);
      
      const expectedGroup = {
        '14ab0': {ip: '127.0.0.1', port: 8081},
      };
      console.log('Expected group after rem:', expectedGroup);

      distribution.group4.groups.get('dummygprg', (e, v) => {
        try {
          console.log('After final get - error:', e);
          console.log('After final get - value:', v);
          console.log('group4Group keys:', Object.keys(group4Group));
          
          Object.keys(group4Group).forEach((sid) => {
            console.log(`Testing sid: ${sid}`);
            console.log(`v[${sid}]:`, v[sid]);
          });
          
          expect(e).toEqual({});
          Object.keys(group4Group).forEach((sid) => {
            expect(v[sid]).toEqual(expectedGroup);
          });
          done();
        } catch (error) {
          done(error);
        }
      });
    });
  });
});
test('(2 pts) all.groups.put()', (done) => {
  const g = {
    'al57j': {ip: '127.0.0.1', port: 9092},
    'q5mn9': {ip: '127.0.0.1', port: 9093},
  };

  distribution.group4.groups.put('atlas', g, (e, v) => {
    try {
      expect(e).toEqual({});
      expect(v[id.getSID(n1)]).toEqual(g);
      done();
    } catch (error) {
      done(error);
    }
  });
});

test('(3 pts) all.groups.put/get()', (done) => {
  const g = {
    'al57j': {ip: '127.0.0.1', port: 9092},
    'q5mn9': {ip: '127.0.0.1', port: 9093},
  };

  distribution.group4.groups.put('atlas', g, (e, v) => {
    distribution.group4.groups.get('atlas', (e, v) => {
      try {
        expect(e).toEqual({});
        expect(v[id.getSID(n1)]).toEqual(g);
        done();
      } catch (error) {
        done(error);
      }
    });
  });
});

test('(3 pts) all.groups.put/get/del()', (done) => {
  const g = {
    'al57j': {ip: '127.0.0.1', port: 9092},
    'q5mn9': {ip: '127.0.0.1', port: 9093},
  };

  distribution.group4.groups.put('atlas', g, (e, v) => {
    distribution.group4.groups.get('atlas', (e, v) => {
      distribution.group4.groups.del('atlas', (e, v) => {
        try {
          expect(e).toEqual({});
          expect(v[id.getSID(n1)]).toEqual(g);
          done();
        } catch (error) {
          done(error);
        }
      });
    });
  });
});

test('(3 pts) all.groups.put/get/del/get()', (done) => {
  const g = {
    'al57j': {ip: '127.0.0.1', port: 9092},
    'q5mn9': {ip: '127.0.0.1', port: 9093},
  };

  distribution.group4.groups.put('atlas', g, (e, v) => {
    distribution.group4.groups.get('atlas', (e, v) => {
      distribution.group4.groups.del('atlas', (e, v) => {
        distribution.group4.groups.get('atlas', (e, v) => {
          try {
            expect(e).toBeDefined();
            Object.keys(e).forEach((k) => {
              expect(e[k]).toBeInstanceOf(Error);
              expect(v).toEqual({});
            });
            done();
          } catch (error) {
            done(error);
          }
        });
      });
    });
  });
});

test('(3 pts) all.groups.put()/add(n2)/get()', (done) => {
  const g = {
    'al57j': {ip: '127.0.0.1', port: 9092},
    'q5mn9': {ip: '127.0.0.1', port: 9093},
  };

  distribution.group4.groups.put('atlas', g, (e, v) => {
    const n2 = {ip: '127.0.0.1', port: 9094};

    distribution.group4.groups.add('atlas', n2, (e, v) => {
      const expectedGroup = {
        ...g, ...{[id.getSID(n2)]: n2},
      };

      distribution.group4.groups.get('atlas', (e, v) => {
        try {
          expect(e).toEqual({});
          expect(v[id.getSID(n1)]).toEqual(expectedGroup);
          done();
        } catch (error) {
          done(error);
        }
      });
    });
  });
});

test('(3 pts) all.groups.put()/rem(n2)/get()', (done) => {
  const g = {
    'al57j': {ip: '127.0.0.1', port: 9092},
    'q5mn9': {ip: '127.0.0.1', port: 9093},
  };

  console.log('=== Test put/rem/get atlas ===');
  console.log('Initial group:', g);
  
  distribution.group4.groups.put('atlas', g, (e, v) => {
    console.log('After put - error:', e);
    console.log('After put - value:', v);
    
    distribution.group4.groups.rem('atlas', 'q5mn9', (e, v) => {
      console.log('After rem - error:', e);
      console.log('After rem - value:', v);
      
      const expectedGroup = {
        'al57j': {ip: '127.0.0.1', port: 9092},
      };
      console.log('Expected group after rem:', expectedGroup);

      distribution.group4.groups.get('atlas', (e, v) => {
        try {
          console.log('After final get - error:', e);
          console.log('After final get - value:', v);
          console.log('Testing against n1 sid:', id.getSID(n1));
          console.log('Value for n1:', v[id.getSID(n1)]);
          
          expect(e).toEqual({});
          expect(v[id.getSID(n1)]).toEqual(expectedGroup);
          done();
        } catch (error) {
          done(error);
        }
      });
    });
  });
});

/* Infrastructure for the tests */

// This group is used for testing most of the functionality
const mygroupGroup = {};
// These groups are used for testing hashing
const group1Group = {};
const group2Group = {};
const group4Group = {};
const group3Group = {};

/*
   This hack is necessary since we can not
   gracefully stop the local listening node.
   This is because the process that node is
   running in is the actual jest process
*/
let localServer = null;

const n1 = {ip: '127.0.0.1', port: 8000};
const n2 = {ip: '127.0.0.1', port: 8001};
const n3 = {ip: '127.0.0.1', port: 8002};
const n4 = {ip: '127.0.0.1', port: 8003};
const n5 = {ip: '127.0.0.1', port: 8004};
const n6 = {ip: '127.0.0.1', port: 8005};


beforeAll((done) => {
  console.log('[beforeAll] Starting... Will stop nodes n1~n6 if running.');

  // First, stop the nodes if they are running
  const remote = {service: 'status', method: 'stop'};

  console.log('[beforeAll] Stop node n1...');
  remote.node = n1;
  distribution.local.comm.send([], remote, (e, v) => {
    console.log('[beforeAll] stop n1 callback e=', e, 'v=', v);

    console.log('[beforeAll] Stop node n2...');
    remote.node = n2;
    distribution.local.comm.send([], remote, (e, v) => {
      console.log('[beforeAll] stop n2 callback e=', e, 'v=', v);

      console.log('[beforeAll] Stop node n3...');
      remote.node = n3;
      distribution.local.comm.send([], remote, (e, v) => {
        console.log('[beforeAll] stop n3 callback e=', e, 'v=', v);

        console.log('[beforeAll] Stop node n4...');
        remote.node = n4;
        distribution.local.comm.send([], remote, (e, v) => {
          console.log('[beforeAll] stop n4 callback e=', e, 'v=', v);

          console.log('[beforeAll] Stop node n5...');
          remote.node = n5;
          distribution.local.comm.send([], remote, (e, v) => {
            console.log('[beforeAll] stop n5 callback e=', e, 'v=', v);

            console.log('[beforeAll] Stop node n6...');
            remote.node = n6;
            distribution.local.comm.send([], remote, (e, v) => {
              console.log('[beforeAll] stop n6 callback e=', e, 'v=', v);
              console.log('[beforeAll] Done stopping existing nodes, now set up local groups in memory...');

              mygroupGroup[id.getSID(n1)] = n1;
              mygroupGroup[id.getSID(n2)] = n2;
              mygroupGroup[id.getSID(n3)] = n3;

              group1Group[id.getSID(n4)] = n4;
              group1Group[id.getSID(n5)] = n5;
              group1Group[id.getSID(n6)] = n6;

              group4Group[id.getSID(n1)] = n1;
              group4Group[id.getSID(n3)] = n3;
              group4Group[id.getSID(n5)] = n5;

              group3Group[id.getSID(n2)] = n2;
              group3Group[id.getSID(n4)] = n4;
              group3Group[id.getSID(n6)] = n6;

              // 这里注意你重复写了group4Group? 先保留
              group4Group[id.getSID(n1)] = n1;
              group4Group[id.getSID(n2)] = n2;
              group4Group[id.getSID(n4)] = n4;

              // Now, start the base listening node
              console.log('[beforeAll] Going to start local node...');
              distribution.node.start((server) => {
                console.log('[beforeAll] distribution.node.start callback => localServer = server');
                localServer = server;

                const groupInstantiation = (err, val) => {
                  console.log('[beforeAll] groupInstantiation callback fired, e=', err, 'v=', val);
                  if (err) {
                    console.log('[beforeAll] groupInstantiation encountered error => ', err);
                  }
                  const mygroupConfig = {gid: 'mygroup'};
                  const group1Config = {gid: 'group1', hash: id.naiveHash};
                  const group2Config = {gid: 'group2', hash: id.consistentHash};
                  const group3Config = {gid: 'group3', hash: id.rendezvousHash};
                  const group4Config = {gid: 'group4'};

                  console.log('[beforeAll] About to create local.groups for mygroup, group1, group2, group3, group4...');
                  distribution.local.groups
                    .put(mygroupConfig, mygroupGroup, (e, v) => {
                      console.log('[beforeAll] put(mygroup) done => e=', e, 'v=', v);
                      distribution.local.groups
                        .put(group1Config, group1Group, (e, v) => {
                          console.log('[beforeAll] put(group1) done => e=', e, 'v=', v);
                          distribution.local.groups
                            .put(group2Config, group2Group, (e, v) => {
                              console.log('[beforeAll] put(group2) done => e=', e, 'v=', v);
                              distribution.local.groups
                                .put(group3Config, group3Group, (e, v) => {
                                  console.log('[beforeAll] put(group3) done => e=', e, 'v=', v);
                                  distribution.local.groups
                                    .put(group4Config, group4Group, (e, v) => {
                                      console.log('[beforeAll] put(group4) done => e=', e, 'v=', v);
                                      console.log('[beforeAll] All groups put => call done()');
                                      done();
                                    });
                                });
                            });
                        });
                    });
                };

                // Start the nodes
                console.log('[beforeAll] Spawning nodes n1..n6...');
                distribution.local.status.spawn(n1, (e, v) => {
                  console.log('[beforeAll] spawn(n1) callback => e=', e, 'v=', v);
                  distribution.local.status.spawn(n2, (e, v) => {
                    console.log('[beforeAll] spawn(n2) callback => e=', e, 'v=', v);
                    distribution.local.status.spawn(n3, (e, v) => {
                      console.log('[beforeAll] spawn(n3) callback => e=', e, 'v=', v);
                      distribution.local.status.spawn(n4, (e, v) => {
                        console.log('[beforeAll] spawn(n4) callback => e=', e, 'v=', v);
                        distribution.local.status.spawn(n5, (e, v) => {
                          console.log('[beforeAll] spawn(n5) callback => e=', e, 'v=', v);
                          distribution.local.status.spawn(n6, groupInstantiation);
                        });
                      });
                    });
                  });
                });
              }); // end distribution.node.start
            }); // end stop n6 callback
          }); // end stop n5 callback
        }); // end stop n4 callback
      }); // end stop n3 callback
    }); // end stop n2 callback
  }); // end stop n1 callback
});

afterAll((done) => {
  console.log('[afterAll] Starting cleanup... distribution.mygroup=', distribution.mygroup);

  // 先检查 distribution.mygroup 是否存在
  if (!distribution.mygroup || !distribution.mygroup.status) {
    console.log('[afterAll] distribution.mygroup or distribution.mygroup.status is MISSING! We skip stop...');
    done();
    return;
  }

  console.log('[afterAll] calling distribution.mygroup.status.stop()...');
  distribution.mygroup.status.stop((e, v) => {
    console.log('[afterAll] distribution.mygroup.status.stop callback => e=', e, 'v=', v);

    const remote = {service: 'status', method: 'stop'};

    console.log('[afterAll] stop n1...');
    remote.node = n1;
    distribution.local.comm.send([], remote, (e, v) => {
      console.log('[afterAll] stop n1 callback => e=', e, 'v=', v);

      console.log('[afterAll] stop n2...');
      remote.node = n2;
      distribution.local.comm.send([], remote, (e, v) => {
        console.log('[afterAll] stop n2 callback => e=', e, 'v=', v);

        console.log('[afterAll] stop n3...');
        remote.node = n3;
        distribution.local.comm.send([], remote, (e, v) => {
          console.log('[afterAll] stop n3 callback => e=', e, 'v=', v);

          console.log('[afterAll] stop n4...');
          remote.node = n4;
          distribution.local.comm.send([], remote, (e, v) => {
            console.log('[afterAll] stop n4 callback => e=', e, 'v=', v);

            console.log('[afterAll] stop n5...');
            remote.node = n5;
            distribution.local.comm.send([], remote, (e, v) => {
              console.log('[afterAll] stop n5 callback => e=', e, 'v=', v);

              console.log('[afterAll] stop n6...');
              remote.node = n6;
              distribution.local.comm.send([], remote, (e, v) => {
                console.log('[afterAll] stop n6 callback => e=', e, 'v=', v);

                console.log('[afterAll] now close localServer...');
                localServer.close();
                done();
              });
            });
          });
        });
      });
    });
  });
});


