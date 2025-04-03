/** @typedef {import("../types").Callback} Callback */


function comm(config) {
  const context = {};
  context.gid = config.gid || 'all';
  function send(message, configuration, callback) {
    callback = callback || function() { };

    global.distribution.local.groups.get(context.gid, (error, nodes) => {
      if (error || !nodes) {
        callback(new Error(`Failed to get nodes for group ${context.gid}`), {});
        return;
      }

      const nodeCount = Object.keys(nodes).length;
      if (nodeCount === 0) {
        callback({}, {});
        return;
      }

      const values = {};
      const errors = {};
      let responseCount = 0;

      const handleResponse = (nodeId) => {
        return (error, result) => {
          responseCount++;
          if (error) {
            errors[nodeId] = error;
          } 
          values[nodeId] = result;
          
          if (responseCount === nodeCount) {
           const hasErrors = Object.values(errors).some(error => {
            return error !== null && 
                     error instanceof Error;
                     
            });
            const hasValues = Object.values(values).some(value => {
              return value !== null && 
                     Object.keys(value).length > 0;
            });
            callback(hasErrors ? errors : {}, hasValues?  values : {});
          }
        };
      };

      for (const [nodeId, node] of Object.entries(nodes)) {
        const remote = {
          node: node,
          service: configuration.service,
          method: configuration.method
        };

        global.distribution.local.comm.send(message, remote, handleResponse(nodeId));
      }
    });
  }

  return { send };
}

module.exports = comm;