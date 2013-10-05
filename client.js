var _config_ = {
    clientListenPort: 2014,
    serverListenPort: 2015,
    serverHost: 'localhost',
};

var http = require('http');

http.createServer(function(request, response){

    /* encapsulate true request's header */
    var encapsulated = JSON.stringify({ // TODO ENCRYPTION
        'method': request.method,
        'url': request.url,
        'headers': request.headers,
        'key': 'balabalabalabala',
    });

    try{
        /* send request, and using POST to send our capsule */
        var proxyRequest = http.request({
            hostname: _config_.serverHost,
            port: _config_.serverListenPort,
            path: '/',
            method: 'POST',
            headers: {
                'Stuff': encapsulated,
            },
        });
        request.addListener('data', function(chunk){
            /* When client receives some data,
             * proceed to forward it to our server. */
            proxyRequest.write(chunk, 'binary');
        });
        request.addListener('end', function(){
            proxyRequest.end();
        });

        /* wait for response */
        proxyRequest.addListener('response', function(proxyResponse){
            proxyResponse.addListener('data', function(chunk){
                response.write(chunk);
            });
            proxyResponse.addListener('end', function(){
                response.end();
            });
        });
    } catch(e) {
        response.end('Following error occured: ' + e.toString());
    }

}).listen(_config_.clientListenPort);
