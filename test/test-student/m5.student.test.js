const distribution = require('../../config.js');
const id = distribution.util.id;

const ncdcGroup = {};
const n1 = {ip: '127.0.0.1', port: 7110};
const n2 = {ip: '127.0.0.1', port: 7111};
const n3 = {ip: '127.0.0.1', port: 7112};

let localServer = null;


test('(1 pts) student test', (done) => {
  const mapper = (key, value) => {
    return [{ word_count: value.split(/\s+/).filter(w => w.length > 0).length }];
  };

  const reducer = (key, values) => {
    return { [key]: values.reduce((a, b) => a + b, 0) };
  };
  const testData = {"test_key": "This is a test sentence"};
  const key = Object.keys(testData)[0];
  
  distribution.ncdc.store.put(testData[key], key, (err) => {
    if (err) {
      done(err);
      return;
    }
    
    distribution.ncdc.mr.exec({
      keys: [key], 
      map: mapper, 
      reduce: reducer
    }, (err, result) => {
      if (err) {
        done(err);
        return;
      }
      
      try {
        expect(result[0].word_count).toBe(5);
        done();
      } catch (e) {
        done(e);
      }
    });
  });
});
test('(1 pts) student test', (done) => {
  const mapper = (key, value) => {
    return [{ max_test: parseInt(value) }];
  };

  const reducer = (key, values) => {
    return { [key]: Math.max(...values) };
  };
  const testData = [
    {"num1": "5"},
    {"num2": "3"},
    {"num3": "9"},
    {"num4": "1"}
  ];
  let savedCount = 0;
  const keys = [];
  
  testData.forEach(item => {
    const key = Object.keys(item)[0];
    keys.push(key);
    
    distribution.ncdc.store.put(item[key], key, () => {
      savedCount++;
      
      if (savedCount === testData.length) {
        distribution.ncdc.mr.exec({
          keys: keys,
          map: mapper,
          reduce: reducer
        }, (err, result) => {
          if (err) {
            done(err);
            return;
          }
          
          try {
            expect(result[0].max_test).toBe(9);
            done();
          } catch (e) {
            done(e);
          }
        });
      }
    });
  });
});

test('(1 pts) student test', (done) => {
  const mapper = (key, value) => {
    return [{ [key]: value }];
  };

  const reducer = (key, values) => {
    return { combined: values.join('-') };
  };
  const testData = [
    {"part1": "Hello"},
    {"part2": "World"},
    {"part3": "MapReduce"}
  ];
  let savedCount = 0;
  const keys = [];
  
  testData.forEach(item => {
    const key = Object.keys(item)[0];
    keys.push(key);
    
    distribution.ncdc.store.put(item[key], key, () => {
      savedCount++;
      
      if (savedCount === testData.length) {
        distribution.ncdc.mr.exec({
          keys: keys,
          map: mapper,
          reduce: reducer
        }, (err, result) => {
          if (err) {
            done(err);
            return;
          }
          
          try {
            expect(result[0].combined).toBe("World");
            done();
          } catch (e) {
            done(e);
          }
        });
      }
    });
  });
});
test('(1 pts) student test', (done) => {
  const mapper = (key, value) => {
    return [{ count: 1 }];
  };

  const reducer = (key, values) => {
    // 计算总数
    return { total: values.reduce((a, b) => a + b, 0) };
  };
  const testData = [
    {"item1": "anything"},
    {"item2": "anything"},
    {"item3": "anything"}
  ];
  
  let savedCount = 0;
  const keys = [];
  
  testData.forEach(item => {
    const key = Object.keys(item)[0];
    keys.push(key);
    
    distribution.ncdc.store.put(item[key], key, () => {
      savedCount++;
      
      if (savedCount === testData.length) {
        distribution.ncdc.mr.exec({
          keys: keys,
          map: mapper,
          reduce: reducer
        }, (err, result) => {
          if (err) {
            done(err);
            return;
          }
          
          try {
            expect(result[0].total).toBe(3);
            done();
          } catch (e) {
            done(e);
          }
        });
      }
    });
  });
});

test('(1 pts) student test', (done) => {
  const mapper = (key, value) => {
    const number = parseInt(value);
    if (number % 2 === 0) {
      return [{ doubled: number * 2 }];
    }
    return [];
  };

  const reducer = (key, values) => {
    return { [key]: values };
  };

  const testData = [
    {"num1": "1"},
    {"num2": "2"}, 
    {"num3": "3"}, 
    {"num4": "4"}, 
    {"num5": "6"}  
  ];
  let savedCount = 0;
  const keys = [];
  
  testData.forEach(item => {
    const key = Object.keys(item)[0];
    keys.push(key);
    
    distribution.ncdc.store.put(item[key], key, () => {
      savedCount++;
      
      if (savedCount === testData.length) {
        distribution.ncdc.mr.exec({
          keys: keys,
          map: mapper,
          reduce: reducer
        }, (err, result) => {
          if (err) {
            done(err);
            return;
          }
          
          try {
            expect(result[0].doubled).toContain(4);
            expect(result[0].doubled).toContain(8);
            expect(result[0].doubled).toContain(12);
            expect(result[0].doubled.length).toBe(3);
            done();
          } catch (e) {
            done(e);
          }
        });
      }
    });
  });
});

beforeAll((done) => {
  ncdcGroup[id.getSID(n1)] = n1;
  ncdcGroup[id.getSID(n2)] = n2;
  ncdcGroup[id.getSID(n3)] = n3;
  const startNodes = (cb) => {
    distribution.local.status.spawn(n1, (e, v) => {
      distribution.local.status.spawn(n2, (e, v) => {
        distribution.local.status.spawn(n3, (e, v) => {
          cb();
        });
      });
    });
  };
  distribution.node.start((server) => {
    localServer = server;
    const ncdcConfig = {gid: 'ncdc'};
    startNodes(() => {
      distribution.local.groups.put(ncdcConfig, ncdcGroup, (e, v) => {
        distribution.ncdc.groups.put(ncdcConfig, ncdcGroup, (e, v) => {
          distribution.ncdc.store.get(null, (e, keys) => {
            if (e || !keys || keys.length === 0) {
              done();
              return;
            }
            
            let cleanedCount = 0;
            keys.forEach(key => {
              distribution.ncdc.store.del(key, () => {
                cleanedCount++;
                if (cleanedCount === keys.length) {
                  done();
                }
              });
            });
          });
        });
      });
    });
  });
});

afterAll((done) => {
  const remote = {service: 'status', method: 'stop'};
  
  remote.node = n1;
  distribution.local.comm.send([], remote, (e, v) => {
    remote.node = n2;
    distribution.local.comm.send([], remote, (e, v) => {
      remote.node = n3;
      distribution.local.comm.send([], remote, (e, v) => {
        if (localServer) {
          localServer.close();
        }
        done();
      });
    });
  });
});
