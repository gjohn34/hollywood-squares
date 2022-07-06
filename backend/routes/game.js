const { Game } = require('../models')

const router = require("express").Router();

router.get("/:id", async (req, res) => {
    const game = await Game.findById(req.params.id)
    res.send(game)
})

router.patch("/:id", async (req, res) => {
    const game = await Game.findByIdAndUpdate(req.params.id, {
        playerTwo: req.session.uid,
    }, { returnDocument: 'after' })
    req.session.gid = game.id
    res.send(game)
})

router.delete("/:id", (req, res) => {
    Game.findByIdAndDelete(req.params.id, (err, doc) => {
        if (err) {
            res.status(400).send(err)
        } else {
            res.sendStatus(204)
        }
    })
})

module.exports = router;