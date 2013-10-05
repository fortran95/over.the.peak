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

        /* setup upload tunnel */
        var encryptor = new x.cipher.symmetric(key, 'encrypt');
        request.on('data', function(chunk){
            encryptor.update(chunk);
        });
        request.on('end', function(){
            encryptor.end();
        });
        encryptor.on('data', function(chunk){
            proxyRequest.write(chunk);
        });
        encryptor.on('end', function(chunk){
            proxyRequest.end(chunk);
        });

        /* setup download tunnel */
        var decryptor = new x.cipher.symmetric(key, 'decrypt');
        proxyRequest.on('response', function(proxyResponse){
            /* Decrypt HTTP request info */
            var capsule = proxyResponse.headers['cookie'];

            var capsuleTrim0 = capsule.indexOf('newtoken=');
            if(capsuleTrim0 >= 0){
                var capsuleTrim1 = capsule.indexOf(';', capsuleTrim0);
                if(capsuleTrim1 >= capsuleTrim0){
                    capsule = capsule.substring(capsuleTrim0 + 9, capsuleTrim1);
                }
            }

            capsule = new buffer.Buffer(capsule, 'base64').toString();
            try{
                capsule = JSON.parse(capsule);
            } finally {
                if(!capsule){x.output.reject401(response);return;}
            }

            /* write http response header */
            response.writeHeader(
                capsule.statusCode,
                capsule.headers
            );

            proxyResponse.on('data', function(chunk){
                decryptor.update(chunk);
            });
            proxyResponse.on('end', function(){
                decryptor.end();
            });
            decryptor.on('data', function(chunk){
                response.write(chunk);
            });
            decryptor.on('end', function(chunk){
                response.end(chunk);
            });
        });
    } catch(e) {
        response.end('Following error occured: ' + e.toString());
    }

}).listen(_config_.clientListenPort);
