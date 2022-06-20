import React from 'react'

function GameLabel({ game, turn }) {
    return (
        <>
            {game && (
                <>
                    {console.log(game)}
                    <p>Player One: {game.playerOne?.username}</p>
                    <p>Player Two: {game.playerTwo?.username || "waiting for player two..."}</p>
                    <p>Current Turn: {turn}</p>

                </>
            )
            }
        </>
    )
}

export default GameLabel