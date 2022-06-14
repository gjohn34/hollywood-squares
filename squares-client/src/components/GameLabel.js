import React from 'react'

function GameLabel({ game, turn }) {
    return (
        <>
            {game && (
                <>
                    <p>Player One: {game.playerOne}</p>
                    <p>Player Two: {game.playerTwo || "waiting for player two..."}</p>
                    <p>Current Turn: {turn}</p>

                </>
            )
            }
        </>
    )
}

export default GameLabel