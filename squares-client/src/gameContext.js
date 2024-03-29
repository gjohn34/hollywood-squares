import React from 'react'

export const GameState = {
    Loading: "Loading",
    Waiting: "Waiting",
    Start: "Start",
}

export const initialGameData = {
    game: null,
    gameId: null,
    gameState: GameState.Loading,
    gameClient: null,
    question: null,
    boardArray: [[null, null, null], [null, null, null], [null, null, null]],
    winner: null
}


export function gameReducer(state, action) {
    switch (action.type) {
        case "setGame":
            return { ...state, game: action.value }
        case "setGameState":
            return { ...state, gameState: action.value }
        case "setPlayingAs":
            return { ...state, playingAs: action.value }
        case "setTurn":
            return { ...state, turn: action.value }
        case "setQuestion":
            return { ...state, question: action.value }
        case "setBoard":
            return { ...state, boardArray: action.value }
        case "setWinner":
            return { ...state, winner: action.value }
        case "setGameClient":
            return { ...state, gameClient: action.value }
        default:
            return state;
    }
}

export default React.createContext(initialGameData);