var events = require('events');
var util = require('util');
var buffer = require('buffer');
var crypto = require('crypto');
function cipher(key, mode){
    var self = this;
    this.crypto = null;
    
    if(mode == 'encrypt'){
        this.crypto = crypto.createCipher('aes256', key); 
    } else if(mode == 'decrypt'){
        this.crypto = crypto.createDecipher('aes256', key); 
    } else
        return false;

    this.update = function(buf){
        if(self.crypto == null) return;
        this.emit(
            'data',
            self.crypto.update(buf)
        );
    };

    this.end = function(){
        this.emit('end', this.crypto.final());
        self.crypto = null;
    };
};

util.inherits(cipher, events.EventEmitter);
module.exports = cipher;
