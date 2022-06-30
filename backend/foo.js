const mongoose = require('mongoose');
const { Board, Cell } = require("./sockets/gameServer")


let board = new Board([
    [1, null, 1],
    [1, 1, null],
    [null, 1, null]]
)

console.log("is there a winner? " + board.hasWinner(1))
