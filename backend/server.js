
const express = require('express');
const cors = require('cors')
const bodyParser = require("body-parser")

const app = express();

app.use(cors({ credentials: true, origin: true }))

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


module.exports = app