const WebSocket = require("ws")
const { parse } = require('url');
const { Game, User } = require('./models')

const lobbyServer = require('./sockets/lobbyServer');
const { gameServer, Pair } = require('./sockets/gameServer')

require("./utils/db")

Game.watch()
    .on('change', data => {
        switch (data.operationType) {
            case "update":
                console.log(data.operationType)
                Game.findById(data.documentKey._id, (e, doc) => {
                    if (e) return
                    let pair = Pair.findPairByGame(doc)
                    // User.findById(data.updateDescription.updatedFields.playerTwo)
                    //     .then(u =>
                    //         pair.playerOne.send(JSON.stringify({ type: "playerTwoName", value: { playerTwo: data.updateDescription.updatedFields.playerTwo } }))
                    //     )
                })
                // if (data.updateDescription.updatedFields.hasOwnProperty('playerTwo')) {
                //     Game.findById(data.documentKey.id, (e, doc) => {
                //         if (e) throw e
                //         console.log("--------------------------");
                //         console.log(e)
                //         console.log("--------------------------");
                //     })
                // }
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
const app = require("./server");
const { log } = require("console");
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

app.get("/game", async (req, res) => {
    const doc = await Game.findById(req.session.gid).populate(["playerOne", "playerTwo", "question"])
    if (!doc) {
        res.send(404)
    } else {
        res.status(200).send(doc)
    }
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
            gameServer.handleUpgrade(request, socket, head, socket => {
                gameServer.emit('connection', socket, request);
            });
        }
    })
});

