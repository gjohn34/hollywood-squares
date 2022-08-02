import React, { useContext } from 'react'
import gameContext from '../gameContext.js'
import UserContext from '../userContext.js'
import { useNavigate } from 'react-router-dom'

function GameLabel() {
    const { userStore } = useContext(UserContext)
    const nav = useNavigate()
    const { client } = userStore
    const { gameStore } = useContext(gameContext)
    const { game, playingAs, turn, question } = gameStore

    const answer = bool => {
        client.send(JSON.stringify({ type: "answerQuestion", value: bool, from: playingAs }))
    }

    const handleCancel = () => {
        client.close()
        localStorage.removeItem("gid")
        fetch(`${process.env.REACT_APP_API_BASE}/games/${game._id}`, {
            method: "DELETE",
            credentials: "include",
            headers: {
                "Accept": "application/json"
            }
        })
            .then(response => {
                if (response.status == 204) {
                    nav("/")
                }
            })
    }

    return (
        <div style={{ width: "50%" }}>
            <p>You are {playingAs}</p>
            {game && (
                <>
                    <p>Player One: {game.playerOne?.username}</p>
                    {game.playerTwo ? <p>Player Two: {game.playerTwo.username}</p> : (
                        <>
                            <p>waiting for player two...<button onClick={handleCancel}>cancel</button></p>
                        </>
                    )}
                </>
            )}
            <>
                {question && (
                    <>
                        <p>{question.text}</p>
                        <p>Square says: {question.answer}</p>
                        {turn === playingAs && (
                            <>
                                <p>True or false?</p>
                                <button onClick={() => answer(true)}>True</button>
                                <button onClick={() => answer(false)}>False</button>
                            </>
                        )}
                    </>
                )}
            </>
        </div>
    )
}

export default GameLabel