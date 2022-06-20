import React, { useContext, useEffect, useRef } from 'react'
import Context from './../context.js'

function BoardSquare({ playingAs, turn, display, row, column }) {
    const { state } = useContext(Context)
    const { client } = state
    const divEl = useRef(null)

    useEffect(() => {
        switch (display) {
            case null:
                divEl.current.style.backgroundColor = "grey"
                break;
            case 0:
                divEl.current.style.backgroundColor = "red"
                break;
            case 1:
                divEl.current.style.backgroundColor = "green"
                break;
            default:
                break;
        }
    }, [display])


    const squareClick = () => {
        if (playingAs !== turn) return;
        client.send(JSON.stringify({ type: "getQuestion", value: { row, column } }))
    }

    return (
        <div ref={divEl} className="square" onClick={squareClick}></div>
    )
}

export default BoardSquare