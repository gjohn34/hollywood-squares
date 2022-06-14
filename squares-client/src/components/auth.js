import React, { useEffect, useState, useContext } from 'react'
import Context from '../context'

function Auth() {
    const { state, dispatch } = useContext(Context)
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const { user } = state

    const handleSubmit = e => {
        e.preventDefault()
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
                }
            })
            .then(json => {
                if (!json) return
                window.sessionStorage.setItem("uid", json._id)
                dispatch({ type: "setUser", value: json })

            })
    }


    const handleLogin = e => {
        e.preventDefault()
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
                }
            })
            .then(json => {
                if (!json) return

                window.sessionStorage.setItem("uid", json._id)
                dispatch({ type: "setUser", value: json })
            })
    }

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
                    dispatch({ type: "setUser", value: null })
                }
            })

    }
    return (
        <>
            {user ? <p>playing as {user.username}<button onClick={logout}>logout</button></p>
                : (
                    <>
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
                    </>
                )}
        </>
    )
}

export default Auth