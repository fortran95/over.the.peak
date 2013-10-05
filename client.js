var httpProxy = require('http-proxy');

httpProxy.createServer(function(req, res, proxy){
    var buffer = httpProxy.buffer(req);
    setTimeout(function(){
        proxy.proxyRequest(req, res, {
            host: 'localhost',
            port: 2015,
            buffer: buffer,
        });
    }, 10000);
}).listen(2014);
