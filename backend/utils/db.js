const mongoose = require('mongoose');
const { Game, User, Question } = require('../models')

async function connectToDb() {
  await mongoose.connect('mongodb+srv://admin:qihQVpoE2GzzIThQ@cluster0.e43sxtl.mongodb.net/?retryWrites=true&w=majority');
}

connectToDb().then(async () => {
  console.log("connected to db")
  // Game.deleteMany({}, (e, d) => { console.log(d) })
  // User.deleteMany({}, (e, d) => { console.log(d) })
  if (Question.countDocuments() == 0) {
    Question.create([
      { text: "1 + 1", answer: "3", correct: false },
      { text: "Sky is blue", answer: "yes", correct: true },
      { text: "fire hot", answer: "no", correct: false },
    ])
  }

}).catch(err => console.log(err));