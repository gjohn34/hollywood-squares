const { WebSocketServer, WebSocket } = require("ws")
const lobbyServer = new WebSocketServer({ noServer: true });

lobbyServer.on('connection', (socket, request) => {
    socket.uid = request.socket.uid
    // socket.ip = request.socket.remoteAddress
    socket.on('message', message => {
        let json = JSON.parse(message)
        console.log(json)
        console.log('-=============================')
        switch (json.type) {
            case "join":
                let d = JSON.stringify({
                    type: "join",
                    value: { gid: json.value, uid: socket.uid }
                })
                console.log(d)
                lobbyServer.clients.forEach(function each(client) {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(d);
                    }
                })
                break;
            default:
                break;

        }
        console.log('New lobby message: %s', message)
    })
});

module.exports = lobbyServer;