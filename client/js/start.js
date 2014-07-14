require.config({
    paths:{
        "jquery": "http://ajax.googleapis.com/ajax/libs/jquery/2.1.0/jquery.min",
        "jquery-ui": "http://ajax.googleapis.com/ajax/libs/jqueryui/1.10.4/jquery-ui.min",
        "touchSwipe": "lib/jquery.touchSwipe.min"
    }
});

var hostname = "localhost:1337";
define("io", ["http://"+hostname+"/socket.io/socket.io.js"], function(io){ return io; });
//define("jquery", ["http://ajax.googleapis.com/ajax/libs/jquery/2.1.0/jquery.min.js"]);
//define("jquery-ui", ["jquery", "http://ajax.googleapis.com/ajax/libs/jqueryui/1.10.4/jquery-ui.min.js"]);
//define("touchSwipe", ["jquery", "lib/jquery.touchSwipe.min"]);
define("less", ["http://cdnjs.cloudflare.com/ajax/libs/less.js/1.7.0/less.min.js"]);
define(["lib/class", "lib/underscore.min", "jquery", "touchSwipe", "jquery-ui", "less"], function(){
    require(["app"]);
});
