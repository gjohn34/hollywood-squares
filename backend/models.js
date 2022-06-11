const mongoose = require('mongoose');

const User = mongoose.model('User', new mongoose.Schema({
    username: String
}))

const Game = mongoose.model('Game', new mongoose.Schema({
    name: String,
    playerOne: String,
    playerOneIP: String,
    playerTwo: String,
    playerTwoIP: String
}));

module.exports = {User, Game}