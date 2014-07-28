var express = require('express');
var app     = require('../app');
var router 	= express.Router();
var gameServer  = require("../game_server/js/game-server.js");

/* GET home page. */
router.get('/:id', function(req, res) {
    var ua = req.header('user-agent'),
        template = 'games/game';

    //Check if the game exist
    if (!gameServer.games[req.params.id]) {
        res.send(404, "The game " + req.params.id + " doesn't exist.");
    }

    if(/mobile/i.test(ua)) {
        template = 'games/game-mobile';
    }

    res.render(template, {
        game_id: req.params.id
    });
});

module.exports = router;
