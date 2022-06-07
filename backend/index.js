const express = require('express');
const session = require('express-session');
const {URL} = require('url');
const cors = require('cors')
const WebSocket = require("ws")
const {WebSocketServer} = require('ws');
const mongoose = require('mongoose');
const bodyParser = require("body-parser")
const app = express();
const { parse } = require('url');
const uuid = require("uuid")


const sessionParser = session({
    saveUninitialized: false,
    secret: 'secret',
    resave: false
  });

app.use(sessionParser);
app.use(cors())

async function connectToDb() {
    await mongoose.connect('mongodb+srv://admin:qihQVpoE2GzzIThQ@cluster0.e43sxtl.mongodb.net/?retryWrites=true&w=majority');
  }

connectToDb().then(() => {
    console.log("connected to db")
    Lobby.deleteMany({}, (e,d) => {console.log(d)})
}).catch(err => console.log(err));

const User = mongoose.model('User', new mongoose.Schema({
    username: String
}))

const Lobby = mongoose.model('Lobby', new mongoose.Schema({
    name: String,
    playerOne: String,
    playerTwo: String
}));







app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const wsServer = new WebSocketServer({ noServer: true });

wsServer.on('connection', (socket, request) => {
    socket.on('message', message => {
        console.log('received: %s', message)
        socket.send("pong")
    })
});

Lobby.watch()
.on('change', data => {
    wsServer.clients.forEach(function each(client) {
        if (client.readyState === WebSocket.OPEN ) {
            client.send("new lobby");
        }
    });
})

// map = new Map()
// const ws = map.get(request.session.userId);
// map.set(userId, ws);
// map.delete(userId);

app.get("/lobbies", async (req, res) => {
    const lobbies = await Lobby.find()
    res.send(lobbies)
})

app.post("/lobbies", async (req, res) => {
    Lobby.create({name: req.body.name}, (err, doc) => {
        if (err) {
            res.send(400)
            return    
        }
        res.send(200)
    })
})

const server = app.listen(8080, () => console.log('listening'));


server.on('upgrade', (request, socket, head) => {
    // find lobby in database
    // if no lobby
    // create one
    // save lobby id as session.id
    
    
    
    
    // sessionParser(request, {}, () => {
    //     const { pathname, query } = parse(request.url);
    //     console.log(pathname)
    //     console.log(request.session)
    //     if (!request.session.username) {
    //         console.log("no username")
    //         socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
    //         socket.destroy();
    //         return;
    //     }
    // })
    // console.log("foo")


    wsServer.handleUpgrade(request, socket, head, socket => {
        wsServer.emit('connection', socket, request);
    });
});

