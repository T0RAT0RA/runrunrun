var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {

  var ua = req.header('user-agent');
    if(/mobile/i.test(ua)) {
        res.render('index-mobile');
    } else {
        res.render('index');
    }
});

module.exports = router;
