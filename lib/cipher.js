var events = require('events');
var util = require('util');
var buffer = require('buffer');
function cipher(key, mode){
    var self = this;

    this.inputBuffer = '';
    this.outputBuffer = '';

    /* Transformer is the core of a cipher.
     * Depending on mode, this works differently.
     * All cihpertext should be base64-encoded.
     */
    if(mode == 'encrypt'){
        this._transformer = function(input, output){
            output = new buffer.Buffer(input).toString('base64');
        };
    } else if(mode == 'decrypt'){
        this._transformer = function(input, output){
            output = new buffer.Buffer(input, 'base64').toString();
        };
    } else
        return false;

    this.update = function(stuff){
        this.inputBuffer += stuff;

    };
}

util.inherits(cipher, events.EventEmitter);
module.exports = cipher;
