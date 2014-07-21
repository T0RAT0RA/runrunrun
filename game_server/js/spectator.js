var cls     = require("./lib/class"),
    _       = require("underscore"),
    Entity  = require('./entity'),
    Types   = require("../../shared/js/gametypes");

module.exports = Spectator = Entity.extend({
    init: function(config) {
        var self = this;

        this.socket = config.socket;

        this.id     = this.socket.id;
        this.game   = config.game;

        this.socket.on("disconnect", function() {
            if(self.exit_callback) {
                self.exit_callback();
            }
        });

        this.socket.on("*", function(event) {
            var action  = event.name,
                data    = event.args[0];

            if (Types.Messages.DISCONNECT == action) {
                if(self.exit_callback) {
                    self.exit_callback();
                }
            }
        });
    },

    onExit: function(callback) {
        this.exit_callback = callback;
    },

    send: function(name, message) {
        this.socket.emit(name, message);
    }
});
