// DNS resolver override to resolve MongoDB Atlas SRV & shard records reliably
const dns = require('dns');
const { Resolver } = require('dns');

dns.setDefaultResultOrder('ipv4first');
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (e) {}

const dnsResolver = new Resolver();
try {
  dnsResolver.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (e) {}

const origLookup = dns.lookup;
dns.lookup = function (hostname, options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }
  dnsResolver.resolve4(hostname, (err, addresses) => {
    if (!err && addresses && addresses.length > 0) {
      if (options && options.all) {
        return callback(null, addresses.map(addr => ({ address: addr, family: 4 })));
      }
      return callback(null, addresses[0], 4);
    }
    return origLookup(hostname, options, callback);
  });
};

module.exports = { dnsResolver };
