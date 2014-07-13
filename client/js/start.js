var hostname = "localhost:1337";
define("io", ["http://"+hostname+"/socket.io/socket.io.js"], function(io){ return io; });
define("jquery", ["http://ajax.googleapis.com/ajax/libs/jquery/2.1.0/jquery.min.js"]);
define("jquery-ui", ["jquery", "http://ajax.googleapis.com/ajax/libs/jqueryui/1.10.4/jquery-ui.min.js"]);
define("less", ["http://cdnjs.cloudflare.com/ajax/libs/less.js/1.7.0/less.min.js"]);
define(["lib/class", "lib/underscore.min", "jquery", "jquery-ui", "less"], function(){
    require(["app"]);
});
