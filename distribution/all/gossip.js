// const gossip = function(config) {
//   const context = {};
//   context.gid = config.gid || 'all';
//   context.subset = config.subset || function(lst) {
//     return Math.ceil(Math.log(lst.length));
//   };

//   return {
//     send: (payload, remote, callback) => {
//     },

//     at: (period, func, callback) => {
//     },

//     del: (intervalID, callback) => {
//     },
//   };
// };

const gossip = require('@brown-ds/distribution/distribution/all/gossip'); 

module.exports = gossip;
