const { Schema, model } = require('mongoose');

const userSchema = new Schema({
    username: {
        type: String,
        unique: true
    },
    uid: {
        type: String
    },
    password: { type: String, select: false }
})


const questionSchema = new Schema({
    text: String,
    answer: String,
    correct: Boolean
});

questionSchema.statics.random = async function (cb) {
    let count = await model("Question").countDocuments()
    let random = Math.floor(Math.random() * count)
    return model("Question").findOne().skip(random).exec((e, doc) => cb(e, doc))
}


const gameSchema = new Schema({
    name: String,
    turn: Number,
    playerOne: { type: Schema.Types.ObjectId, ref: "User" },
    playerTwo: { type: Schema.Types.ObjectId, ref: "User" },
    question: { type: Schema.Types.ObjectId, ref: "Question" },
    board: {
        type: [[Number]],
        default: [
            [null, null, null], [null, null, null], [null, null, null]
        ]
    }
});

const User = model('User', userSchema)
const Game = model('Game', gameSchema)
const Question = model('Question', questionSchema)

module.exports = { User, Game, Question }