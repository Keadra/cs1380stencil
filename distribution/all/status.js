
const status = function(config) {
  const context = {};
  context.gid = config.gid || 'all';


  function aggregateNumericValues(results, key) {
    return Object.values(results).reduce((sum, value) => {
      return sum + (typeof value === 'number' ? value : 0);
    }, 0);
  }

  return {
    get: (configuration, callback) => {
      console.log('=== all status get called ===');
      console.log('configuration:', configuration);
      console.log('context.gid:', context.gid);
      
      if (!callback) return;
    
      console.log('Sending distributed request...');
      global.distribution[context.gid].comm.send(
        [configuration],
        { service: 'status', method: 'get' },
        (error, results) => {
          console.log('Entering callback');
          console.log('Error:', error);
          console.log('Results:', results);
          
          try {
            if (configuration === 'heapTotal' || configuration === 'heapUsed') {
              console.log('Processing heap metrics');
              callback({}, aggregateNumericValues(results, configuration));
            } 
            else if (configuration === 'nid' || configuration === 'pid') {
              console.log('Processing nid/pid');
              console.log('Results before callback:', results);
              callback({}, results);
            }
            else {

              callback(error, results);
            }
            

          } catch (err) {
            console.error('Error in if-else statement:', err);
            callback(err);
          }
        }
      );
    },

    spawn: (configuration, callback) => {
      if (!callback) return;
      global.distribution.local.status.spawn(configuration, (error, newNode) => {
        if (error) {
          callback(error);
          return;
        }
          global.distribution[context.gid].groups.add(context.gid, newNode, (errAdd) => {
            if (errAdd) {
              callback(errAdd);
              return;
            }
            callback(null, newNode);
          });
      });
    },
    stop: (callback) => {
      if (!callback) return;
      global.distribution[context.gid].comm.send(
        [],
        { service: 'status', method: 'stop' },
        (error) => {
          if (error) {
            callback(error);
            return;
          }
            global.distribution.local.status.stop((errLocal) => {
              if (errLocal) {
                callback(errLocal);
                return;
              }
              callback(null, true);
            });
        }
      );
    },
  };
};

module.exports = status;

