define(['entity'], function(Entity) {

    var Player = Entity.extend({
        init: function(game, id, config) {
            this._super(game, id, "player", Types.Entities.PLAYER, config);
            this.isCurrentPlayer = false;
        },

        setCurrentPlayer: function(){
            this.isCurrentPlayer = true;

            this.div.addClass("current");

            //Player actions div
            var actions = $("<div>", {
                "class": "actions",
                css: {
                    left: this.div.width()
                }
            }).appendTo(this.div);

            if (this.actionsAvailable) {
                var ul = $("<ul>");
                for (i in this.actionsAvailable) {
                    action = this.actionsAvailable[i];

                    $("<li>", {
                        "class": "action",
                        "data-id": action.id,
                        html: action.label,
                    }).appendTo(ul);
                }
                ul.appendTo(actions);
            }

        },

        isCurrentPlayer: function(){
            return this.isCurrentPlayer;
        },

        createDiv: function(){
            this._super();

            //Entity name div
            $("<div>", {
                "class": "name",
                html: this.name
            }).prependTo(this.div);

            //Entity say div
            $("<div>", {
                "class": "say"
            }).prependTo(this.div);
        },

        onChat: function(message) {
            this.div.find(".say").stop(true).hide();
            if (!message) {
                return;
            }
            this.div.find(".say").html(message)
                .css({
                    width: (message.length * 5)+"px"
                });
            this.div.find(".say").show('fast').delay(5000).hide('fast');
        },

        bindActions: function() {
            var self = this;
            this._super();

            this.div.on("click", function(e) {
                self.div.find(".actions").toggle();
            });
            this.div.on("click", ".action", function() {
                self.game.socket.emit(Types.Messages.ACTION, {id: $(this).data("id")});
            });
        },

        update: function(player){
            var self = this;
            this._super(player);

            if (player.action && player.action.id == Types.Actions.IDEA.id) {
                if (!self.div.find(".idea").length) {
                    var timer = player.action.duration - (Date.now() - player.action.startedAt);
                    $("<div>", {"class": "idea"}).prependTo(self.div).delay(timer).hide('fast', function(){ this.remove(); });
                }
            }
        }
    });

    return Player;
});
