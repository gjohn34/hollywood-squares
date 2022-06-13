const { User } = require("../models")

const router = require("express").Router()

router.post("/signup", (req, res) => {
  User.create({ username: req.body.username, password: req.body.password }, (e, doc) => {
    if (e) {
      res.send(401)
    } else {
      req.session.uid = doc.id
      res.status(201).send(doc)
    }
  })
})

router.post("/login", (req, res) => {
  User.findOne({ username: req.body.username, password: req.body.password }, (e, doc) => {
    if (e || !doc) {
      res.send(401)
    } else {
      req.session.uid = doc.id
      res.status(200).send(doc)
    }
  })
})

router.get("/me", (req, res) => {
  User.findById(req.session.uid, (e, doc) => {
    if (e || !doc) {
      res.send(401)
    } else {
      res.send(doc).status(200)
    }
  })
})

router.delete("/logout", (req, res) => {
  req.session.destroy()
  res.send(200)
})

module.exports = router