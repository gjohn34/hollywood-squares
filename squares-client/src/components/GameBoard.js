import React, { useContext } from 'react'
import BoardSquare from './BoardSquare.js'
import GameContext from '../gameContext'




function GameBoard({ boardArray, promptMessage }) {
    const { gameStore } = useContext(GameContext)
    const { playingAs, turn } = gameStore

    return (
        <div style={{ width: "50%" }}>
            <p>Current Turn: {turn}</p>
            <p>{promptMessage}</p>

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