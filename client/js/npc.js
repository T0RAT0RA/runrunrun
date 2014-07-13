define(['entity'], function(Entity) {

    var NpcTalk = {
        "pikachu": [
            "lorem ipsum",
            "loREM ipsum.."
        ],
        "wolverine": [
            "lorem ipsum",
            "loREM ipsum.."
        ],
        "nobody": [
            "lorem ipsum",
            "loREM ipsum.."
        ],
    };

    var Npc = Entity.extend({
        init: function(game, id, kind, config) {
            this._super(game, id, "npc", kind, config);
            console.log(this.kind);
            this.talkCount = NpcTalk[this.kind]? NpcTalk[this.kind].length : 0;
            this.talkIndex = 0;
        },

        talk: function() {
            var msg = null;

            if(this.talkIndex > this.talkCount) {
                this.talkIndex = 0;
            }
            if(this.talkIndex < this.talkCount) {
                msg = NpcTalk[this.kind][this.talkIndex];
            }
            this.talkIndex += 1;

            return msg;
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

        bindActions: function() {
            return;
            var self = this;
            this._super();
            this.div.on("click", function(){
                self.onChat(self.talk());
            })
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

        update: function(npc){
            this._super(npc);
        }
    });

    return Npc;
});
