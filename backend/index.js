const WebSocket = require("ws")
const { parse } = require('url');
const { Game } = require('./models')

const lobbyServer = require('./sockets/lobbyServer');
const gameServer = require('./sockets/gameServer')

require("./utils/db")

Game.watch()
    .on('change', data => {
        console.log("Operation Type: " + data.operationType)
        switch (data.operationType) {
            case "update":
                gameServer.clients.forEach(client => {
                    console.log("--------------------------")
                    console.log(client)
                    console.log("--------------------------")
                    // comment this back in when i get ip working
                    // if (client.readyState === WebSocket.OPEN && (client.ip === data.playerOneIP || client.ip === data.playerTwoIp)) {
                    client.send(JSON.stringify({ type: "initData", value: { playerTwo: data.updateDescription.updatedFields.playerTwo } }))
                    // }
                })
                break;
            case "insert":
                lobbyServer.clients.forEach(function each(client) {
                    if (client.readyState === WebSocket.OPEN && client.ip != data.playerOne) {
                        client.send("new game started");
                    }
                });
                break
            default:
                break;
        }
    })

const session = require('express-session');
const app = require("./server")
const sessionParser = session({
    saveUninitialized: false,
    secret: 'secret',
    resave: false
});

app.use(session({
    saveUninitialized: false,
    secret: 'secret',
    resave: false
})
)

// app.use((req, res, next) => {
//     console.log(req.session)
//     next()
// })
app.use("/games", require("./routes/game"))
app.use("/lobbies", require("./routes/lobby"))

app.get("/game", (req, res) => {
    Game.findById(req.session.gid, (e, doc) => {
        if (e || !doc) {
            res.send(404)
        } else {
            res.status(200).send(doc)
        }
    })
})

app.use("/auth", require("./routes/auth"))

const server = app.listen(8080, () => console.log("server listening"))

server.on('upgrade', (request, socket, head) => {
    sessionParser(request, {}, () => {
        const { pathname, query } = parse(request.url);
        if (pathname == "/lobby") {
            lobbyServer.handleUpgrade(request, socket, head, socket => {
                lobbyServer.emit('connection', socket, request);
            });
        } else if (pathname === "/game") {
            let params = query.split("&")

            request.session.gid = params[0].split("=")[1]
            request.session.uid = params[1].split('=')[1]
            socket.uid = request.session.uid
            console.log("socket uid: " + socket.uid)
            gameServer.handleUpgrade(request, socket, head, socket => {
                gameServer.emit('connection', socket, request);
            });
        }
    })
});

