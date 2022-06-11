import { useContext, useEffect, useState } from "react"
import "./game.css"
import Context from '../context'


export default function Game({username}) {
    // Lazy enum
    const GameState = {
        Waiting: "Waiting",
        Start: "Start",
    }

    const Player = {
        PlayerOne: "PlayerOne",
        PlayerTwo: "PlayerTwo"
    }

    const {state, dispatch} = useContext(Context)
    const {client, gameId} = state
    const [isReady, setIsReady] = useState(false)
    const [game, setGame] = useState(null)
    const [gameState, setGameState] = useState(GameState.Waiting)
    const [prompt, setPrompt] = useState("")
    const [playingAs, setPlayingAs] = useState(null)
    const [turn, setTurn] = useState(Player.PlayerOne)

    useEffect(() => {
        if (gameId) {
            fetch("http://localhost:8080/games/" + gameId)
            .then(response => response.json())
            .then(data => {
                setPlayingAs(data.playerOne == username ? Player.PlayerOne : Player.PlayerTwo)
                setGame(data)
                gameSocket(data);
            })
       } else {
           client.send("help")
       }
    }, [])

    useEffect(() => {
        if (gameState == GameState.Start) {
            setPrompt(`${game.turn % 2 == 0 ? game.playerOne : game.playerTwo}, select a square`)
            setTurn(Player.PlayerOne)
        }

    }, [gameState])

    const gameSocket = (initGame) => {
        const ws = new WebSocket(`ws://localhost:8080/game?id=${gameId}`);
        ws.onopen = (x) => {
            console.log("Making game connection")
            dispatch({type: "setClient", value: ws})
        }
        
        ws.onmessage = ({ data }) => { 
            let json = JSON.parse(data)
            switch (json.type) {
                case "initData":
                    setGame({...initGame, playerTwo: json.value.playerTwo})
                    break;
                case "playerTwoName":
                    console.log("bar")
                    setGame({...initGame, playerTwo: json.value.playerTwo})
                    setGameState(GameState.Start)
                default:
                    break;
            }
            setIsReady(true)
        }
        ws.onclose = (x) => {
            console.log("closing");
        }
    }

    const squareClick = (e) => {
        // if (playingAs !== turn) return;
        console.log(playingAs)
        console.log(turn)
    }
    return (
        <div>
        {game && (
            <>
                <p>Player One: {game.playerOne}</p>
                <p>Player Two: {game.playerTwo || "waiting for player two..."}</p>
                <p>Current Turn: {turn}</p>
                <p>{turn == playingAs ? prompt : "waiting on other player"}</p>
                <div id="container">
                    <div className="row">
                        <div className="square" onClick={squareClick}></div>
                        <div className="square"></div>
                        <div className="square"></div>
                    </div>
                    <div className="row">
                        <div className="square"></div>
                        <div className="square"></div>
                        <div className="square"></div>
                    </div>
                    <div className="row">
                        <div className="square"></div>
                        <div className="square"></div>
                        <div className="square"></div>
                    </div>
                </div>
            </>
        )}
        </div>
    )
}