const distribution = require('../config.js');
const id = distribution.util.id;

test('(1 pts) all.mem.put(jcarb)/mygroup.mem.get(jcarb)', (done) => {
  const user = {first: 'John', last: 'Carberry'};
  const key = 'jcarbmpmg';

  distribution.all.mem.put(user, key, (e, v) => {
    distribution.mygroup.mem.get(key, (e, v) => {
      try {
        expect(e).toBeInstanceOf(Error);
        expect(v).toBeFalsy();
        done();
      } catch (error) {
        done(error);
      }
    });
  });
});

test('(1 pts) all.mem.get(jcarb)', (done) => {
  distribution.mygroup.mem.get('jcarb', (e, v) => {
    try {
      expect(e).toBeInstanceOf(Error);
      expect(v).toBeFalsy();
      done();
    } catch (error) {
      done(error);
    }
  });
});

test('(1 pts) all.mem.del(jcarb)', (done) => {
  distribution.mygroup.mem.del('jcarb', (e, v) => {
    try {
      expect(e).toBeInstanceOf(Error);
      expect(v).toBeFalsy();
      done();
    } catch (error) {
      done(error);
    }
  });
});

test('(1 pts) all.mem.put(jcarb)', (done) => {
  const user = {first: 'Josiah', last: 'Carberry'};
  const key = 'jcarbmp';

  distribution.mygroup.mem.put(user, key, (e, v) => {
    try {
      expect(e).toBeFalsy();
      expect(v).toEqual(user);
      done();
    } catch (error) {
      done(error);
    }
  });
});

