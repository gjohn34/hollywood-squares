import React, { useContext } from 'react'
import gameContext from '../gameContext.js'
import { useNavigate } from 'react-router-dom'

function GameLabel() {
    const nav = useNavigate()
    const { gameStore } = useContext(gameContext)
    const { game, playingAs, turn, question, gameClient } = gameStore

    const answer = bool => {
        gameClient.send(JSON.stringify({ type: "answerQuestion", value: bool, from: playingAs }))
    }

    const handleCancel = () => {
        gameClient.close()
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
        <div id="labels">
            {game && (
                <div>
                    <p><b>Player One:</b> {game.playerOne?.username}</p>
                    {game.playerTwo ? <p><b>Player Two:</b> {game.playerTwo.username}</p> : (
                        <>
                            <p>waiting for player two...<button onClick={handleCancel}>cancel</button></p>
                        </>
                    )}
                </div>
            )}
            {question && (
                <div className="display">
                    <p>{question.text}</p>
                    <p>Square says: {question.answer}</p>
                    {turn === playingAs && (
                        <div>
                            <button onClick={() => answer(true)}>True</button>
                            <span>OR</span>
                            <button onClick={() => answer(false)}>False</button>
                        </div   >
                    )}
                </div>
            )}
        </div>
    )
}

export default GameLabel