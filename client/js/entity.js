define(function() {

    var Entity = Class.extend({
        init: function(game, id, type, kind, config) {
            var self = this;

            this.game = game;
            this.id = id;
            this.type = type;
            this.kind = kind;
            this.name = config.name || "Lorem ipsum";
            this.direction = config.direction || "s";
            this.sprite = config.sprite;
            this.position = config.position;
            this.size = config.size;
            this.actionsAvailable = config.actionsAvailable;
            this.increment = 1;
            this.lastCheck = Date.now();
            this.animation = 0;

            this.createDiv();
            this.bindActions();
        },

        createDiv: function() {
            this.div = $("<div>", {
                "class": "entity",
                id: this.id
            }).appendTo(".game");

            this.div.sprite = $("<div>", {
                "class": ["sprite", this.type].join(" ")
            }).appendTo(this.div);

            this.div.sprite.css({
                "background-image": "url(img/avatars/"+this.sprite+")",
                top: Math.round(this.position.y - this.div.height()/2),
                left: Math.round(this.position.x - this.div.width()/2)
            });
        },

        bindActions: function() {
        },

        update: function(entity){
            this.velocity = entity.velocity;

            this.div.sprite.attr("data-direction", entity.direction);
            this.div.css({
                top: entity.position.y,
                left: entity.position.x
            });

            if (this.isMoving()) {
                this.animate();
            }
        },

        setName: function(name) {
            this.name = name;
        },


        isMoving: function(){
            return (this.velocity && (this.velocity.x || this.velocity.y));
        },

        animate: function() {
            var time = Date.now();

            if (time - this.lastCheck >= 1000/20) {
                this.animation += this.increment;
                if (this.animation <=0 || this.animation >= 2) this.increment *= -1;

                this.div.sprite.css({"background-position-x": "-" + this.animation*32 + "px"});
                this.lastCheck = Date.now();
            }
        }
    });

    return Entity;
});
