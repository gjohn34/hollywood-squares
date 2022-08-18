const { WebSocketServer } = require("ws")
const { Game, Question } = require('../models')
const zip = require("lodash.zip")

const map = new Map()
const gameServer = new WebSocketServer({ noServer: true });

class SocketResponse {
    constructor(type, value) {
        if (!type || !value) throw Error
        this.type = type
        this.value = value
    }
}

class Board {
    constructor(array) {
        this.board = []
        let tempRow = []
        array.forEach(row => {
            row.forEach(column => {
                tempRow.push(new Cell(column))
            })
            this.board.push(tempRow)
            tempRow = []
        })
    }

    correctAnswer = (row, column, value) => {

        this.board[row][column].correct(value)
    }

    hasWinner = (value) => {
        const result = this.#threeInARow(value)
        if (result) {
            return true
        }

        let winner = false
        let flatBoard = this.board.flat()
        let score = 0

        flatBoard.forEach(cell => {
            if (cell.value == value) {
                score += 1
            }
        })
        if (score >= 5) {
            return true
        }
        return false
    }

    toArray = () => {
        const array = []
        this.board.forEach(row => {
            let subArray = []
            row.forEach(cell => subArray.push(cell.value))
            array.push(subArray)
        })
        return array
    }

    #threeInARow = value => {
        // Horizontal
        let result = false

        // change this to for loop for efficiency
        this.board.forEach(row => {
            if (this.#isRowEvery(row, value)) {
                result = true
            }
        })
        if (result) return result

        // Vertical
        let verticalList = zip(...this.board)
        verticalList.forEach(row => {
            if (this.#isRowEvery(row, value)) {
                result = true
            }
        })
        if (result) return result


        // Diagonal
        // is there a better way?
        if (this.#isRowEvery([this.board[0][0], this.board[1][1], this.board[2][2]], value)) return true
        if (this.#isRowEvery([this.board[0][2], this.board[1][1], this.board[2][0]], value)) return true

        return result
    }

    #isRowEvery = (row, value) => {
        if (row.every(cell => cell.value == value)) {
            return true
        }
        return false
    }
}

class Cell {
    constructor(value) {
        this.value = value
    }
    correct = (value) => {
        this.value = value
    }
}

class Pair {
    static pairs = []
    constructor(playerOne, playerOneUid, gid) {
        this.gid = gid
        this.playerOne = playerOne
        this.playerTwo = null
        this.playerOneUid = playerOneUid
        this.playerTwoUid = null
        this.index = Pair.Index()
        Pair.Push(this)
    }

    static findPairByGame = (game) => {
        const pOneUid = game.playerOne._id.toString()
        const pTwoUid = game.playerTwo?._id.toString() || null
        return this.pairs.find(pair => pOneUid == pair.playerOneUid || pTwoUid == pair.playerTwoUid)
    }

    static Index = () => {
        return this.pairs.length
    }

    static Push(pair) {
        this.pairs.push(pair)
    }

    static Remove(index) {
        this.pairs = this.pairs.filter(x => x.index == index)

    }

    sendToPair = (message) => {
        let data = JSON.stringify(message)
        this.playerOne.send(data)
        this.playerTwo.send(data)
    }

    removeFromPair = (uid) => {
        if (uid == this.playerOneUid) {
            this.playerOne = null
            this.playerOneUid = null
        } else if (uid == this.playerTwoUid) {
            this.playerTwo = null
            this.playerTwoUid = null
        }

        if (this.playerOneUid == null && this.playerTwoUid == null) {
            // Pair.Remove(this.index)
            // Game.findByIdAndDelete(this.gid)

            return true
        }
        return false
    }
}
gameServer.on('connection', async (socket, request) => {
    let game = await Game.findById(request.session.gid).populate(['playerOne', 'playerTwo', "question"])

    if (!game) {
        try {
            socket.write('HTTP/1.1 404 Not Found\r\n\r\n');
            socket.destroy();
        } catch {

        }
        return;
    }
    // TODO - SOMEHOW STARTING A SECOND GAME AFFECTS THE OLD ONE????
    let pair;
    if (!map.has(game.id)) {
        pair = new Pair(socket, request.session.uid, game._id)
    } else {
        pair = map.get(game.id);
        if (pair.playerOne == null && pair.playerTwo != null) {
            pair.playerOneUid = request.session.uid;
            pair.playerOne = socket;
        } else if (pair.playerTwo == null && pair.playerOne != null) {
            pair.playerTwo = socket;
            pair.playerTwoUid = request.session.uid
            pair.playerOne.emit("message", JSON.stringify(new SocketResponse("playerTwoName", game.playerTwo)))
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
                    const { row, column } = data.value
                    request.session.row = row
                    request.session.column = column
                    game = await Game.findByIdAndUpdate(game.id, { question: doc.id, position: [row, column] }, { returnDocument: 'after' })
                    pair.sendToPair(new SocketResponse("getQuestion", doc.toObject()))
                })
                break;
            case "answerQuestion":
                let { row, column } = request.session
                if ((row == undefined || column == undefined)) {
                    // for some reason destructuring the array doesn't play nice
                    // [row, column] = game.position
                    row = game.position[0]
                    column = game.position[1]
                }

                Question.findById((game.question), (e, doc) => {
                    if (doc.correct == data.value) {
                        const boardInstance = new Board([...game.board])
                        const player = Number(request.session.uid == game.playerOne.toString())
                        boardInstance.correctAnswer(row, column, player)
                        const winner = boardInstance.hasWinner(player)

                        Game.findOneAndUpdate(request.session.gid, { board: boardInstance.toArray(), turn: game.turn + 1, question: null, position: [undefined, undefined] }, { returnDocument: true }, (e, doc) => {
                            if (Boolean(winner)) {
                                pair.sendToPair(new SocketResponse("gameOver", player == 1 ? "PlayerOne" : "PlayerTwo"))
                            } else {
                                pair.sendToPair(new SocketResponse("getAnswer", {
                                    value: true,
                                    board: boardInstance.toArray(),
                                    from: data.from,
                                    row: request.session.row, column: request.session.column
                                }))
                            }
                        })
                    } else {
                        Game.findOneAndUpdate(request.session.gid, { turn: game.turn + 1, question: null, position: [undefined, undefined] }, { returnDocument: true }, (e, doc) => {
                            pair.sendToPair(new SocketResponse("getAnswer", {
                                value: false,
                                board: game.board,
                                from: data.from,
                                row: request.session.row, column: request.session.column,
                            }))
                        })
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
        console.log("Closing connection to game")
        if (pair.removeFromPair(request.session.uid)) {
            map.delete(request.session.gid)
            Game.findByIdAndDelete(request.session.gid)
        }
    })
});

module.exports = { gameServer, Pair, Board, Cell };