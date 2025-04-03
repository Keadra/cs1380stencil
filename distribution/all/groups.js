/** @typedef {import("../types").Callback} Callback */


const groups = function(config) {
  const context = {};
  context.gid = config.gid || 'all';
  context.nodes = config.nodes; 

  return {
    put: (config, group, callback) => {
      distributedCall(context, "put", [config, group], callback);
    },

    del: (name, callback) => {
      distributedCall(context, "del", [name], callback);
    },

    get: (name, callback) => {
      distributedCall(context, "get", [name], callback);
    },

    add: (name, node, callback) => {
      distributedCall(context, "add", [name, node], callback);
    },

    rem: (name, node, callback) => {
      distributedCall(context, "rem", [name, node], callback);
    },
  };
};
function distributedCall(context, methodName, message, callback) {
  const localComm = require("../local/comm.js"); 
  
  const results = {}; 
  const errors = {};  
  const sids = Object.keys(context.nodes);
  let completed = 0;
  const total = sids.length;
  
  if (total === 0) {
    return callback(null, results);
  }
  
  sids.forEach((sid) => {
    const nodeObj = context.nodes[sid];
    const remote = {
      node: nodeObj,
      service: "groups",
      method: methodName,
    };
    localComm.send(message, remote, (err, value) => {
      completed++;
      if (err instanceof Error) {
        errors[sid] = err;
      } else {
        results[sid] = value;
      }
      if (completed === total) {
        if (Object.keys(errors).length > 0) {
          callback(errors, results);
        } else {
          callback({}, results);
        }
      }
    });
  });
}

module.exports = groups;
