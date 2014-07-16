var cls     = require("./lib/class"),
    _       = require("underscore"),
    Entity  = require('./entity'),
    Types   = require("../../shared/js/gametypes");

module.exports = Controller = Entity.extend({
    init: function(config) {
        var self = this;

        this.socket = config.socket;
        this.id     = this.socket.id;
        this.game   = config.game;
        this.player = null;
        this.actionsAvailable = [Types.Actions.TAP, Types.Actions.FIRE, Types.Actions.JUMP];

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
            } else if (Types.Messages.SYNC == action) {
                try {
                    self.game.tryToSyncPlayer(self, data.code);
                    self.send(Types.Messages.SYNC, {success: true, actionsAvailable: self.actionsAvailable});
                }
                catch(error) {
                    self.send(Types.Messages.SYNC, {success: false, error: error});
                }
            } else if (Types.Messages.ACTION == action) {
                if (self.hasAction(data.id) && self.player) {
                    if (data.id == Types.Actions.TAP.id) {
                        if (!self.player.tap) {
                            self.player.tap = 0;
                        }
                        self.player.tap++;
                    }
                }
            }
        });
    },

    onExit: function(callback) {
        this.exit_callback = callback;
    },

    addPlayer: function(player) {
        var self = this;

        if (this.player) {
            //already synced with a player
            return false;
        }

        this.player = player;
        /*
        player.onExit(function(){
            self.removePlayer();
        });
        */

        console.log("Controller " + this.id + " synced with player " + player.id);
    },

    hasAction: function(id) {
        return _.findWhere(this.actionsAvailable, {id: id});
    },

    removePlayer: function() {
        this.player = null;
        console.log("Controller " + this.id + " lost  player");
    },

    send: function(name, message) {
        this.socket.emit(name, message);
    }
});
