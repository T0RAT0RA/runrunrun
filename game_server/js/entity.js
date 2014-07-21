var cls     = require("./lib/class"),
    _       = require("underscore"),
    Types   = require("../../shared/js/gametypes");

module.exports = Entity = Class.extend({
    init: function(id, type, config) {
        var self = this;

        this.id = id;
        this.type = type;
        this.game = config.game;
    },

    destroy: function() {

    },

    getState: function() {
        return {
            id: this.id,
            position: this.position
        };
    }

});
