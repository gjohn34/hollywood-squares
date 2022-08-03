import { useState, useReducer, useEffect } from 'react'
import UserContext, { initialUserData, userReducer } from './userContext'
import GameContext, { initialGameData, gameReducer } from './gameContext'

import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import Game from "./pages/Game.js"
import LobbyIndex from "./pages/LobbyIndex.js"
import { AuthWrapper } from './components/auth'
import { SwitchTransition, Transition, TransitionGroup } from 'react-transition-group';



function AnimatedSwitch() {
  const location = useLocation()

  const defaultStyle = {
    transition: "transform 600ms, opacity 600ms",
  }

  const transitionStyles = {
    entering: {
      transform: 'translateX(0)',
      opacity: 1,
    },
    entered: {
      transform: 'translateX(0)',
      opacity: 1,
    },
    exiting: {
      transform: 'translateX(-100%)',
      opacity: 0,
    },
    exited: {
      transform: 'translateX(-100%)',
      opacity: 0,
    }
  };

  return (
    <TransitionGroup component={null}>
      <Transition
        key={location.pathname}
        timeout={300}
        unmountOnExit={true}
        mountOnEnter={true}
      >
        {state => (
          <PageWrapper styles={{ ...defaultStyle, ...transitionStyles[state] }}>
            <Routes>
              <Route path="/" element={<LobbyIndex state={state} />} />
              <Route path="/game" element={<Game state={state} />} />
            </Routes>
          </PageWrapper>
        )}
      </Transition>
    </TransitionGroup>
  )
}

function PageWrapper({ styles, children }) {
  return <main style={{ ...styles }}>{children}</main>
}


function App() {
  const [userStore, userDispatch] = useReducer(userReducer, initialUserData);
  const [gameStore, gameDispatch] = useReducer(gameReducer, initialGameData);

  const [gameName, setGameName] = useState("")

  // auth user
  useEffect(() => {
    let uid = localStorage.getItem("uid")
    if (uid) {
      fetch(`${process.env.REACT_APP_API_BASE}/auth/me`, {
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
    localStorage.removeItem('uid')
    fetch(`${process.env.REACT_APP_API_BASE}/auth/logout`, {
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
          <p style={{ textAlign: 'right' }}>playing as {userStore.user.username}<button onClick={logout}>logout</button></p>
          <BrowserRouter>
            <AnimatedSwitch />
          </BrowserRouter>
        </GameContext.Provider>
      )
      }
    </UserContext.Provider >
  )
}

export default App;
