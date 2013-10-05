x = require('./x.js');

var _config_ = {
    clientListenPort: 2014,
    serverListenPort: 2015,
    serverHost: 'localhost',
};

var http = require('http');
var buffer = require('buffer');
var url = require('url');

http.createServer(function(request, response){
    /* determine a key */
    var key = 'balabalabalabala';

    /* encapsulate true request's header */
    var parsedURL = url.parse(request.url);
    var encapsulated = JSON.stringify({ // TODO ENCRYPTION
        'method': request.method,
        'url': parsedURL,
        'headers': request.headers,
    });
    encapsulated = new buffer.Buffer(encapsulated).toString('base64');

    try{
        /* send request, and using POST to send our capsule */
        var proxyRequest = http.request({
            hostname: _config_.serverHost,
            port: _config_.serverListenPort,
            path: '/',
            method: 'POST',
            headers: {
                'Set-Cookie': 'token=' + encapsulated + '; test=2;',
                'Authorization': key,
            },
        });
        var decryptor = new x.cipher.symmetric(key, 'decrypt');
        var encryptor = new x.cipher.symmetric(key, 'encrypt');
        request.addListener('data', function(chunk){
            encryptor.update(chunk);
        });
        encryptor.addListener('data', function(chunk){
            proxyRequest.write(chunk);
        });
        request.addListener('end', function(){
            proxyRequest.end();
        });

        /* wait for response */
        proxyRequest.addListener('response', function(proxyResponse){
            proxyResponse.addListener('data', function(chunk){
                console.log(chunk.toString());
                decryptor.update(chunk.toString());
            });
            proxyResponse.addListener('end', function(){
                response.end();
            });
            decryptor.on('data', function(chunk){
                response.write(chunk);
            });
        });
    } catch(e) {
        response.end('Following error occured: ' + e.toString());
    }

}).listen(_config_.clientListenPort);
