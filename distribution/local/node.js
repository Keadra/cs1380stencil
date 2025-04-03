const http = require('http');
const url = require('url');
const log = require('../util/log');
const serialization = require('../util/serialization');

if (!global.toLocal) {
  global.toLocal = {};
}

const start = function(callback) {
  if (!global.distribution) {
    global.distribution = {};
  }
  if (!global.distribution.local) {
    global.distribution.local = {};
  }
  if (!global.distribution.local.status) {
    global.distribution.local.status = require('./status');
  }
  if (!global.distribution.local.routes) {
    global.distribution.local.routes = require('./routes');
  }
  if (!global.distribution.local.comm) {
    global.distribution.local.comm = require('./comm');
  }
  if (!global.distribution.local.groups) {
    global.distribution.local.groups = require('./groups');
  }

  if (!global.distribution.all) {
    global.distribution.all = {
      comm: require('../all/comm')({ gid: 'all' }),
      status: require('../all/status')({ gid: 'all' }),
      groups: require('../all/groups')({ gid: 'all' }),
      routes: require('../all/routes')({ gid: 'all' }),
    };
  }

  const server = http.createServer((req, res) => {
    if (req.method !== 'PUT') {
      res.statusCode = 405;
      return res.end('PUT request only');
    }

    const parsedUrl = url.parse(req.url, true);
    const pathSegments = parsedUrl.pathname.split('/').filter(Boolean);

    let gid, serviceName, methodName;
    if (pathSegments.length === 2) {
      [serviceName, methodName] = pathSegments;
      gid = 'local'; 
    } else if (pathSegments.length === 3) {
      [gid, serviceName, methodName] = pathSegments;
    } else {
      res.statusCode = 400;
      return res.end('Invalid path format');
    }

    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });

    req.on('end', () => {
      let payload;
      try {
        payload = serialization.deserialize(JSON.parse(body));
      } catch (error) {
        res.statusCode = 400;
        const errorResponse = serialization.serialize([error, null]);
        return res.end(JSON.stringify(errorResponse));
      }

      if (global.toLocal && serviceName in global.toLocal) {
        const rpcFunc = global.toLocal[serviceName];
        delete global.toLocal[serviceName];
        
        try {
          rpcFunc(...payload);
          const successResponse = serialization.serialize([null, true]);
          res.statusCode = 200;
          return res.end(JSON.stringify(successResponse));
        } catch (error) {
          const errorResponse = serialization.serialize([error, null]);
          res.statusCode = 500;
          return res.end(JSON.stringify(errorResponse));
        }
      }

      const groupObj = global.distribution[gid];
      if (!groupObj) {
        const errorResponse = serialization.serialize([new Error(`Group not found: ${gid}`), null]);
        res.statusCode = 404;
        return res.end(JSON.stringify(errorResponse));
      }

      const service = groupObj[serviceName];
      if (!service || typeof service[methodName] !== 'function') {
        const errorResponse = serialization.serialize([new Error(`Service not found: ${serviceName}.${methodName}`), null]);
        res.statusCode = 404;
        return res.end(JSON.stringify(errorResponse));
      }

      service[methodName](...payload, (error, result) => {
        const response = serialization.serialize([error, result]);
        res.statusCode = error instanceof Error ? 500 : 200;
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify(response));
      });
    });
  });

  server.listen(global.nodeConfig.port, global.nodeConfig.ip, () => {
    log(`Server running at http://${global.nodeConfig.ip}:${global.nodeConfig.port}/`);

    if (!global.distribution.node) {
      global.distribution.node = {};
    }
    global.distribution.node.server = server;

    const onStart = global.nodeConfig.onStart;
    if (typeof onStart === 'function') {
      onStart(server);
    }

    if (callback) {
      callback(server);
    }
  });

  server.on('error', (error) => {
    log(`Server error: ${error}`);
    if (callback) {
      callback(error);
    }
  });
};

module.exports = {
  start,
};