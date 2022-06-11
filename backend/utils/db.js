const mongoose = require('mongoose');
const {Game} = require('../models')

async function connectToDb() {
    await mongoose.connect('mongodb+srv://admin:qihQVpoE2GzzIThQ@cluster0.e43sxtl.mongodb.net/?retryWrites=true&w=majority');
  }

connectToDb().then(() => {
    console.log("connected to db")
    Game.deleteMany({}, (e,d) => {console.log(d)})
}).catch(err => console.log(err));