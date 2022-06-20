import { useState, useReducer, useEffect } from 'react'
import Context, { initialData, reducer } from './context'

import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";
import Game from "./pages/Game.js"
import LobbyIndex from "./pages/LobbyIndex.js"
import Auth from './components/auth'

function App() {
  const [state, dispatch] = useReducer(reducer, initialData);

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
          dispatch({ type: "setUser", value: json })
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
    <Context.Provider value={{ state, dispatch }}>
      <Auth />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LobbyIndex {...{ gameName, setGameName }} />} />
          <Route path="/game" element={<Game />} />
        </Routes>
      </BrowserRouter>
    </Context.Provider>
  )
}

export default App;
