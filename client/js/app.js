define(["io", "game"], function (io, Game) {
    //Dirty hack to get the socket hostname from io
    //Don't ever, ever use this
    for (hostname in io.sockets) break;
    console.log("hostname", hostname)

    var socket = io.connect("http://"+hostname),
        game = {};

    var App = Class.extend({
        init: function() {
            this.log_div = ".game-state .messages";

            console.log("App - init");

            socket.on(Types.Messages.GAMESINFO, this.updateGamesInfo.bind(this));
            socket.on(Types.Messages.GAMEINFO, this.updateGameInfo.bind(this));
            socket.on(Types.Messages.NEWGAME, this.newGame.bind(this));
            socket.on(Types.Messages.ENTERGAME, this.enterGame.bind(this));
            socket.on(Types.Messages.SYNC, this.syncController.bind(this));
            socket.on("disconnect", this.onGameDisconnect.bind(this));

            this.bindEvents();

            $(".register button, .register select").prop("disabled", false);
            $(".register .loader").remove();
        },

        bindEvents: function () {
            var self = this;

            $(".register .new-game").on("click", function() {
                socket.emit(Types.Messages.NEWGAME);
            });

            $(".register .game-list").on("change", function() {
                socket.emit(Types.Messages.ENTERGAME, {game: $(this).val(), isMobile: self.isMobile()});
            });

            $(".game .mobile .send-code").on("click", function() {
                if (!$(".game .mobile .code").val()) { return; }
                socket.emit(Types.Messages.SYNC, {code: $(".game .mobile .code").val()});
            });

            if (window.location.hash) {
                var gameId = window.location.hash.replace("#", "");
                socket.emit(Types.Messages.ENTERGAME, {game: gameId, isMobile: self.isMobile()});
            }
        },

        newGame: function (data) {
            //TODO: change page to /game/<id>
            if (data.game) {
                socket.emit(Types.Messages.ENTERGAME, {game: data.game});
            }
        },

        enterGame: function (data) {
            if (!data.success) {
                console.log(data.error);
                window.location.hash = "";
                return;
            }

            console.log("App - enterGame");

            $(".register").remove();
            $(".game .game-id").html(data.game.id);
            $(".player-count").html(data.game.players_count);

            if (!this.isMobile()) {
                $(".game, .game .desktop").show();
            } else {
                $(".game, .game .mobile").show();
            }
        },

        syncController: function (data) {
            if (data.success) {
                $(".game .mobile .controls, .game .mobile .enter-code").toggle();
            } else {
                $(".game .mobile .code").val("").focus();
                $(".game .mobile .enter-code .status").html(data.error);
            }
        },

        updateGamesInfo: function (data) {
            $(".register .game-list option:gt(0)").remove();
            for (id in data.games) {
                game = data.games[id];
                $(".register .game-list").append($("<option>",{
                    value: id,
                    text: id + " (" + game.players + "/" + game.maxPlayers + ")"
                }));
            }
        },

        updateGameInfo: function (data) {
            $(".player-count").html(data.players_count);
            $(".game-info").html(JSON.stringify(data, null, 2));
        },

        onGameDisconnect: function(callback) {
            setTimeout(function() {
                window.location.reload();
            }, 1000);

        },

        isMobile: function(){
            return (navigator.userAgent.match(/Android/i)
                 || navigator.userAgent.match(/webOS/i)
                 || navigator.userAgent.match(/iPhone/i)
                 || navigator.userAgent.match(/iPad/i)
                 || navigator.userAgent.match(/iPod/i)
                 || navigator.userAgent.match(/BlackBerry/i)
                 || navigator.userAgent.match(/Windows Phone/i)
            )
        }
    });

    var app = new App();
});
