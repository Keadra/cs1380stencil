function store(config) {
  const context = {};
  context.gid = config.gid || 'all';
  context.hash = config.hash || global.distribution.util.id.naiveHash;

  const getGroupNodes = (callback) => {
    global.distribution.local.groups.get(context.gid, (err, nodesObj) => {
      if (err) return callback(err, null);
      
      const nids = [];
      const nodeMap = {}; 
      
      for (const sid in nodesObj) {
        if (Object.prototype.hasOwnProperty.call(nodesObj, sid)) {
          const node = nodesObj[sid];
          // 使用id.getNID获取节点的NID
          const nid = global.distribution.util.id.getNID(node);
          nids.push(nid);
          nodeMap[nid] = node; 
        }
      }
      
      if (nids.length === 0) {
        return callback(new Error(`No nodes in group ${context.gid}`), null);
      }
      
      callback(null, nids, nodeMap);
    });
  };

  const getResponsibleNode = (key, requestGid, callback) => {
    if (requestGid && requestGid !== context.gid) {
      return callback(new Error(`Access denied: Cannot access group ${context.gid} data from group ${requestGid}`), null);
    }
    const kid = global.distribution.util.id.getID(key);
    
    getGroupNodes((err, nids, nodeMap) => {
      if (err) return callback(err, null);
      
      try {
        const nodeId = context.hash(kid, nids);
        
        const node = nodeMap[nodeId];
        
        if (!node) {
          return callback(new Error(`Node with ID ${nodeId} not found in group ${context.gid}`), null);
        }
        
        callback(null, node);
      } catch (error) {
        callback(error, null);
      }
    });
  };

  return {
    get: (configuration, callback) => {
      if (configuration === null) {
        global.distribution.local.groups.get(context.gid, (err, nodes) => {
          if (err) return callback(err, null);
          
          const allKeys = {};
          let pendingRequests = Object.keys(nodes).length;
          
          if (pendingRequests === 0) {
            return callback({}, {});
          }
          
          for (const sid in nodes) {
            const node = nodes[sid];
            const remote = {
              node: node,
              service: 'store',
              method: 'get'
            };
            
            global.distribution.local.comm.send([null], remote, (err, result) => {
              pendingRequests--;
              
              if (!err && result) {
                if (Array.isArray(result)) {
                  result.forEach(key => {
                    allKeys[key] = key;
                  });
                } 
                else if (typeof result === 'object') {
                  Object.assign(allKeys, result);
                }
              }
              
              if (pendingRequests === 0) {
                const keysArray = Object.keys(allKeys);
                callback({}, keysArray);
              }
            });
          }
        });
        return;
      }
      let key, requestGid;
      if (typeof configuration === 'string') {
        key = configuration;
      } else if (typeof configuration === 'object') {
        key = configuration.key;
        requestGid = configuration.gid;
      }
      
      if (!key) {
        return callback(new Error('Invalid key'), null);
      }

      if (context.gid !== 'all' && requestGid && requestGid !== context.gid) {

        return callback(new Error(`Access denied: Cannot access group ${context.gid} data from group ${requestGid}`), null);
      }

      getResponsibleNode(key, requestGid, (err, node) => {
        if (err) return callback(err, null);
        
        const message = [{ key, gid: context.gid }];
        const remote = {
          node: node,
          service: 'store',
          method: 'get'
        };
        
        global.distribution.local.comm.send(message, remote, (err, result) => {

          if (err) {
            return callback(err, null);
          }
          
          if (!result || Object.keys(result).length === 0) {
            return callback(new Error(`Object with key ${key} not found in group ${context.gid}`), null);
          }
          
          callback(null, result);
        });
      });
    },

    put: (state, configuration, callback) => {
      let key, requestGid;
      
      if (typeof configuration === 'string') {
        key = configuration;
      } else if (configuration === null) {
        try {
          key = global.distribution.util.id.getID(state);
        } catch (error) {
          return callback(error, null);
        }
      } else if (typeof configuration === 'object') {
        key = configuration.key;
        requestGid = configuration.gid;
        
        if (key === null) {
          try {
            key = global.distribution.util.id.getID(state);
          } catch (error) {
            return callback(error, null);
          }
        }
      } else {
        return callback(new Error('Invalid configuration'), null);
      }
      if (context.gid !== 'all' && requestGid && requestGid !== context.gid) {
        return callback(new Error(`Access denied: Cannot access group ${context.gid} data from group ${requestGid}`), null);
      }

      getResponsibleNode(key, requestGid, (err, node) => {
        if (err) return callback(err, null);
        
        const message = [state, { key, gid: context.gid }];
        const remote = {
          node: node,
          service: 'store',
          method: 'put'
        };
        
        global.distribution.local.comm.send(message, remote, callback);
      });
    },

    del: (configuration, callback) => {
      let key, requestGid;
      
      if (typeof configuration === 'number') {
        key = String(configuration);
      } else if (typeof configuration === 'string') {
        key = configuration;
      } else if (configuration && typeof configuration === 'object') {
        key = configuration.key;
        requestGid = configuration.gid;
      }
      
      if (!key) {
        return callback(new Error('Invalid key'), null);
      }

      if (context.gid !== 'all' && requestGid && requestGid !== context.gid) {
        return callback(new Error(`Access denied: Cannot access group ${context.gid} data from group ${requestGid}`), null);
      }

      getResponsibleNode(key, requestGid, (err, node) => {
        if (err) return callback(err, null);
        
        const message = [{ key, gid: context.gid }];
        const remote = {
          node: node,
          service: 'store',
          method: 'del'
        };
        
        global.distribution.local.comm.send(message, remote, callback);
      });
    },

    reconf: (configuration, callback) => {
      if (configuration.gid) {
        context.gid = configuration.gid;
      }
      
      if (configuration.hash) {
        context.hash = configuration.hash;
      }
      callback(null, { success: true, message: `Reconfigured store service for group ${context.gid}` });
    },
  };
}

module.exports = store;
