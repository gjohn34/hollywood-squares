import React from 'react'

export const initialData = {
    client: null,
    game: null,
    gameId: null
}



export function reducer(state, action) {
    switch (action.type){
        case "setGameId": 
            return {...state, gameId: action.value}
        case "setClient":
            return {...state, client: action.value}
        case "setGame":
            console.log("punkd")
            return {...state, game: action.value}
        default: 
            return state;
    }
}

export default React.createContext(initialData);