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
        this.hasController = false;

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
            else if (Types.Messages.CHAT == action) {
                self.game.broadcast(Types.Messages.CHAT, {id: self.id, name: self.name, message: data});
            }
            else if (Types.Messages.ACTION == action) {
                if (self.hasAction(data.id)) {
                    if (data.id == Types.Actions.ADD_NPC.id) { self.game.addNpc(); }
                    if (data.id == Types.Actions.REMOVE_NPCS.id) { self.game.removeNpcs(); }
                    if (data.id == Types.Actions.CALL_JACK_BAUER.id) { self.game.callBauer(self); }
                    if (data.id == Types.Actions.IDEA.id) { self.setAction({id: Types.Actions.IDEA.id, duration: Types.Actions.IDEA.duration}) }
                }
            }
        });
    },

    onExit: function(callback) {
        this.exit_callback = callback;
    },

    addController: function(controller) {
        var self = this;

        if (this.controller) {
            //already synced with a controller
            return false;
        }

        this.controller = controller;
        this.hasController = true;

        controller.onExit(function(){
            self.removeController();
        });

        console.log("Player " + this.id + " synced with controller " + controller.id);
    },

    removeController: function() {
        this.controller = null;
        this.hasController = false;
        console.log("Player " + this.id + " lost  controller");
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
