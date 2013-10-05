var http = require('http');

http.createServer(function(req, res){
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.write('You have hit the server.<br />');
    res.end(JSON.stringify(req.headers, true, 2));
}).listen(2015);
