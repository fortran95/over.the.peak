var _config_ = {
    clientListenPort: 2014,
    serverListenPort: 2015,
    serverHost: 'localhost',
};

var http = require('http');

http.createServer(function(request, response){
    response.end('good job.' + JSON.stringify(request.headers));
}).listen(_config_.serverListenPort);