test('(1 pts) all.mem.put/get(jcarb)', (done) => {
  const user = {first: 'Josiah', last: 'Carberry'};
  const key = 'jcarbmpg';

  console.log("===== TEST: all.mem.put/get(jcarb) =====");
  console.log("distribution.mygroup:", distribution.mygroup ? "exists" : "undefined");
  console.log("distribution.mygroup.mem:", distribution.mygroup && distribution.mygroup.mem ? "exists" : "undefined");
  
  // 打印组和节点信息
  distribution.local.groups.get("mygroup", (err, nodes) => {
    console.log("mygroup nodes:", err ? "Error: " + err.message : JSON.stringify(nodes, null, 2));
    
    // 检查每个节点的有效性
    if (!err && nodes) {
      for (const sid in nodes) {
        const node = nodes[sid];
        console.log(`Node ${sid}:`, node ? JSON.stringify(node) : "undefined");
        if (node) {
          console.log(`Node ${sid} has ip:`, node.ip ? "yes" : "no");
          console.log(`Node ${sid} has port:`, node.port ? "yes" : "no");
        }
      }
    }
    
    // 继续执行测试
    distribution.mygroup.mem.put(user, key, (e, v) => {
      console.log("mem.put result:", e ? "Error: " + e.message : "Success");
      if (e) console.log("mem.put error stack:", e.stack);
      
      distribution.mygroup.mem.get(key, (e, v) => {
        console.log("mem.get result:", e ? "Error: " + e.message : "Success");
        if (e) console.log("mem.get error stack:", e.stack);
        
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
});

test('(1 pts) all.mem.put/del(jcarb)', (done) => {
  const user = {first: 'Josiah', last: 'Carberry'};
  const key = 'jcarbmpd';

  console.log("===== TEST: all.mem.put/del(jcarb) =====");
  
  distribution.mygroup.mem.put(user, key, (e, v) => {
    console.log("mem.put result:", e ? "Error: " + e.message : "Success");
    if (e) console.log("mem.put error stack:", e.stack);
    
    distribution.mygroup.mem.del(key, (e, v) => {
      console.log("mem.del result:", e ? "Error: " + e.message : "Success");
      if (e) console.log("mem.del error stack:", e.stack);
      
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

test('(1 pts) all.mem.put/del/get(jcarb)', (done) => {
  const user = {first: 'Josiah', last: 'Carberry'};
  const key = 'jcarbmpdg';

  console.log("===== TEST: all.mem.put/del/get(jcarb) =====");
  
  distribution.mygroup.mem.put(user, key, (e, v) => {
    console.log("mem.put result:", e ? "Error: " + e.message : "Success");
    if (e) console.log("mem.put error stack:", e.stack);
    
    distribution.mygroup.mem.del(key, (e, v) => {
      console.log("mem.del result:", e ? "Error: " + e.message : "Success");
      if (e) console.log("mem.del error stack:", e.stack);
      
      distribution.mygroup.mem.get(key, (e, v) => {
        console.log("mem.get result:", e ? "Error: " + e.message : "Success");
        if (e) console.log("mem.get error stack:", e.stack);
        
        try {
          expect(e).toBeInstanceOf(Error);
          expect(v).toBeFalsy();
          done();
        } catch (error) {
          done(error);
        }
      });
    });
  });
});

test('(1 pts) all.mem.put(no key)', (done) => {
  const user = {first: 'Josiah', last: 'Carberry'};

  distribution.mygroup.mem.put(user, null, (e, v) => {
    distribution.mygroup.mem.get(id.getID(user), (e, v) => {
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

test(
    '(1 pts) all.mem.put()/local.comm.send(mem.get())',
    (done) => {
      const user = {first: 'Gus', last: 'Fring'};
      const key = 'gfringmpcs';
      const kid = id.getID(key);
      const nodes = Object.values(group1Group);
      const nids = nodes.map((node) => id.getNID(node));

      distribution.group1.mem.put(user, key, (e, v) => {
        const nid = id.consistentHash(kid, nids);
        const pickedNode = nodes.filter((node) => id.getNID(node) === nid)[0];
        const remote = {node: pickedNode, service: 'mem', method: 'get'};
        const message = [{gid: 'group1', key: key}];

        distribution.local.comm.send(message, remote, (e, v) => {
          try {
            expect(e).toBeFalsy();
            expect(v).toEqual(user);
            done();
          } catch (error) {
            done(error);
          }
        });
      });
    },
);

test('(1 pts) all.mem.put()/othergroup.mem.get()', (done) => {
  const user = {first: 'Gus', last: 'Fring'};
  const key = 'gfringmpmg';

  distribution.all.mem.put(user, key, (e, v) => {
    distribution.mygroup.mem.get(key, (e, v) => {
      try {
        expect(e).toBeInstanceOf(Error);
        expect(v).toBeFalsy();
        done();
      } catch (error) {
        done(error);
      }
    });
  });
});

test('(1 pts) all.mem.get()', (done) => {
  distribution.mygroup.mem.get('gfring', (e, v) => {
    try {
      expect(e).toBeInstanceOf(Error);
      expect(v).toBeFalsy();
      done();
    } catch (error) {
      done(error);
    }
  });
});

test('(1 pts) all.mem.del()', (done) => {
  distribution.mygroup.mem.del('gfring', (e, v) => {
    try {
      expect(e).toBeInstanceOf(Error);
      expect(v).toBeFalsy();
      done();
    } catch (error) {
      done(error);
    }
  });
});

test('(1 pts) all.mem.put()', (done) => {
  const user = {first: 'Gus', last: 'Fring'};
  const key = 'gfringmp';

  distribution.mygroup.mem.put(user, key, (e, v) => {
    expect(e).toBeFalsy();
    try {
      expect(v).toEqual(user);
      done();
    } catch (error) {
      done(error);
    }
  });
});

test('(1 pts) all.mem.put/get()', (done) => {
  const user = {first: 'Gus', last: 'Fring'};
  const key = 'gfringmpg';

  distribution.mygroup.mem.put(user, key, (e, v) => {
    distribution.mygroup.mem.get(key, (e, v) => {
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

test('(1 pts) all.mem.put/del()', (done) => {
  const user = {first: 'Gus', last: 'Fring'};
  const key = 'gfringmpd';

  distribution.mygroup.mem.put(user, key, (e, v) => {
    distribution.mygroup.mem.del(key, (e, v) => {
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

test('(1 pts) all.mem.put/del/get()', (done) => {
  const user = {first: 'Gus', last: 'Fring'};
  const key = 'gfringmpdg';

  distribution.mygroup.mem.put(user, key, (e, v) => {
    distribution.mygroup.mem.del(key, (e, v) => {
      distribution.mygroup.mem.get(key, (e, v) => {
        try {
          expect(e).toBeInstanceOf(Error);
          expect(v).toBeFalsy();
          done();
        } catch (error) {
          done(error);
        }
      });
    });
  });
});

test('(3 pts) all.mem.get(no key)', (done) => {
  const users = [
    {first: 'Saul', last: 'Goodman'},
    {first: 'Walter', last: 'White'},
    {first: 'Jesse', last: 'Pinkman'},
  ];
  const keys = [
    'sgoodmanmgnk',
    'wwhitemgnk',
    'jpinkmanmgnk',
  ];

  distribution.mygroup.mem.put(users[0], keys[0], (e, v) => {
    try {
      expect(e).toBeFalsy();
    } catch (error) {
      done(error);
    }
    distribution.mygroup.mem.put(users[1], keys[1], (e, v) => {
      try {
        expect(e).toBeFalsy();
      } catch (error) {
        done(error);
      }
      distribution.mygroup.mem.put(users[2], keys[2], (e, v) => {
        try {
          expect(e).toBeFalsy();
        } catch (error) {
          done(error);
        }
        distribution.mygroup.mem.get(null, (e, v) => {
          try {
            expect(e).toEqual({});
            expect(Object.values(v)).toEqual(expect.arrayContaining(keys));
            done();
          } catch (error) {
            done(error);
          }
        });
      });
    });
  });
});

test('(3 pts) all.mem.put(no key)', (done) => {
  const user = {first: 'Gus', last: 'Fring'};

  distribution.mygroup.mem.put(user, null, (e, v) => {
    distribution.mygroup.mem.get(id.getID(user), (e, v) => {
      expect(e).toBeFalsy();
      try {
        expect(v).toEqual(user);
        done();
      } catch (error) {
        done(error);
      }
    });
  });
});


/*
  Testing infrastructure code.
*/

// This group is used for testing most of the functionality
const mygroupGroup = {};
// These groups are used for testing hashing
const group1Group = {};
const group2Group = {};
const group3Group = {};
// This group is used for {adding,removing} {groups,nodes}
const group4Group = {};

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
  // 添加调试信息
  console.log("===== SETUP: Setting up test environment =====");
  console.log("Node definitions:");
  console.log("n1:", n1);
  console.log("n2:", n2);
  console.log("n3:", n3);
  console.log("n4:", n4);
  console.log("n5:", n5);
  console.log("n6:", n6);

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
            });
          });
        });
      });
    });
  });

  mygroupGroup[id.getSID(n1)] = n1;
  mygroupGroup[id.getSID(n2)] = n2;
  mygroupGroup[id.getSID(n3)] = n3;

  group1Group[id.getSID(n4)] = n4;
  group1Group[id.getSID(n5)] = n5;
  group1Group[id.getSID(n6)] = n6;

  group2Group[id.getSID(n1)] = n1;
  group2Group[id.getSID(n3)] = n3;
  group2Group[id.getSID(n5)] = n5;

  group3Group[id.getSID(n2)] = n2;
  group3Group[id.getSID(n4)] = n4;
  group3Group[id.getSID(n6)] = n6;

  group4Group[id.getSID(n1)] = n1;
  group4Group[id.getSID(n2)] = n2;
  group4Group[id.getSID(n4)] = n4;

  // 打印组信息
  console.log("Group definitions:");
  console.log("mygroupGroup:", mygroupGroup);
  console.log("group1Group:", group1Group);
  console.log("group2Group:", group2Group);
  console.log("group3Group:", group3Group);
  console.log("group4Group:", group4Group);

  // Now, start the base listening node
  distribution.node.start((server) => {
    localServer = server;
    console.log("Local server started");

    const groupInstantiation = (e, v) => {
      console.log("Starting group instantiation");
      const mygroupConfig = {gid: 'mygroup'};
      const group1Config = {gid: 'group1', hash: id.naiveHash};
      const group2Config = {gid: 'group2', hash: id.consistentHash};
      const group3Config = {gid: 'group3', hash: id.rendezvousHash};
      const group4Config = {gid: 'group4'};

      // Create some groups
      distribution.local.groups
          .put(mygroupConfig, mygroupGroup, (e, v) => {
            console.log("mygroup created:", e ? "Error: " + e.message : "Success");
            distribution.local.groups
                .put(group1Config, group1Group, (e, v) => {
                  console.log("group1 created:", e ? "Error: " + e.message : "Success");
                  distribution.local.groups
                      .put(group2Config, group2Group, (e, v) => {
                        console.log("group2 created:", e ? "Error: " + e.message : "Success");
                        distribution.local.groups
                            .put(group3Config, group3Group, (e, v) => {
                              console.log("group3 created:", e ? "Error: " + e.message : "Success");
                              distribution.local.groups
                                  .put(group4Config, group4Group, (e, v) => {
                                    console.log("group4 created:", e ? "Error: " + e.message : "Success");
                                    
                                    // 检查分布式对象结构
                                    console.log("Checking distribution object structure:");
                                    console.log("distribution keys:", Object.keys(distribution));
                                    if (distribution.mygroup) {
                                      console.log("distribution.mygroup keys:", Object.keys(distribution.mygroup));
                                      console.log("distribution.mygroup.mem exists:", !!distribution.mygroup.mem);
                                    } else {
                                      console.log("distribution.mygroup is undefined");
                                    }
                                    
                                    console.log("===== SETUP: Test environment ready =====");
                                    done();
                                  });
                            });
                      });
                });
          });
    };

    // Start the nodes
    distribution.local.status.spawn(n1, (e, v) => {
      distribution.local.status.spawn(n2, (e, v) => {
        distribution.local.status.spawn(n3, (e, v) => {
          distribution.local.status.spawn(n4, (e, v) => {
            distribution.local.status.spawn(n5, (e, v) => {
              distribution.local.status.spawn(n6, groupInstantiation);
            });
          });
        });
      });
    });
  });
});

afterAll((done) => {
  distribution.mygroup.status.stop((e, v) => {
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
});
