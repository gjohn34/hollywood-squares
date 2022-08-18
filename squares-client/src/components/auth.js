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
    const [error, setError] = useState(null)
    const [show, setShow] = useState(null)

    useEffect(() => {
        setReadyState(!!user ? ReadyStates.Done : ReadyStates.WaitingForInput)
    }, [user])

    const handleSubmit = (e, login = false) => {
        e.preventDefault()
        if (username == "" || password == "") {
            setShow(true)
            setError("Need username and password.")
            return
        }
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
                if (!json) {
                    setShow(true)
                    setError("Try again with different credentials.")
                    return
                }
                localStorage.setItem("uid", json._id)
                userDispatch({ type: "setUser", value: json })
            })
    }

    const defaultStyle = {
        transition: 'opacity 200ms ease-in',
        position: 'absolute',
        backgroundColor: 'black',
        color: 'white',
        // borderRadius: '2em',
        // minWidth: 'fit-content',
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        opacity: 0,
    }

    const TransitionStyles = {
        entering: { opacity: 0 },
        entered: { opacity: 1 },
        exiting: { opacity: 0 },
        exited: { opacity: 0 },
    };

    switch (readyState) {
        case ReadyStates.WaitingForInput:
            return (
                <>
                    <Transition in={!!show} mountOnEnter={true} unmountOnExit={true} timeout={200}>
                        {state => (
                            <div style={{ ...defaultStyle, ...TransitionStyles[state] }}>
                                <p>{error}</p>
                                <button onClick={() => { setShow(null); setTimeout(() => setError(null), 200) }}>Got it</button>
                            </div>
                        )}
                    </Transition>
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
                </>

            )
        case ReadyStates.Fetching:
            return <>
                <Transition in={!!error} mountOnEnter={true} unmountOnExit={true} timeout={200}>
                    {state => (
                        <div style={{ ...defaultStyle, ...TransitionStyles[state] }}>
                            <p>{error}</p>
                            <button onClick={() => setError(null)}>Got it</button>
                        </div>
                    )}
                </Transition>
                <p>loading pls wait</p>
            </>
        default: return null

    }
}

export default Auth