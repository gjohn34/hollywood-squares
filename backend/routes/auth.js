const { User } = require("../models")

const router = require("express").Router()

function isAuthenticated(req, res, next) {
  console.log(req.session.user)
  if (req.session.user) next()
  else next('route')
}

router.post("/signup", (req, res) => {
  User.create({ username: req.body.username, password: req.body.password }, (e, doc) => {
    if (e) {
      res.send(401)
    } else {
      req.session.regenerate(function (err) {
        if (err) next(err)

        req.session.uid = doc.id
        req.session.user = { username: doc.username, id: doc.id }
        res.status(201).send(doc)

      })
    }
  })
})

router.post("/login", (req, res) => {
  User.findOne({ username: req.body.username, password: req.body.password }, (e, doc) => {
    if (e || !doc) {
      res.send(401)
    } else {
      req.session.regenerate(function (err) {
        if (err) next(err)
        req.session.uid = doc.id
        req.session.user = { username: doc.username, id: doc.id }

        req.session.save(function (err) {
          if (err) return next(err)
          req.session.uid = doc.id
          res.status(200).send(doc)
        })
      })
    }
  })
})

router.get("/me", (req, res) => {
  User.findById(req.session.uid, (e, doc) => {
    if (e || !doc) {
      req.session.destroy();
      res.send(401)
    } else {
      req.session.uid = doc.id
      req.session.user = { username: doc.username, id: doc.id }
      res.status(200).send(doc)
      // req.session.regenerate(function (err) {
      //   if (err) next(err)
      // })
    }
  })
})

router.delete("/logout", (req, res) => {
  req.session.destroy()
  res.send(200)
})

module.exports = router