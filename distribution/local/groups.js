const id = require('../util/id'); 

const groups = {};


groups.get = function(name, callback) {
    if (groups[name]) {
      if (callback)callback(null, groups[name]);
      } else {
        if (callback)callback(new Error("Group " + name + " not found"));
      }
};


groups.put = function(config, group, callback) {
  let groupName;
  let hashFunction;

  if (typeof config === 'string') {
    groupName = config;
    hashFunction = global.distribution.util.id.naiveHash; // 默认哈希函数
  } else if (typeof config === 'object' && config.gid) {
    groupName = config.gid;
    hashFunction = config.hash || global.distribution.util.id.naiveHash;
  } else {
    return callback(new Error("Invalid configuration for group"));
  }

  groups[groupName] = group;

  if (typeof distribution !== 'undefined') {
    distribution[groupName] = {};
    distribution[groupName].comm = require('../all/comm.js')({ gid: groupName, nodes: group });
    distribution[groupName].status = require('../all/status.js')({ gid: groupName, nodes: group });
    distribution[groupName].routes = require('../all/routes.js')({ gid: groupName, nodes: group });
    distribution[groupName].groups = require('../all/groups.js')({ gid: groupName, nodes: group });
    distribution[groupName].mr = require('../all/mr.js')({ gid: groupName, nodes: group });

    // 添加 mem 和 store 服务
    distribution[groupName].mem = require('../all/mem.js')({ 
      gid: groupName, 
      hash: hashFunction,
      nodes: group 
    });
    
    distribution[groupName].store = require('../all/store.js')({ 
      gid: groupName, 
      hash: hashFunction,
      nodes: group 
    });
  }

  
    callback(null, group);
};

groups.del = function(name, callback) {
    if (groups[name]) {
        const removed = groups[name];
        delete groups[name];
        callback(null, removed);
      } else {
        callback(new Error("Group " + name + " not found"));
      }
};


groups.add = function(name, node, callback) {
    if (groups[name]) {
        const sid = id.getSID(node);
        groups[name][sid] = node;
        if (callback) callback(null, groups[name]);
      } else {
        if (callback) callback(null, null);
      }
};


groups.rem = function(name, node, callback) {
    if (groups[name]) {
        if (groups[name][node]) {
          delete groups[name][node];
        }
        if (callback) callback(null, groups[name]); 
      } else {
        if (callback) callback(new Error("Group " + name + " not found"), {}); 
      }
      
};

module.exports = groups;
