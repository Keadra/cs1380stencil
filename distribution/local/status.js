
const id = require('../util/id');
const log = require('../util/log');
const util = require('../util/util');
const {fork} = require('child_process');
/// <reference types="@brown-ds/distribution" />
const status = {};

global.moreStatus = {
  sid: id.getSID(global.nodeConfig),
  nid: id.getNID(global.nodeConfig),
  counts: 0,
};

status.get = function(configuration, callback) {
  callback = callback || function() { };
  if (configuration === 'nid') {           
    callback(null, global.moreStatus.nid);
    return;
  }
  if (configuration === 'sid') {            
    callback(null, global.moreStatus.sid);
    return;
  }
  if (configuration === 'ip') {            
    callback(null, global.nodeConfig.ip);
    return;
  }
  if (configuration === 'port') {           
    callback(null, global.nodeConfig.port);
    return;
  }
  if (configuration === 'counts') {          
    callback(null, global.moreStatus.counts);
    return;
  }
  if (configuration === 'heapTotal') {            
    callback(null, process.memoryUsage().heapTotal);
    return;
  }
  if (configuration === 'heapUsed') {          
    callback(null, process.memoryUsage().heapUsed);
    return;
  }            

  return callback(new Error('Status key not found'), {});
};
status.spawn = require('@brown-ds/distribution/distribution/local/status').spawn; 
status.stop = require('@brown-ds/distribution/distribution/local/status').stop; 
module.exports = status;

