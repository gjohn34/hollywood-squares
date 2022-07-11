import React, { useState, useContext, useEffect } from 'react'
import UserContext from '../userContext'
import { Transition } from 'react-transition-group';


const ReadyStates = {
    WaitingForInput: "WaitingForInput",
    Fetching: "Fetching",
    Done: "Done"
}

export function AuthWrapper() {
    const { userStore, userDispatch } = useContext(UserContext)
    const { user } = userStore


    const defaultStyle = {
        display: "flex",
        flexDirection: 'column',
        justifyContent: "center",
        alignItems: "center",
        height: "100%",
        width: "100%",
        overflow: "hidden"
    }

    const TransitionStyles = {
        entering: { height: "100%" },
        entered: { height: "0%" },
        exiting: { height: "100%" },
        exited: { height: "100%" },
    };

    return (
        <Transition in={!!userStore.user} timeout={1000}>
            {state => (
                <div style={{ ...defaultStyle, transition: "height 1000ms ease-in", position: "absolute", backgroundColor: "red", ...TransitionStyles[state] }}>
                    <div style={{ zIndex: "1" }}>
                        <Auth />
                    </div>
                </div>
            )}

        </Transition>
    )

}
function Auth() {
    const { userStore, userDispatch } = useContext(UserContext)
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const { user } = userStore
    const [readyState, setReadyState] = useState(user ? ReadyStates.Done : ReadyStates.WaitingForInput)

    useEffect(() => {
        setReadyState(!!user ? ReadyStates.Done : ReadyStates.WaitingForInput)
    }, [user])

    const handleSubmit = e => {
        e.preventDefault()
        setReadyState(ReadyStates.Fetching)
        fetch("http://localhost:8080/auth/signup", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({ username, password })
        })
            .then(response => {
                if (response.status == 201) {
                    return response.json()
                } else {
                    setReadyState(ReadyStates.WaitingForInput)
                }
            })
            .then(json => {
                if (!json) return
                localStorage.setItem("uid", json._id)
                userDispatch({ type: "setUser", value: json })
            })
    }


    const handleLogin = e => {
        e.preventDefault()
        setReadyState(ReadyStates.Fetching)

        fetch("http://localhost:8080/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({ username, password })
        })
            .then(response => {
                if (response.status == 200) {
                    return response.json()
                } else {
                    setReadyState(ReadyStates.WaitingForInput)
                }
            })
            .then(json => {
                if (!json) return

                localStorage.setItem("uid", json._id)
                userDispatch({ type: "setUser", value: json })
            })
    }


    switch (readyState) {
        case ReadyStates.WaitingForInput:
            return (
                <div>
                    <form onSubmit={handleSubmit}>
                        <div><label>Username: </label><input value={username} onChange={e => setUsername(e.target.value)} /></div>
                        <div><label>Password: </label><input value={password} onChange={e => setPassword(e.target.value)} /></div>
                        <div><button>Submit</button></div>
                    </form>
                    <form onSubmit={handleLogin}>
                        <div><label>Username: </label><input value={username} onChange={e => setUsername(e.target.value)} /></div>
                        <div><label>Password: </label><input value={password} onChange={e => setPassword(e.target.value)} /></div>
                        <div><button>Submit</button></div>
                    </form>
                </div>
            )
        case ReadyStates.Fetching:
            return <p>loading pls wait</p>
        default: return null

    }
}

export default Auth