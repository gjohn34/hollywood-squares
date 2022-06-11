import {useState, useReducer} from 'react'
import Context, {initialData, reducer} from './context'

import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";
import Game from "./pages/Game.js"
import LobbyIndex from "./pages/LobbyIndex.js"

function App() {
	const [state, dispatch] = useReducer(reducer, initialData);

	const [username, setUsername] = useState("")
	const [gameName, setGameName] = useState("")

  return (
    <Context.Provider value={{state, dispatch}}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LobbyIndex {...{username, setUsername, gameName, setGameName}}/>} />
          <Route path="/game" element={<Game {...{username}}/>} /> 
        </Routes>
      </BrowserRouter>
    </Context.Provider>
  )
}

export default App;
