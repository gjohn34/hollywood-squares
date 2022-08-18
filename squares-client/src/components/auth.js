import React, { useState, useContext, useEffect } from 'react'
import UserContext from '../userContext'
import '../css/auth.css'
import { Transition } from 'react-transition-group';


const ReadyStates = {
    WaitingForInput: "WaitingForInput",
    Fetching: "Fetching",
    Done: "Done"
}


export function AuthWrapper() {
    const { userStore } = useContext(UserContext)


    const TransitionStyles = {
        entering: { height: "100%" },
        entered: { height: "0%" },
        exiting: { height: "100%" },
        exited: { height: "100%" },
    };

    return (
        <Transition in={!!userStore.user} timeout={1000}>
            {state => (
                <div id="auth-wrapper" style={{ transition: "height 1000ms ease-in", ...TransitionStyles[state] }}>
                    <Auth />
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

    const handleSubmit = (e, login = false) => {
        e.preventDefault()
        if (username == "" || password == "") return
        setReadyState(ReadyStates.Fetching)
        fetch(`${process.env.REACT_APP_API_BASE}/auth/${login ? "login" : "signup"}`, {
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

    switch (readyState) {
        case ReadyStates.WaitingForInput:
            return (
                <form onSubmit={handleSubmit}>
                    <div>
                        <div>
                            <label>Username: </label>
                        </div>
                        <input value={username} onChange={e => setUsername(e.target.value)} /></div>

                    <div>
                        <div>
                            <label>Password: </label>
                        </div>
                        <input value={password} onChange={e => setPassword(e.target.value)} />
                    </div>
                    <button>New Player</button>
                </form>
            )
        case ReadyStates.Fetching:
            return <p>loading pls wait</p>
        default: return null

    }
}

export default Auth