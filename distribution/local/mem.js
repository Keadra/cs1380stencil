
const id = require('../util/id');
const storage = {};

function put(state, configuration, callback) {
    try {
        let key, gid;
        
        if (typeof configuration === 'string') {
            key = configuration;
            gid = 'default';
        } else if (configuration === null) {
            key = id.getID(state);
            gid = 'default';
        } else if (typeof configuration === 'object') {
            key = configuration.key;
            gid = configuration.gid || 'default';
            
            if (key === null) {
                key = id.getID(state);
            }
        } else {
            return callback(new Error('Invalid configuration'), null);
        }
        
        const compositeKey = `${gid}:${key}`;
        
        storage[compositeKey] = state;
        
        callback(null, state);
    } catch (error) {
        callback(error, null);
    }
}

function get(configuration, callback) {
    try {
        if (configuration === null) {
            const result = {};
            Object.keys(storage).forEach(compositeKey => {
                const parts = compositeKey.split(':');
                const actualKey = parts[1];
                result[actualKey] = actualKey;
            });
            
            callback(null, result);
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
        
        const compositeKey = `${gid}:${key}`;
        
        const value = storage[compositeKey];
        
        if (value === undefined) {
            return callback(new Error(`Object with key ${key} not found in group ${gid}`), null);
        }
        callback(null, value);
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
        
        const compositeKey = `${gid}:${key}`;
        
        const value = storage[compositeKey];
        
        if (value === undefined) {
            return callback(new Error(`Object with key ${key} not found in group ${gid}`), null);
        }
        
        delete storage[compositeKey];
        
        callback(null, value);
    } catch (error) {
        callback(error, null);
    }
}

module.exports = {put, get, del};
