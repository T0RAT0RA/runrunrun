var cls     = require("./lib/class"),
    http    = require("http"),
    url     = require("url"),
    fs      = require("fs"),
    Game    = require("./game"),
    Types   = require("../../shared/js/gametypes"),
    Log     = require('log'),
    _       = require('underscore'),
    socketio = require('socket.io'),
    socketioWildcard = require('socket.io-wildcard');

Server = cls.Class.extend({
    init: function(configPath) {
        var self = this;

        self.games = [];
        self.playerCount = 0;

        //Read the config file
        self.getConfigFile(configPath, function(config) {
            if(config) {
                self.startWebServer(config);
            } else {
                console.error("Server cannot start without configuration file.");
                process.exit(1);
            }
        });
    },

    startWebServer: function(config) {
        var self = this;

        console.log("Starting the web server.");

        this.webserver = http.createServer(function(request, response){
            pathname = url.parse(request.url).pathname;
            filesFolder = "./client";
            contentType = {"Content-Type": "text/html"};
            status = 200;

            if (pathname == "/") { pathname = "/index.html"; }
            if (pathname.indexOf("/shared/") >= 0) { filesFolder = "./"; }
            if (pathname.indexOf(".js") >= 0) { contentType = {"Content-Type": "application/javascript"}; }

            try {
                content = fs.readFileSync(filesFolder + pathname);
            } catch(err) {
                status = 404;
                content = null;
            }

            response.writeHead(status, contentType);
            response.end(content);
        });

        this.webserver.listen(process.env.PORT || config.port, function(){
            console.log('Listening on http://%s:%d', self.webserver.address().address, self.webserver.address().port);
            self.startGameServer(config);
        });

    },

    startGameServer: function(config) {
        var self = this;

        console.log("Starting the game server.");

        this.io = socketioWildcard(socketio).listen(this.webserver, {log: false});

        switch(config.debug_level) {
            case "error":
                log = new Log(Log.ERROR); break;
            case "debug":
                log = new Log(Log.DEBUG); break;
            case "info":
                log = new Log(Log.INFO); break;
        };

        self.io.sockets.on("connection", function(socket) {
            self.socket = socket;

            //Send GAMES info to the user
            socket.emit(Types.Messages.GAMESINFO, {games: self.getGamesInfo()});

            //Create a new run server
            socket.on(Types.Messages.NEWGAME, function() {
                var maxPlayers = 4;
                game = new Game(_.uniqueId("game"), maxPlayers, self);
                game.run();
                self.games[game.id] = game;
                socket.emit(Types.Messages.NEWGAME, {success: true, game: game.id});
                self.sendGamesInfo();
            });

            //Connect player/controller to a game
            socket.on(Types.Messages.ENTERGAME, function(data) {
                var success = true,
                    error = "";

                if (self.games[data.game]) {
                    game = self.games[data.game];
                } else {
                    success = false;
                    error = "Game " + data.game + " doesn't exist.";
                    console.log(error);
                }

                //Check if server is full
                if (_.keys(game.players).length >= game.maxPlayers) {
                    success = false;
                    error = "Game " + data.game + " is full.";
                    console.log(error);
                }

                if (success) {
                    if (!data.isMobile) {
                        spectator = new Spectator({
                            socket: socket,
                            game: game
                        });
                        game.spectator_enter_callback(spectator);
                    } else {
                        player = new Player({
                            id: ++self.playerCount,
                            socket: socket,
                            game: game
                        });
                        game.enter_callback(player);
                    }
                } else {
                    socket.emit(Types.Messages.ENTERGAME, {success: success, error: error});
                }

                self.sendGamesInfo();
            });

            //Connect controller to a player
            socket.on(Types.Messages.NEWCONTROLLER, function(data) {
            });
        });

        //Read the world maps folder
        /*
        var files = fs.readdirSync(config.worldsFolder);
        _.each(files, function(file) {
            getConfigFile(config.worldsFolder + file, function(world_config){
                var world = new WorldServer('world_'+ (world_config.id), world_config.nb_players, server, {map: world_config.map});
                world.run();
                worlds[world.id] = world;
            });
        });
        */

        /*
        process.on('uncaughtException', function (e) {
            log.error('uncaughtException: ' + e);
        });
        */
    },

    getGamesInfo: function() {
        gamesInfo = {};
        for (id in this.games) {
            game = this.games[id];
            gamesInfo[id] = {
                id: id,
                players: _.keys(game.players).length,
                maxPlayers: game.maxPlayers
            };
        }
        return gamesInfo;
    },

    removeGame: function(game) {
        if (this.games[game.id]) {
            log.debug("Removing game " + game.id);
            delete this.games[game.id];

            this.sendGamesInfo();
        }
    },

    sendGamesInfo: function() {
        this.socket.broadcast.emit(Types.Messages.GAMESINFO, {games: this.getGamesInfo()});
    },

    getConfigFile: function(path, callback) {
        fs.readFile(path, 'utf8', function(err, json_string) {
            if(err) {
                console.error("Could not open config file:", err.path);
                callback(null);
            } else {
                callback(JSON.parse(json_string));
            }
        });
    }
});

var defaultConfigPath = './server/config.games.json',
    server = new Server(defaultConfigPath);
