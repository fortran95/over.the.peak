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
    console.log(JSON.stringify(capsule));

    /* Make a HTTP request */
    var proxyRequest = http.request({
        hostname: capsule.url.hostname,
        port: capsule.url.port,
        path: capsule.url.path,
        method: capsule.method,
        headers: capsule.headers,
    });

    var decryptor = new x.cipher.symmetric(key, 'decrypt');
    var encryptor = new x.cipher.symmetric(key, 'encrypt');
    request.on('data', function(chunk){
        decryptor.update(chunk);
    });
    request.on('end', function(){
        proxyRequest.end();
    });
    decryptor.on('data', function(chunk){
        proxyRequest.write();
    });

    proxyRequest.addListener('response', function(proxyResponse){
        proxyResponse.on('data', function(chunk){
            console.log(chunk.toString());
            encryptor.update(chunk);
        });
        proxyResponse.on('end', function(){
            response.end();
        });
        encryptor.on('data', function(chunk){
            response.write(chunk);
        });
    });

}).listen(_config_.serverListenPort);
