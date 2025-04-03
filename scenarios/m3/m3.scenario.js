const distribution = require('../../config.js');
const id = distribution.util.id;

const n1 = {ip: '127.0.0.1', port: 8000};
const n2 = {ip: '127.0.0.1', port: 8001};
const n3 = {ip: '127.0.0.1', port: 8002};
const allNodes = [n1, n2, n3];


test('(5 pts) (scenario) create group', (done) => {
/*
    Create a group with the nodes n1, n2, and n3.
    Then, fetch their NIDs using the distributed status service.
*/

  const groupA = {};
  groupA[id.getSID(n1)] = n1;
  // Add nodes n2 and n3 to the group...
  groupA[id.getSID(n2)] = n2; 
  groupA[id.getSID(n3)] = n3;

  const nids = Object.values(allNodes).map((node) => id.getNID(node));
  const config = { gid: 'groupA' };

  // Use distribution.local.groups.put to add groupA to the local node
  // Note: The groupA.status.get call should be inside the put method's callback.
  distribution.local.groups.put(config, groupA, (e, v) => {
    if (e) {
      done(e);
      return;
    }
    distribution.groupA.status.get('nid', (e, v) => {
      expect(Object.values(v)).toEqual(expect.arrayContaining(nids));
      done();
    });
    });
});

test('(5 pts) (scenario) dynamic group membership', (done) => {
  /*
    Dynamically add a node (n3) to groupB after the group is initially created
    with nodes n1 and n2. Validate that the distributed status service reflects
    the updated group membership on all nodes.
  */
  const groupB = {};
  const initialNodes = [n1, n2];
  const allNodes = [n1, n2, n3];
  
  initialNodes.forEach((node) => {
    groupB[id.getSID(node)] = node;
  });
  
  const config = {gid: 'groupB'};
  
  distribution.local.groups.put(config, groupB, (e, v) => {
    
    groupB[id.getSID(n3)] = n3;
    distribution.local.groups.put(config, groupB, (e, v) => {
      
  
      distribution.groupB.status.get('nid', (e, v) => {
  
        try {
          expect(Object.values(v)).toEqual(expect.arrayContaining(
              allNodes.map((node) => id.getNID(node))));
          done();
        } catch (error) {
          done(error);
        }
      });
    });
  });
  });


  test('(5 pts) (scenario) group relativity', (done) => {
    /*
        Make it so that node n1 sees group groupC as containing only n2.
        while node n2 sees group groupC as containing n1 and n2.
    */
      const groupC = {};
      groupC[id.getSID(n1)] = n1;
      groupC[id.getSID(n2)] = n2;
      const initialNodes = [n1, n2];
    
      const config = {gid: 'groupC'};
    
      distribution.local.groups.put(config, groupC, (e, v) => {
        distribution.groupC.groups.put(config, groupC, (e, v) => {
          const remote = {node: n1, service: 'groups', method: 'rem'};
          distribution.local.comm.send(['groupC', n1], remote, (e, v) => {
            distribution.groupC.groups.get('groupC', (e, v) => {
              const n1View = v[id.getSID(n1)];
              const n2View = v[id.getSID(n2)];
              try {
                expect(Object.keys(n2View)).toEqual(expect.arrayContaining(
                    [id.getSID(n1), id.getSID(n2)],
                ));
                expect(Object.keys(n1View)).toEqual(expect.arrayContaining(
                    [id.getSID(n2)],
                ));
                done();
              } catch (error) {
                done(error);
              }
            });
          });
        });
      });
    });
  
  test('(5 pts) (scenario) use the gossip service', (done) => {

    const groupD = {};
    let nExpected = 0;

    allNodes.forEach(node => {
      groupD[id.getSID(node)] = node;
    });
  
    // Configure gossip to use subset of 2 nodes
    const config = {
      gid: 'groupD',
      subset: (lst) => Math.min(2, lst.length)
    };
  
    distribution.local.groups.put('groupD', groupD, (e, v) => {
      distribution.groupD.groups.put(config, groupD, (e, v) => {
 
        distribution.groupD.groups.put('newgroup', {}, (e, v) => {
          const newNode = {ip: '127.0.0.1', port: 4444};
          const message = ['newgroup', newNode];
          const remote = {service: 'groups', method: 'add'};
          
          distribution.groupD.gossip.send(message, remote, (e, v) => {
            setTimeout(() => {
              distribution.groupD.groups.get('newgroup', (e, v) => {
                let count = 0;
                for (const k in v) {
                  if (Object.keys(v[k]).length > 0) {
                    count++;
                  }
                }
                try {
                  expect(count).toBeGreaterThanOrEqual(nExpected);
                  done();
                } catch (error) {
                  done(error);
                }
              });
            }, 1000);
          });
        });
      });
    });
  });

/*
    This is the setup for the test scenario.
    Do not modify the code below.
*/

let localServer = null;

function startAllNodes(callback) {
  distribution.node.start((server) => {
    localServer = server;

    function startStep(step) {
      if (step >= allNodes.length) {
        callback();
        return;
      }

      distribution.local.status.spawn(allNodes[step], (e, v) => {
        if (e) {
          callback(e);
        }
        startStep(step + 1);
      });
    }
    startStep(0);
  });
}


function stopAllNodes(callback) {
  const remote = {method: 'stop', service: 'status'};

  function stopStep(step) {
    if (step == allNodes.length) {
      callback();
      return;
    }

    if (step < allNodes.length) {
      remote.node = allNodes[step];
      distribution.local.comm.send([], remote, (e, v) => {
        stopStep(step + 1);
      });
    }
  }

  if (localServer) localServer.close();
  stopStep(0);
}

beforeAll((done) => {
  // Stop any leftover nodes
  stopAllNodes(() => {
    startAllNodes(done);
  });
});

afterAll((done) => {
  stopAllNodes(done);
});

