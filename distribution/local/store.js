const fs = require('fs');
const path = require('path');
const utils = require('../util/util');
const STORAGE_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(STORAGE_DIR)) {
    fs.mkdirSync(STORAGE_DIR, { recursive: true });
}
function sanitizeKey(key) {
    return key.replace(/[^a-zA-Z0-9]/g, '_');
}
function getFilePath(gid, key) {
    const sanitizedKey = sanitizeKey(`${gid}_${key}`);
    return path.join(STORAGE_DIR, sanitizedKey);
}

function put(state, configuration, callback) {
    try {
        let key, gid;
        
        if (typeof configuration === 'string') {
            key = configuration;
            gid = 'default';
        } else if (configuration === null) {
            key = utils.id.getID(state);
            gid = 'default';
        } else if (typeof configuration === 'object') {
            key = configuration.key;
            gid = configuration.gid || 'default';
            if (key === null) {
                key = utils.id.getID(state);
            }
        } else {
            return callback(new Error('Invalid configuration'), null);
        }
        const serialized = utils.serialize(state);
        const filePath = getFilePath(gid, key);
        fs.writeFile(filePath, serialized, (err) => {
            if (err) {
                return callback(err, null);
            }
            callback(null, state);
        });
    } catch (error) {
        callback(error, null);
    }
}

function get(configuration, callback) {
    try {
        if (configuration === null) {
            fs.readdir(STORAGE_DIR, (err, files) => {
                if (err) {
                    return callback(err, null);
                }
                const result = [];
                if (files.length === 0) {
                    return callback(null, result);
                }
                
                files.forEach(file => {
                    const sanitizedKey = file;
                    const parts = sanitizedKey.split('_');
                    
                    if (parts.length > 1) {
                        const actualKey = parts.slice(1).join('_');
                        result.push(actualKey); 
                    }
                });
                
                callback(null, result);
            });
            return;
        }
        
        let key, gid;
        
        if (typeof configuration === 'string') {
            key = configuration;
            gid = 'default';
        } else if (typeof configuration === 'object') {
            key = configuration.key;
            gid = configuration.gid || 'default';
        } else {
            return callback(new Error('Invalid configuration'), null);
        }
        const filePath = getFilePath(gid, key);
        
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                if (err.code === 'ENOENT') {
                    return callback(new Error(`Object with key ${key} not found in group ${gid}`), null);
                }
                return callback(err, null);
            }
            
            try {
                const obj = utils.deserialize(data);
                callback(null, obj);
            } catch (deserializeErr) {
                callback(deserializeErr, null);
            }
        });
    } catch (error) {
        callback(error, null);
    }
}

function del(configuration, callback) {
    try {
        let key, gid;
        
        if (typeof configuration === 'string') {
            key = configuration;
            gid = 'default';
        } else if (typeof configuration === 'object') {
            key = configuration.key;
            gid = configuration.gid || 'default';
        } else {
            return callback(new Error('Invalid configuration'), null);
        }
        const filePath = getFilePath(gid, key);
        fs.readFile(filePath, 'utf8', (readErr, data) => {
            if (readErr) {
                if (readErr.code === 'ENOENT') {
                    return callback(new Error(`Object with key ${key} not found in group ${gid}`), null);
                }
                return callback(readErr, null);
            }
            
            try {
                const obj = utils.deserialize(data);
                fs.unlink(filePath, (unlinkErr) => {
                    if (unlinkErr) {
                        return callback(unlinkErr, null);
                    }
                    callback(null, obj);
                });
            } catch (deserializeErr) {
                callback(deserializeErr, null);
            }
        });
    } catch (error) {
        callback(error, null);
    }
}

module.exports = {put, get, del};
