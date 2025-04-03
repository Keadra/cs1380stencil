const http = require('http');

function send(message, remote, callback) {
  callback = callback || function() {};


  const gid = remote.gid || 'local';
  const path = `/${gid}/${remote.service}/${remote.method}`;
  const options = {
    hostname: remote.node.ip,
    port: remote.node.port,
    path,
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
  };
  const payload = distribution.util.serialize(message);

  const req = http.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => { 
      data += chunk; 
    });

    res.on('end', () => {
      if (res.statusCode !== 200) {
      callback(new Error(`HTTP ${res.statusCode}: ${data}`), null);
        return;
      }


        const deserialized = distribution.util.deserialize(JSON.parse(data));
        const [error, result] = deserialized;
        if (error instanceof Error) {
          callback(error, null);
        } else {
          if (remote.service === 'status' || remote.service === 'groups') {
          callback({}, result);
        }else{
        callback(null, result);
        }
      }
    });

    res.on('error', (err) => {
      callback(err, null);
    });
  });

  req.on('error', (error) => {
    callback(error, null);
  });

  req.write(JSON.stringify(payload));
  req.end();
}

module.exports = { send };