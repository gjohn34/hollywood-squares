import React, { useContext } from 'react'
import BoardSquare from './BoardSquare.js'
import GameContext from '../gameContext'




function GameBoard({ boardArray }) {
    const { gameStore } = useContext(GameContext)
    const { playingAs, turn } = gameStore
    console.log(boardArray)

    return (
        <div style={{ width: "50%" }}>
            <p>Current Turn: {turn}</p>

            <div id="container">
                {boardArray.map((subArray, row) => (
                    <div key={`${row}`} className="row">
                        {subArray.map((display, column) => (
                            <BoardSquare key={`${row}${column}`} {...{ playingAs, turn, display, row, column }} />
                        ))}
                    </div>
                ))}
            </div>
        </div>

    )
}

export default GameBoard