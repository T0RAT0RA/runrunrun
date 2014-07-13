var socket = io.connect('http://localhost:1338'),
    username = 'sreiss',
    player = {};

socket.emit(Types.Messages.INIT, {
    name: username,
    page: location.href.split(location.origin)[1]
});

socket.on(Types.Messages.CHAT, function (data) {
    var entity_div = $(".entity#"+data.id),
        entity_div_say = entity_div.find(".say");

    if (!entity_div.length) { return; }

    logMessages(data.name + ": " + data.message);

    entity_div_say.stop(true);
    entity_div_say.html(data.message)
        .css({
            width: (data.message.length * 10)+"px"
        });
    entity_div_say.show('fast').delay(5000).hide('fast');
})

//Spawn new entity
socket.on(Types.Messages.SPAWN, function (data) {
    //Abort if the entity already exist
    if ($(".entity#"+data.id).length) { return; }

    entity_div = $("<div>").addClass("entity "+data.type).attr("id", data.id).appendTo("body");

    //Player name div
    $("<div>").addClass("name")
        .html(data.name)
        .css({
            width: (data.name.length * 5)+"px"
        })
        .appendTo(entity_div);

    //Player say div
    $("<div>").addClass("say")
        .appendTo(entity_div);

    if (data.id == player.id) {
        entity_div.addClass("current");

        //Player actions div
        $("<div>").addClass("actions")
            .append("<ul><li data-action='hi'>Dire salut</li><li data-action='talk'>Parler</li><li data-action='blink'>😈</li></ul>")
            .appendTo(entity_div);
    }
    entity_div.css({
        "background-color": data.color,
        height: data.size.height+"px",
        width: data.size.width+"px",
        left: data.position.x+"px",
        top: data.position.y+"px"
    });
});

$(document).on("click", ".item", function() {
    var $this = $(this);
    socket.emit(Types.Messages.ACTION, {id: Types.Actions.GET_ITEM, item: $this.data("id")});
    //$(this).hide("explode");
});