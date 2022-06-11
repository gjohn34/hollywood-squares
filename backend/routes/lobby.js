const {Game} = require('../models')

const router = require("express").Router();

router.get("/", async (req, res) => {
    const lobbies = await Game.find()
    res.send(lobbies)
})

router.post("/", async (req, res) => {
    Game.create({
        name: req.body.name, 
        playerOne: req.body.playerOne, 
        playerOneIP: req.socket.remoteAddress
    }, (err, doc) => {
        if (err) {
            res.send(400)
            return    
        }
        req.session.gameId = doc.id
        res.send({result: "Ok", id: doc.id})
    })
})

module.exports = router;
