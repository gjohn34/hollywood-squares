import React from 'react'

function GameLabel({ game, playingAs }) {
    return (
        <>
            <p>You are {playingAs}</p>
            {game && (
                <>
                    <p>Player One: {game.playerOne?.username}</p>
                    <p>Player Two: {game.playerTwo?.username || "waiting for player two..."}</p>
                </>
            )}
        </>
    )
}

export default GameLabel