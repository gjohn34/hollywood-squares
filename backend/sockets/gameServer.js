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
    static pairs = []
    constructor(playerOne, playerOneUid) {
        this.playerOne = playerOne
        this.playerTwo = null
        this.playerOneUid = playerOneUid
        this.playerTwoUid = null
        Pair.Push(this)
    }

    static findPairByGame = (game) => {
        const pOneUid = game.playerOne._id.toString()
        const pTwoUid = game.playerTwo?._id.toString() || null
        return this.pairs.find(pair => pOneUid == pair.playerOneUid || pTwoUid == pair.playerTwoUid)
    }

    static Push(pair) {
        this.pairs.push(pair)
    }

    sendToPair = (message) => {
        let data = JSON.stringify(message)
        this.playerOne.send(data)
        this.playerTwo.send(data)
    }
}
gameServer.on('connection', async (socket, request) => {
    let game = await Game.findById(request.session.gid).populate(['playerOne', 'playerTwo', "question"])
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

    socket.on('message', async message => {
        data = JSON.parse(message)
        pair = map.get(game.id);
        game = await Game.findById(request.session.gid)

        switch (data.type) {
            case "getQuestion":
                Question.random(async (e, doc) => {
                    // game.question = doc.id
                    // console.log(doc.id)
                    let board = [...game.board]
                    const { row, column } = data.value
                    board[row][column] = 0
                    request.session.row = row
                    request.session.column = column
                    game = await Game.findByIdAndUpdate(game.id, { question: doc.id, board }, { returnDocument: true })
                    pair.sendToPair(new SocketResponse("getQuestion", doc.toObject()))
                })
                // Question.random((e, doc) => pair.sendToPair(new SocketResponse("getQuestion", doc.toObject())))
                // pair.sendToPair(new SocketResponse("getQuestion", { question: "1 + 1", answer: "3", correct: false }))
                break;
            case "answerQuestion":
                Question.findById((game.question), (e, doc) => {
                    if (doc.correct == data.value) {

                        let board = [...game.board]
                        const { row, column } = request.session
                        board[row][column] = request.session.uid == game.playerOne.uid

                        Game.findOneAndUpdate(game.id, { board }, { returnDocument: true }, (e, doc) => {
                            pair.sendToPair(new SocketResponse("getAnswer", {
                                value: true,
                                from: data.from,
                                row: request.session.row, column: request.session.column
                            }))
                        })
                    } else {
                        pair.sendToPair(new SocketResponse("getAnswer", {
                            value: false,
                            from: data.from,
                            row: request.session.row, column: request.session.column
                        }))
                    }
                })
                break;
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

module.exports = { gameServer, Pair };