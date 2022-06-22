import React from 'react'

export const initialUserData = {
    client: null,
    user: null,
}



export function userReducer(state, action) {
    switch (action.type) {
        case "setUser":
            return { ...state, user: action.value }
        case "setClient":
            return { ...state, client: action.value }
        default:
            return state;
    }
}

export default React.createContext(initialUserData);