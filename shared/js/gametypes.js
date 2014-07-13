Types = {
    Messages: {
        INIT: 0,
        DISCONNECT: 1,
        NEWGAME: 2,
        GAMEINFO: 3,
        GAMESINFO: 4,
        ENTERGAME: 5,
        SYNC: 6,
        SPAWN: 7,
        DESPAWN: 8
        /*
        INIT: 0,
        DISCONNECT: 1,
        STATE: 2,
        MOVE: 3,
        MESSAGE: 4,
        CHAT: 5,
        SPAWN: 6,
        DESPAWN: 7,
        ACTION: 8,
        ENTERGAME: 10,
        GAMESINFO: 11
        */
    },

    Entities: {
        PLAYER: 1,
    },

    Actions: {
        GET_ITEM: {
            id: 1,
            label: "Prendre l'objet"
        }
    }
};

if(!(typeof exports === 'undefined')) {
    module.exports = Types;
}
