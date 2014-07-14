Types = {
    Messages: {
        INIT: 0,
        DISCONNECT: 1,
        NEWGAME: 2,
        GAMEINFO: 3,
        GAMESINFO: 4,
        ENTERGAME: 5,
        SYNC: 6,
        ACTION: 7
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

    States: {
        WAITING: 1,
        READY: 2,
        RUNNING: 3,
        FINISHED: 4
    },

    Actions: {
        TAP: {
            id: 1,
            label: "TAP"
        },
        FIRE: {
            id: 2,
            label: "FIRE"
        },
        JUMP: {
            id: 3,
            label: "JUMP"
        }
    }
};

if(!(typeof exports === 'undefined')) {
    module.exports = Types;
}
