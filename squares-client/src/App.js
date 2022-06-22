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
import Auth from './components/auth'

function App() {
  const [userStore, userDispatch] = useReducer(userReducer, initialUserData);
  const [gameStore, gameDispatch] = useReducer(gameReducer, initialGameData);

  const [gameName, setGameName] = useState("")

  // auth user
  useEffect(() => {
    let uid = localStorage.getItem("uid")
    console.log(uid)
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
          console.log(json)
          // localStorage.setItem("uid", json.)
          userDispatch({ type: "setUser", value: json })
        })
    }
  }, [])

  // setup game on page refresh
  useEffect(() => {
    // let gid = localStorage.getItem("uid")
    // if (gid) {
    //   fetch("http://localhost:8080/game", {
    //     method: "GET",
    //     credentials: "include"
    //   })
    //     .then(response => {
    //       if (response.status == 200) {
    //         return response.json()
    //       } else {
    //         localStorage.removeItem("gid")
    //         return
    //       }
    //     })
    //     .then(json => {
    //       if (!json) return

    //       dispatch({ type: "setGameId", value: json._id })
    //       dispatch({ type: "setGame", value: json })
    //     })
    // }
  }, [])

  return (
    <UserContext.Provider value={{ userStore, userDispatch }}>
      <Auth />
      <GameContext.Provider value={{ gameStore, gameDispatch }}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LobbyIndex {...{ gameName, setGameName }} />} />
            <Route path="/game" element={<Game />} />
          </Routes>
        </BrowserRouter>
      </GameContext.Provider>
    </UserContext.Provider >
  )
}

export default App;
