const mongoose = require('mongoose');

const User = mongoose.model('User', new mongoose.Schema({
    username: {
        type: String,
        unique: true
    },
    password: String,
}))


const gameSchema = new mongoose.Schema({
    name: String,
    turn: Number,
    playerOne: String,
    playerOneIP: String,
    playerTwo: String,
    playerTwoIP: String,
    question: String,
    board: {
        type: [[Number]],
        default: [
            [null, null, null], [null, null, null], [null, null, null]
        ]
    }
});

const Game = mongoose.model('Game', gameSchema)


const questionSchema = new mongoose.Schema({
    text: String,
    answer: String,
    correct: Boolean
});

questionSchema.statics.random = async function (cb) {
    let count = await mongoose.model("Question").countDocuments()
    let random = Math.floor(Math.random() * count)
    return mongoose.model("Question").findOne().skip(random).exec((e, doc) => cb(e, doc))
}

const Question = mongoose.model('Question', questionSchema)

module.exports = { User, Game, Question }