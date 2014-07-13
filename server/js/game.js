var cls     = require("./lib/class"),
    _       = require("underscore"),
    Log     = require('log'),
    fs      = require('fs'),
    Player  = require('./player'),
    Controller = require('./controller'),
    Types   = require("../../shared/js/gametypes");

// ======= GAME SERVER ========
module.exports = Game = cls.Class.extend({
    init: function(id, maxPlayers, websocketServer) {
        var self = this;

        console.log("Create new game #" + id);

        this.id = id;
        this.maxPlayers = maxPlayers;
        this.server = websocketServer;
        this.ups = 1;

        this.allowDiagonals = false;
        this.entities   = {};
        this.npcs       = {};
        this.players    = {};

        this.playerCount = 0;

        this.onPlayerEnter(function(player) {
            log.debug("Player #" + player.id + " entered game " + self.id);

            player.onExit(function() {
                log.info("Player #" + player.id + " has left game " + self.id);

                self.removePlayer(player);
                self.broadcast(Types.Messages.MESSAGE, player.name + " has left the game.");

                if(self.removed_callback) {
                    self.removed_callback();
                }
            });

            self.addPlayer(player);

            //Init player object on client side
            player.send(Types.Messages.ENTERGAME, {success: true, player: self.getCleanEntity(player), game: self.getState()});

            //Send each existing entity to the player game
            _.each(self.entities, function(entity){
                player.send(Types.Messages.SPAWN, self.getCleanEntity(entity));
            });

            player.hasEnteredGame = true;
            self.broadcast(Types.Messages.MESSAGE, "Player " + player.name + " has joined the game.");

            if(self.added_callback) {
                self.added_callback();
            }
        });

        this.onControllerEnter(function(controller) {
            log.debug("Controller #" + controller.id + " entered game " + self.id);

            controller.onExit(function() {
                if(self.removed_callback) {
                    self.removed_callback();
                }
            });

            //Init controller object on client side
            controller.send(Types.Messages.ENTERGAME, {success: true, controller: self.getCleanEntity(controller), game: self.getState()});
        });


        log.info(""+this.id+" created (capacity: "+this.maxPlayers+" players).");
    },

    onPlayerConnect: function(callback) {
        this.connect_callback = callback;
    },

    onPlayerDisconnect: function(callback) {
        this.disconnect_callback = callback;
    },

    onPlayerEnter: function(callback) {
        this.enter_callback = callback;
    },

    onControllerEnter: function(callback) {
        this.controller_enter_callback = callback;
    },

    onPlayerAdded: function(callback) {
        this.added_callback = callback;
    },

    onPlayerRemoved: function(callback) {
        this.removed_callback = callback;
    },

    run: function() {
        var self = this;

        setInterval(function() {
            //log.debug(self.id + " running... ");
            //log.debug("entities: ", _.pluck(self.entities, 'name'));
            //log.debug("players: ", _.pluck(self.players, 'name'));
            //log.debug("npcs: ", _.pluck(self.npcs, 'name'));
            self.updatePositions();
            self.updateActions();
            self.broadcast(Types.Messages.GAMEINFO, self.getState());
        }, 1000 / this.ups);

        log.info(""+this.id+" running...");
    },

    updateActions: function() {
        _.each(this.entities, function(entity) {
        });
    },

    updatePositions: function() {
        _.each(this.entities, function(entity) {
        });
    },

    addEntity: function(entity) {
        this.entities[entity.id] = entity;
        this.broadcast(Types.Messages.SPAWN, this.getCleanEntity(entity));
    },

    removeEntity: function(entity) {
        if(entity.id in this.entities) {
            delete this.entities[entity.id];
        }
        entity.destroy();

        this.broadcast(Types.Messages.DESPAWN, {id: entity.id});
    },

    addPlayer: function(player) {
        this.addEntity(player);
        this.players[player.id] = player;
    },

    removePlayer: function(player) {
        this.removeEntity(player);
        delete this.players[player.id];
    },

    getEntitiesByType: function() {
        return _.groupBy(this.entities, function(entity) {
          return entity.type;
        });
    },

    tryToSyncPlayer: function(controller, code) {
        for (id in this.players) {
            player = this.players[id];
            if (player.code == code) {
                if (player.hasController) {
                    throw "code already used";
                }
                player.addController(controller);
                controller.addPlayer(player);
            }
        }

        throw "invalid code";
    },

    broadcast: function(type, message) {
        //this.server.sockets.emit(type, message);
        _.each(this.players, function(player){
            player.socket.emit(type, message);
        });
    },

    getCleanEntity: function(entity) {
        return _.omit(entity, 'game', 'socket', 'controller', 'player', 'hasEnteredGame');
    },

    getState: function() {
        var self = this,
            filtered_players = _.map(this.players, function(player){ return self.getCleanEntity(player); });

        return {
            id: self.id,
            time: new Date().toLocaleTimeString(),
            players_count: Object.keys(filtered_players).length,
            players: filtered_players,
        }
    }
});
