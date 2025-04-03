/** @typedef {import("../types").Callback} Callback */

function routes(config) {
  const context = {};
  context.gid = config.gid || 'all';

  function put(service, name, callback = () => { }) {
    global.distribution.local.groups.get(context.gid, (error, nodes) => {
      if (error || !nodes) {
        callback(error || new Error('Failed to get nodes'));
        return;
      }
  
      const results = {};
      const errors = {};
  
      Object.entries(nodes).forEach(([sid, node]) => {
        global.distribution[context.gid].comm.send(
          [service, name],
          {
            node: node,
            service: 'routes',
            method: 'put'
          },
          (error, result) => {
            if (error) {
              errors[sid] = error;
            } else {
              results[sid] = result;
            }
            if (Object.keys(errors).length + Object.keys(results).length === Object.keys(nodes).length) {
              callback(Object.keys(errors).length > 0 ? errors : null, results);
            }
          }
        );
      });
    });
  }

  function rem(service, name, callback = () => { }) {
    global.distribution[context.gid].comm.send(
      [service, name],
      { service: 'routes', method: 'rem' },
      (error, results) => {
        if (error) {
          callback(error);
          return;
        }
        callback(null, results);
      }
    );
  }

  return { put, rem };
}

module.exports = routes;
