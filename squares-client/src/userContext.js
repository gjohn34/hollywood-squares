import React from 'react'

export const initialUserData = {
    lobbyClient: null,
    user: null,
}



export function userReducer(state, action) {
    switch (action.type) {
        case "setUser":
            return { ...state, user: action.value }
        case "setLobbyClient":
            return { ...state, lobbyClient: action.value }
        default:
            return state;
    }
}

export default React.createContext(initialUserData);