const {WebSocketServer} = require("ws") 
const {Game} = require('../models')

const map = new Map()
const gameServer = new WebSocketServer({ noServer: true });

class Pair {
    constructor(playerOne, playerTwo) {
        this.playerOne = playerOne
        this.playerTwo = playerTwo
    }

    sendToPair = (message) => {
        let data = JSON.stringify(message)
        this.playerOne.send(data)
        this.playerTwo.send(data)
    }

    // function getOther(socket) {
    // }
}
gameServer.on('connection', async (socket, request) => {
    const game = await Game.findById(request.session.gameId)
    if (!game) {
        socket.write('HTTP/1.1 404 Not Found\r\n\r\n');
        socket.destroy();
        return;    
    }
    let pair;
    console.log(map.has(game.id))
    if (!map.has(game.id)) {
        pair = new Pair(socket, null)
    } else {
        pair = map.get(game.id);
        pair.playerTwo = socket
        pair.playerOne.emit("message", game.playerTwo)
    }
    map.set(game.id, pair)

    

    socket.on('message', message => {
        // if (message === "")
        console.log('game update: %s', message)
        pair.sendToPair({type: "playerTwoName", value: {playerTwo: message}})
    })
    socket.on("close", () => {
    })
});

module.exports = gameServer;