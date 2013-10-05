module.exports = {
    
    cipher: {
        symmetric: require('./lib/cipher.js'),
    },

    output: {
        
        reject401: function (response){
            if(!response) return;
            response.writeHeader(401);
            response.end('Access denied.');
        }
    },

};
