import React, { useContext } from 'react'
import gameContext from '../gameContext.js'
import UserContext from '../userContext.js'


function GameLabel() {
    const { userStore } = useContext(UserContext)
    const { client } = userStore
    const { gameStore } = useContext(gameContext)
    const { game, playingAs, turn, question } = gameStore

    const answer = bool => {
        client.send(JSON.stringify({ type: "answerQuestion", value: bool, from: playingAs }))
    }

    return (
        <div style={{ width: "50%" }}>
            <p>You are {playingAs}</p>
            {game && (
                <>
                    <p>Player One: {game.playerOne?.username}</p>
                    <p>Player Two: {game.playerTwo?.username || "waiting for player two..."}</p>
                </>
            )}
            <>
                {question && (
                    <>
                        <p>{question.text}</p>
                        <p>Square says: {question.answer}</p>
                        <p>True or false?</p>
                        {turn === playingAs ? (
                            <>
                                <button onClick={() => answer(true)}>True</button>
                                <button onClick={() => answer(false)}>False</button>
                            </>
                        ) : <p>waiting on other player</p>}
                    </>
                )}
            </>
        </div>
    )
}

export default GameLabel