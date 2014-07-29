var cls     = require("./lib/class"),
    _       = require("underscore"),
    Entity  = require('./entity'),
    Types   = require("../../shared/js/gametypes");

module.exports = Player = Entity.extend({
    init: function(config) {
        var self = this;

        this.socket = config.socket;

        this.id     = config.id || Date.now();
        this.name   = this.getRandomName();
        this.code   = _.sample([0, 1, 2, 3, 4, 5, 6, 7, 8, 9], 4).join("");

        this.game   = config.game;
        this.hasEnteredGame = false;
        this.isReady = false;
        this.actionsAvailable = [Types.Actions.TAP, Types.Actions.FIRE, Types.Actions.JUMP];
        this.tap = 0;
        this.jump = 0;
        this.fire = 0;

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
                if (self.code == data.code) {
                    self.isReady = true;
                    self.send(Types.Messages.SYNC, {success: true, actionsAvailable: self.actionsAvailable});
                } else {
                    error = "invalid code"
                    self.send(Types.Messages.SYNC, {success: false, error: error});
                }
            } else if (Types.Messages.ACTION == action) {
                if (self.hasAction(data.id)) {
                    if (data.id == Types.Actions.TAP.id) { self.tap++; }
                    if (data.id == Types.Actions.JUMP.id) { self.jump++; }
                    if (data.id == Types.Actions.FIRE.id) { self.fire++; }
                }
            }
        });
    },

    onExit: function(callback) {
        this.exit_callback = callback;
    },

    hasAction: function(id) {
        return _.findWhere(this.actionsAvailable, {id: id});
    },

    formatUsername: function(username) {
        return username.replace(/ /gi, "_").toLowerCase();
    },

    getRandomName: function() {
        return "hey";
    },

    send: function(name, message) {
        this.socket.emit(name, message);
    }
});
