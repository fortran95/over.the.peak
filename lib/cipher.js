var events = require('events');
var util = require('util');
var buffer = require('buffer');
function cipher(key, mode){
    var self = this;

    this.inputBuffer = '';
    this.outputBuffer = '';

    /* Transformer is the core of a cipher.
     * Depending on mode, this works differently.
     * All cihpertext should be base64-encoded. If error occured, '' should
     * be returned.
     */
    if(mode == 'encrypt'){
        this._transformer = function(input){
            return new buffer.Buffer(input).toString('base64');
        };
    } else if(mode == 'decrypt'){
        this._transformer = function(input){
            return new buffer.Buffer(input, 'base64').toString();
        };
    } else
        return false;

    this.update = function(stuff){
        this.inputBuffer += stuff;
        var delimiterPos = -1;
        do{
            delimiterPos = this.inputBuffer.indexOf('|');
            if(delimiterPos >= 0){
                this.outputBuffer +=
                    this._transformer(
                        this.inputBuffer.slice(0, delimiterPos)
                    )
                ;
                this.inputBuffer = this.inputBuffer.slice(delimiterPos);
            }
        } while (delimiterPos > 0);
        this.emit('data', this.outputBuffer);
        this.outputBuffer = '';
    };
}

util.inherits(cipher, events.EventEmitter);
module.exports = cipher;
