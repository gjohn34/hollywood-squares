const { WebSocketServer } = require("ws")
const { Game, Question } = require('../models')

const map = new Map()
const gameServer = new WebSocketServer({ noServer: true });

class SocketResponse {
    constructor(type, value) {
        if (!type || !value) throw Error
        this.type = type
        this.value = value
    }
}

class Pair {
    constructor(playerOne, playerOneUid) {
        this.playerOne = playerOne
        this.playerOneUid = playerOneUid
        this.playerTwoUid = null
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
    console.log("Game connection")
    console.log("game id: " + request.session.gid)
    const game = await Game.findById(request.session.gid)
    if (!game) {
        socket.write('HTTP/1.1 404 Not Found\r\n\r\n');
        socket.destroy();
        return;
    }
    let pair;
    if (!map.has(game.id)) {
        pair = new Pair(socket, request.session.uid)
    } else {
        pair = map.get(game.id);
        switch (request.session.uid) {
            case pair.playerOneUid:
                pair.playerOne = socket;
                break;
            case pair.playerTwoUid:
                pair.playerTwo = socket
                break
            default:
                pair.playerTwo = socket
                pair.playerTwoUid = request.session.uid
                pair.playerOne.emit("message", JSON.stringify(new SocketResponse("playerTwoName", game.playerTwo)))
                break;
        }
    }
    map.set(game.id, pair)

    socket.on('message', message => {
        data = JSON.parse(message)
        console.log('game update: %s', data)
        pair = map.get(game.id);

        switch (data.type) {
            case "getQuestion":
                console.log('hit question')
                Question.findOne({}, (e, doc) => pair.sendToPair(new SocketResponse("getQuestion", doc.toObject())))
                // Question.random((e, doc) => pair.sendToPair(new SocketResponse("getQuestion", doc.toObject())))
                // pair.sendToPair(new SocketResponse("getQuestion", { question: "1 + 1", answer: "3", correct: false }))
                break;
            case "answerQuestion":
                console.log("hit answer");
                Question.findOne({}, (e, doc) => {
                    if (doc.correct == data.value) {
                        console.log("you are correct")
                        pair.sendToPair(new SocketResponse("getAnswer", { value: true }))
                    } else {
                        console.log("you are incorrect")
                        pair.sendToPair(new SocketResponse("getAnswer", { value: false }))
                    }
                    // pair.sendToPair(new SocketResponse("getQuestion", doc.toObject()))
                })
                break;
            // let messageTo = game.turn % 2 == 0 ? pair.playerOne : pair.playerTwo;
            // pair.sendToPair(new SocketResponse("getQuestion", { question: "1 + 1", answer: 3, correct: false }))

            case "playerTwoName":
                pair.sendToPair(new SocketResponse("playerTwoName", data.value))
                break;
            default:
                break;
        }
    })
    socket.on("close", () => {
    })
});

module.exports = gameServer;