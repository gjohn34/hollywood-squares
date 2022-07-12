import React, { useState, useContext, useEffect } from 'react'
import UserContext from '../userContext'
import { Transition } from 'react-transition-group';


const ReadyStates = {
    WaitingForInput: "WaitingForInput",
    Fetching: "Fetching",
    Done: "Done"
}

function AuthForm() {

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
                    {/* <div style={{ zIndex: "1" }}> */}
                    <Auth />
                    {/* </div> */}
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
                <>
                    <form style={{
                        width: "33%", minWidth: 'fit-content', display: 'flex', flexDirection: 'column', border: 'solid 1px black', justifyContent: 'space-evenly', margin: '1em', padding: '1em 0'
                    }} onSubmit={handleSubmit}>
                        <div style={{ display: 'flex', justifyContent: "space-between", margin: '1em 0' }} >
                            <div style={{ width: "30%", textAlign: 'right', marginRight: "10%" }}>
                                <label>Username: </label>
                            </div>
                            <input style={{ width: "70%" }} value={username} onChange={e => setUsername(e.target.value)} /></div>

                        <div style={{ display: 'flex', justifyContent: "space-between", margin: '1em 0' }} >
                            <div style={{ width: "30%", textAlign: 'right', marginRight: "10%" }}>
                                <label>Password: </label>
                            </div>
                            <input style={{ width: "70%" }} value={password} onChange={e => setPassword(e.target.value)} />
                        </div>
                        <button style={{ alignSelf: 'center' }}>Up</button>
                    </form>
                    <form style={{
                        width: "33%", minWidth: 'fit-content', display: 'flex', flexDirection: 'column', border: 'solid 1px black', justifyContent: 'space-evenly', margin: '1em', padding: '1em 0'
                    }} onSubmit={handleLogin}>
                        <div style={{ display: 'flex', justifyContent: "space-between", margin: '1em 0' }} >
                            <div style={{ width: "30%", textAlign: 'right', marginRight: "10%" }}>
                                <label>Username: </label>
                            </div>
                            <input style={{ width: "70%" }} value={username} onChange={e => setUsername(e.target.value)} /></div>

                        <div style={{ display: 'flex', justifyContent: "space-between", margin: '1em 0' }} >
                            <div style={{ width: "30%", textAlign: 'right', marginRight: "10%" }}>
                                <label>Password: </label>
                            </div>
                            <input style={{ width: "70%" }} value={password} onChange={e => setPassword(e.target.value)} />
                        </div>
                        <button style={{ alignSelf: 'center' }}>In</button>
                    </form>
                </>
            )
        case ReadyStates.Fetching:
            return <p>loading pls wait</p>
        default: return null

    }
}

export default Auth