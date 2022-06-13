import React from 'react'

export const initialData = {
    client: null,
    user: null,
    game: null,
    gameId: null
}



export function reducer(state, action) {
    switch (action.type) {
        case "setGameId":
            return { ...state, gameId: action.value }
        case "setClient":
            return { ...state, client: action.value }
        case "setGame":
            return { ...state, game: action.value }
        case "setUser":
            return { ...state, user: action.value }
        default:
            return state;
    }
}

export default React.createContext(initialData);