const WebSocket = require("ws")
const { parse } = require('url');
const {Game} = require('./models')

const lobbyServer = require('./sockets/lobbyServer');
const gameServer = require('./sockets/gameServer')

require("./utils/db")

Game.watch()
.on('change', data => {
    console.log("Operation Type: " + data.operationType)
    console.log(data)
    switch (data.operationType) {
        case "update":
            gameServer.clients.forEach(client => {
                // comment this back in when i get ip working
                // if (client.readyState === WebSocket.OPEN && (client.ip === data.playerOneIP || client.ip === data.playerTwoIp)) {
                    client.send(JSON.stringify({type: "initData", value: {playerTwo: data.updateDescription.updatedFields.playerTwo}}))
                // }
            })
            break;
        case "insert":
            lobbyServer.clients.forEach(function each(client) {
                if (client.readyState === WebSocket.OPEN && client.ip != data.playerOne ) {
                    client.send("new game started");
                }
            });
            break
        default:
            break;
    }
})

// const ws = map.get(request.session.userId);
// map.set(userId, ws);
// map.delete(userId);
const session = require('express-session');
const app = require("./server")
const sessionParser = session({
    saveUninitialized: false,
    secret: 'secret',
    resave: false
  });

app.use(sessionParser);
app.use("/games", require("./routes/game"))
app.use("/lobbies", require("./routes/lobby"))

app.get("/game", async (req, res) => {
    // const game = await Game.find({ _id: req.body._id })
    res.sendStatus(200)
})

const server = app.listen(8080, () => console.log("server listening"))

server.on('upgrade', (request, socket, head) => {
    sessionParser(request, {}, () => {
        const { pathname, query } = parse(request.url);
        if (pathname == "/lobby"){
            lobbyServer.handleUpgrade(request, socket, head, socket => {
                lobbyServer.emit('connection', socket, request);
            });
        } else if (pathname === "/game") {
            const id = query.split("=")[1]
            request.session.gameId = id
            gameServer.handleUpgrade(request, socket, head, socket => {
                gameServer.emit('connection', socket, request);
            });
        }
    })
});

