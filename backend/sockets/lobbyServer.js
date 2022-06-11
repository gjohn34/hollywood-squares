const {WebSocketServer} = require("ws") 
const lobbyServer = new WebSocketServer({ noServer: true });

lobbyServer.on('connection', (socket, request) => {
    socket.ip = request.socket.remoteAddress
    console.log('New connetion to lobby')
    socket.on('message', message => {
        console.log('New lobby message: %s', message)
    })
});

module.exports = lobbyServer;