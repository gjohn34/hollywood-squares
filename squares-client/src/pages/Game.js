import { useContext, useEffect, useState } from "react"
import Context from '../context'
export default function Game() {
    const {state, dispatch} = useContext(Context)
    const {client, gameId} = state
    const [isReady, setIsReady] = useState(false)
    const [game, setGame] = useState(null)
    useEffect(() => {
        if (gameId) {
            fetch("http://localhost:8080/games/" + gameId)
            .then(response => response.json())
            .then(data => {
                setGame(data)
                gameSocket(data);
            })
       } else {
           client.send("help")
       }
    }, [])



    const gameSocket = (initGame) => {
        const ws = new WebSocket(`ws://localhost:8080/game?id=${gameId}`);
        ws.onopen = (x) => {
            console.log("Making game connection")
            dispatch({type: "setClient", value: ws})
        }
        
        ws.onmessage = ({ data }) => { 
            let json = JSON.parse(data)
            console.log(json)
            switch (json.type) {
                case "initData":
                    setGame({...initGame, playerTwo: json.value.playerTwo})
                    break;
                case "playerTwoName":
                    setGame({...initGame, playerTwo: json.value.playerTwo})
                default:
                    break;
            }
            setIsReady(true)
            // let playerTwoName = data.value.playerTwo
            // setGame({...initGame, playerTwo: playerTwoName})

            // parseData(data)
        }
        ws.onclose = (x) => {
            console.log("closing");
        }
    }
    return (
        <div>
        {game && (
            <>
            <p>Player One: {game.playerOne}</p>
            {isReady ? <p>Player Two: {game.playerTwo}</p> : <p>waiting for player two...</p>}
            </>
            )}
        </div>
    )
}