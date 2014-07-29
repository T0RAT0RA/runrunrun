define(["io"], function (io) {
    var socket = io.connect(),
        game = {};

    var App = Class.extend({
        init: function() {
            this.log_div = ".game-state .messages";

            console.log("App - init");

            socket.on(Types.Messages.GAMESINFO, this.updateGamesInfo.bind(this));
            socket.on(Types.Messages.GAMEINFO, this.updateGameInfo.bind(this));
            socket.on(Types.Messages.NEWGAME, this.newGame.bind(this));
            socket.on(Types.Messages.ENTERGAME, this.enterGame.bind(this));
            socket.on(Types.Messages.SYNC, this.syncPlayer.bind(this));
            socket.on("disconnect", this.onGameDisconnect.bind(this));

            this.bindEvents();

            $(".register button, .register select").prop("disabled", false);
            $(".register .loader, .game .loader").remove();
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
                console.log("App - send code: " + $(".game .mobile .code").val())
                socket.emit(Types.Messages.SYNC, {code: $(".game .mobile .code").val()});
            });

            var matches = window.location.pathname.match(/game\/([^\/]*)\/?$/);
            if (matches && matches[1]) {
                var gameId = matches[1];
                socket.emit(Types.Messages.ENTERGAME, {game: gameId, isMobile: self.isMobile()});
            }
        },

        newGame: function (data) {
            if (data.game) {
                window.location = "/game/" + data.game;
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

        syncPlayer: function (data) {
            console.log("App - syncPlayer", data)
            if (data.success) {
                for (i in data.actionsAvailable) {
                    action = data.actionsAvailable[i];

                    $("<div>", {
                        "class": "action",
                        "data-id": action.id,
                        html: action.label,
                    }).appendTo($(".game .mobile .actions"));
                }


                $(".game .mobile .action").swipe({
                    tap: function(event, target) {
                        console.log("tap ", $(target).data("id"))
                        socket.emit(Types.Messages.ACTION, {id: $(target).data("id")});
                    }
                });

                $(".game .mobile .actions, .game .mobile .enter-code").toggle();
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
