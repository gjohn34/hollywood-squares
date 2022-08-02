require('dotenv').config()
const WebSocket = require("ws")
const { parse } = require('url');
const { Game, User } = require('./models')
const MongoStore = require('connect-mongo');
const lobbyServer = require('./sockets/lobbyServer');
const { gameServer, Pair } = require('./sockets/gameServer')

require("./utils/db")


Game.watch()
    .on('change', data => {
        switch (data.operationType) {
            case "update":
                Game.findById(data.documentKey._id, (e, doc) => {
                    if (e) return
                    // let pair = Pair.findPairByGame(doc)
                })

                break;
            case "insert":
                lobbyServer.clients.forEach(function each(client) {
                    if (client.readyState === WebSocket.OPEN && client.uid != data.playerOne) {
                        client.send(JSON.stringify({ type: "new", value: data.fullDocument }));
                    }
                });
                break
            case "delete":
                lobbyServer.clients.forEach(function each(client) {
                    if (client.readyState === WebSocket.OPEN && (client.uid != data.playerOne || client.uid != data.playerTwo)) {
                        client.send(JSON.stringify({ type: "delete", value: data.documentKey._id.toString() }))
                    }
                });
            default:
                break;
        }
    })

const session = require('express-session');
const app = require("./server");
const sessionParser = session({
    saveUninitialized: false,
    secret: 'secret',
    resave: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_SESSIONS
    })
});

app.use(sessionParser)
// ({
//     saveUninitialized: false,
//     secret: 'secret',
//     resave: false
// })
// )

// app.use((req, res, next) => {
//     console.log(req.session)
//     next()
// })
app.use("/games", require("./routes/game"))
app.use("/lobbies", require("./routes/lobby"))

app.get("/game", async (req, res) => {
    const doc = await Game.findById(req.session.gid).populate(["playerOne", "playerTwo", "question"])
    if (!doc) {
        res.send(404)
    } else {
        res.status(200).send(doc)
    }
})

app.use("/auth", require("./routes/auth"))

const server = app.listen(process.env.PORT, () => console.log("server listening"))

server.on('upgrade', (request, socket, head) => {
    sessionParser(request, {}, () => {
        const { pathname, query } = parse(request.url);
        if (pathname == "/lobby") {
            let params = query.split("&")
            socket.uid = params[0].split("=")[1]
            lobbyServer.handleUpgrade(request, socket, head, socket => {
                lobbyServer.emit('connection', socket, request);
            });
        } else if (pathname === "/game") {
            let params = query.split("&")

            request.session.gid = params[0].split("=")[1]
            request.session.uid = params[1].split('=')[1]
            socket.uid = request.session.uid
            gameServer.handleUpgrade(request, socket, head, socket => {
                gameServer.emit('connection', socket, request);
            });
        }
    })
});

