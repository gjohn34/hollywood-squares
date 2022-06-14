import React, { useContext, useEffect } from 'react'
import Context from '../context.js'
import BoardSquare from './BoardSquare.js'



function GameBoard({ turn, question, playingAs, boardArray }) {
    const { state } = useContext(Context)
    const { client } = state

    const answer = bool => {
        client.send(JSON.stringify({ type: "answerQuestion", value: bool }))
    }

    return (
        <>
            {turn === playingAs ? (
                <>
                    {question && (
                        <>
                            <p>{question.text}</p>
                            <p>Square says: {question.answer}</p>
                            <p>True or false?</p>
                            <button onClick={() => answer(true)}>True</button>
                            <button onClick={() => answer(false)}>False</button>
                        </>
                    )}
                </>
            ) : <p>waiting on other player</p>}
            <div id="container">
                {boardArray.map((subArray, row) => (
                    <div className="row">
                        {subArray.map((display, column) => (
                            <BoardSquare {...{ playingAs, turn, display, row, column }} />
                        ))}
                    </div>
                ))}
            </div>
        </>

    )
}

export default GameBoard