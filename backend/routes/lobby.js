const { Game } = require('../models')

const router = require("express").Router();

router.get("/", async (req, res) => {
    const lobbies = await Game.find()
    res.send(lobbies)
})

router.post("/", async (req, res) => {
    Game.create({
        name: req.body.name,
        playerOne: req.session.uid,
        turn: 0,
    }, (err, doc) => {
        if (err) {
            console.log(err)
            res.send(400)
            return
        }
        req.session.gid = doc.id
        console.log(req.session)
        res.send({ result: "Ok", _id: doc.id })
    })
})

module.exports = router;
