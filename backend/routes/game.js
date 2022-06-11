const {Game} = require('../models')

const router = require("express").Router();

router.get("/:id", async (req, res) => {
    const game = await Game.findById(req.params.id)
    res.send(game)
})

router.patch("/:id", async (req, res) => {
    const game = await Game.findByIdAndUpdate(req.params.id, {
        playerTwo: req.body.playerTwo, 
        playerTwoIP: req.socket.remoteAddress
    }, {returnDocument: 'after'})
    res.send(game)
})

module.exports = router;