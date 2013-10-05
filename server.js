x = require('./x.js');
var _config_ = {
    clientListenPort: 2014,
    serverListenPort: 2015,
    serverHost: 'localhost',
};

var http = require('http');
var buffer = require('buffer');

http.createServer(function(request, response){
    function reject401(){
        response.writeHeader(401);
        response.end('Access denied.');
    }

    /* Read HTTP header and check authentication */
    var key = request.headers['authorization'];
    if(!key){
        reject401();
        return;
    }

    /* Decrypt HTTP request info */
    var capsules = request.headers['set-cookie'];
    var capsule = false;
    for(var i=0; i<capsules.length; i++){
        var capsule = capsules[i];
        if(!capsule) continue;

        var capsuleTrim0 = capsule.indexOf('token=');
        if(capsuleTrim0 >= 0){
            var capsuleTrim1 = capsule.indexOf(';', capsuleTrim0);
            if(capsuleTrim1 >= capsuleTrim0){
                capsule = capsule.substring(capsuleTrim0 + 6, capsuleTrim1);
                break;
            }
        }
    }
    capsule = new buffer.Buffer(capsule, 'base64').toString();
    try{
        capsule = JSON.parse(capsule);
    } finally {
        if(!capsule){reject401();return;}
    }

    /* Make a HTTP request */
    var proxyRequest = http.request({
        hostname: capsule.url.hostname,
        port: capsule.url.port,
        path: capsule.url.path,
        method: capsule.method,
        headers: capsule.headers,
    });

    /* setup forwarding tunnel */
    var decryptor = new x.cipher.symmetric(key, 'decrypt');
    request.on('data', function(chunk){
        decryptor.update(chunk);
    });
    request.on('end', function(){
        decryptor.end();
    });
    decryptor.on('data', function(chunk){
        proxyRequest.write(chunk);
    });
    decryptor.on('end', function(chunk){
        proxyRequest.end(chunk);
    });

    /* setup backwarding tunnel */
    var encryptor = new x.cipher.symmetric(key, 'encrypt');
    proxyRequest.on('response', function(proxyResponse){
        /* proxy the headers */
        var encapsulated = JSON.stringify({ // TODO ENCRYPTION
            'headers': proxyResponse.headers,
            'statusCode': proxyResponse.statusCode,
        });
        encapsulated = new buffer.Buffer(encapsulated).toString('base64');
        response.writeHead(
            200,
            {
                'Cookie': 'newtoken=' + encapsulated + ';',
            }
        );

        /* proxy the content */
        proxyResponse.on('data', function(chunk){
            encryptor.update(chunk);
        });
        proxyResponse.on('end', function(){
            encryptor.end();
        });
        encryptor.on('data', function(chunk){
            response.write(chunk);
        });
        encryptor.on('end', function(chunk){
            response.end(chunk);
        });
    });

}).listen(_config_.serverListenPort);
