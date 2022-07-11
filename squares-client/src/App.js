import { useState, useReducer, useEffect } from 'react'
import UserContext, { initialUserData, userReducer } from './userContext'
import GameContext, { initialGameData, gameReducer } from './gameContext'

import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";
import Game from "./pages/Game.js"
import LobbyIndex from "./pages/LobbyIndex.js"
import Auth, { AuthWrapper } from './components/auth'


function App() {
  const [userStore, userDispatch] = useReducer(userReducer, initialUserData);
  const [gameStore, gameDispatch] = useReducer(gameReducer, initialGameData);

  const [gameName, setGameName] = useState("")

  // auth user
  useEffect(() => {
    let uid = localStorage.getItem("uid")
    if (uid) {
      fetch("http://localhost:8080/auth/me", {
        method: "GET",
        credentials: "include"
      })
        .then(response => {
          if (response.status === 200) {
            return response.json()
          } else {
            localStorage.removeItem("uid")
            return
          }
        })
        .then(json => {
          if (!json) return
          // localStorage.setItem("uid", json.)
          userDispatch({ type: "setUser", value: json })
        })
    }
  }, [])

  // setup game on page refresh
  useEffect(() => {

  }, [])

  const logout = e => {
    e.preventDefault()
    fetch("http://localhost:8080/auth/logout", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      credentials: "include",
    })
      .then(response => {
        if (response.status == 200) {
          // setReadyState(ReadyStates.WaitingForInput)
          userDispatch({ type: "setUser", value: null })
        }
      })
  }

  return (
    <UserContext.Provider value={{ userStore, userDispatch }}>
      <AuthWrapper />

      {userStore.user && (

        <GameContext.Provider value={{ gameStore, gameDispatch }}>
          <p style={{ textAlign: "right" }}>playing as {userStore.user.username}<button onClick={logout}>logout</button></p>
          <div style={{ height: "100%", width: "100%", display: "flex", flexDirection: "column" }}>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<LobbyIndex {...{ gameName, setGameName }} />} />
                <Route path="/game" element={<Game />} />
              </Routes>
            </BrowserRouter>
          </div>
        </GameContext.Provider>
      )}
    </UserContext.Provider >
  )
}

export default App;
