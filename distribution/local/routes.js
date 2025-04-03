/** @typedef {import("../types").Callback} Callback */

const serviceMap = {};

function get(configuration, callback) {
    callback = callback || function() { };

    let serviceName;
    if (typeof configuration === 'string') {
        serviceName = configuration;
    } else if (typeof configuration === 'object' && configuration.service) {
        serviceName = configuration.service;
    } else {
        callback(new Error('Invalid configuration'));
        return;
    }

    if (!(serviceName in serviceMap)) {
        const rpc = global.toLocal[serviceName];
        if (rpc) {
            callback(null, { call: rpc });
            return;
        } else {
            callback(new Error(`Service ${serviceName} not found!`));
            return;
        }
    }

    if (serviceMap.hasOwnProperty(serviceName)) {
        callback(null, serviceMap[serviceName]);
    } else {
        callback(new Error(`Service ${serviceName} not found in routes`));
    }
}

function put(service, configuration, callback) {
    callback = callback || function() { };

    if (typeof configuration === 'string') {

        serviceMap[configuration] = service;
        callback(null, configuration);
    } else if (typeof service === 'object') {
        const results = [];
        for (const key in service) {
            if (service.hasOwnProperty(key)) {
                serviceMap[key] = service[key];
                results.push(key);
            }
        }
        callback(null, results);
    } else {
        callback(new Error('Invalid input'));
    }
}
function rem(configuration, callback) {
    callback = callback || function() { };

    const serviceKey = `local/${configuration}`;
    if (serviceMap.hasOwnProperty(serviceKey)) {
        delete serviceMap[serviceKey];
        callback(null, true);
    } else {
        callback(new Error('Service not found'));
    }
}

module.exports = { get, put, rem };
