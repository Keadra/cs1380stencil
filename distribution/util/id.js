/** @typedef {import("../types.js").Node} Node */

const assert = require('assert');
const crypto = require('crypto');

// The ID is the SHA256 hash of the JSON representation of the object
/** @typedef {!string} ID */

/**
 * @param {any} obj
 * @return {ID}
 */
function getID(obj) {
  const hash = crypto.createHash('sha256');
  hash.update(JSON.stringify(obj));
  return hash.digest('hex');
}

/**
 * The NID is the SHA256 hash of the JSON representation of the node
 * @param {Node} node
 * @return {ID}
 */
function getNID(node) {
  node = {ip: node.ip, port: node.port};
  return getID(node);
}

/**
 * The SID is the first 5 characters of the NID
 * @param {Node} node
 * @return {ID}
 */
function getSID(node) {
  return getNID(node).substring(0, 5);
}


function getMID(message) {
  const msg = {};
  msg.date = new Date().getTime();
  msg.mss = message;
  return getID(msg);
}

function idToNum(id) {
  const n = parseInt(id, 16);
  assert(!isNaN(n), 'idToNum: id is not in KID form!');
  return n;
}

function naiveHash(kid, nids) {
  nids.sort();
  return nids[idToNum(kid) % nids.length];
}

function consistentHash(kid, nids) {
  // 将所有标识符（KID和NIDs）放在同一个环上
  const ring = [];
  
  // 添加KID
  ring.push({ id: kid, isKid: true });
  
  // 添加所有NIDs
  for (const nid of nids) {
    ring.push({ id: nid, isKid: false });
  }
  
  // 将所有ID转换为数值并按升序排序
  ring.sort((a, b) => {
    const aNum = idToNum(a.id);
    const bNum = idToNum(b.id);
    return aNum - bNum;
  });
  
  // 找到KID在环上的位置
  let kidIndex = -1;
  for (let i = 0; i < ring.length; i++) {
    if (ring[i].isKid) {
      kidIndex = i;
      break;
    }
  }
  
  // 如果没有找到KID或只有KID自己
  if (kidIndex === -1 || ring.length <= 1) {
    throw new Error('Invalid inputs for consistent hashing');
  }
  
  // 找到KID后面的第一个NID（循环查找）
  let nextIndex = (kidIndex + 1) % ring.length;
  
  // 如果下一个也是KID，继续找直到找到NID
  while (ring[nextIndex].isKid) {
    nextIndex = (nextIndex + 1) % ring.length;
    // 防止无限循环
    if (nextIndex === kidIndex) {
      throw new Error('No valid nodes found for consistent hashing');
    }
  }
  
  // 返回KID后面的第一个NID
  return ring[nextIndex].id;
}

function rendezvousHash(kid, nids) {
  if (nids.length === 0) {
    throw new Error('No nodes available for rendezvous hashing');
  }
  
  let maxScore = -1;
  let selectedNid = null;
  
  for (const nid of nids) {
    // 按照规定的方式组合KID和NID (kid + nid)
    const combined = kid + nid;
    
    // 计算组合字符串的哈希值
    const hash = crypto.createHash('sha256').update(combined).digest('hex');
    
    // 将哈希值转换为数值得分
    const score = idToNum(hash);
    
    // 寻找最高得分
    if (score > maxScore || maxScore === -1) {
      maxScore = score;
      selectedNid = nid;
    }
  }
  
  return selectedNid;
}

module.exports = {
  getID,
  getNID,
  getSID,
  getMID,
  naiveHash,
  consistentHash,
  rendezvousHash,
};
