import { useContext, useEffect, useState } from "react"
import "./game.css"
import Context from '../context'
import GameBoard from "../components/GameBoard"
import GameLabel from "../components/GameLabel"

export default function Game() {
    // Lazy enum
    const GameState = {
        Waiting: "Waiting",
        Start: "Start",
    }

    const Player = {
        PlayerOne: "PlayerOne",
        PlayerTwo: "PlayerTwo"
    }

    const { state, dispatch } = useContext(Context)
    const { gameId, user } = state
    const [game, setGame] = useState(null)
    const [gameState, setGameState] = useState(GameState.Waiting)
    // const [prompt, setPrompt] = useState("")
    const [playingAs, setPlayingAs] = useState(null)
    const [turn, setTurn] = useState(Player.PlayerOne)
    const [question, setQuestion] = useState(null)
    const [boardArray, setBoardArray] = useState([[null, null, null], [null, null, null], [null, null, null]])

    useEffect(() => {
        if (!user) return
        let gameid = window.sessionStorage.getItem("gid")
        if (!gameId && gameid) {
            dispatch({ type: "setGameId", value: gameid })
        }
        if (gameid) {
            fetch("http://localhost:8080/game", {
                method: "GET",
                credentials: 'include'
            })
                .then(response => {
                    if (response.status === 200) {
                        return response.json()
                    } else {
                        window.sessionStorage.removeItem("gid")
                        return
                    }
                })
                .then(data => {
                    if (data) {
                        setPlayingAs(data.playerOne === user.username ? Player.PlayerOne : Player.PlayerTwo)
                        console.log("data")
                        console.log(data)
                        setGame(data)
                        gameSocket(data)
                        window.sessionStorage.setItem("gameId", data._id)
                    }
                })
        }
    }, [user])

    useEffect(() => {
        if (gameState === GameState.Start) {
            // setPrompt(`${game.turn % 2 == 0 ? game.playerOne : game.playerTwo}, select a square`)
            setTurn(Player.PlayerOne)
        }
    }, [gameState])

    const gameSocket = (initGame) => {
        let gameid = window.sessionStorage.getItem("gid")
        let uid = window.sessionStorage.getItem("uid")
        const ws = new WebSocket(`ws://localhost:8080/game?id=${gameid}&uid=${uid}`);
        ws.onopen = () => {
            console.log("Making game connection")
            dispatch({ type: "setClient", value: ws })
        }

        ws.onmessage = ({ data }) => {
            let json = JSON.parse(data)
            console.log(json)
            switch (json.type) {
                // case "initData":
                //     if (!game) {
                //         setGame({ ...initGame, playerTwo: json.value.playerTwo })
                //     }
                // break;
                case "playerTwoName":
                    if (json.value.playerTwo) {
                        setGame({ ...initGame, playerTwo: json.value.playerTwo })
                        setGameState(GameState.Start)
                    }
                    break;
                case "getQuestion":
                    setQuestion(json.value)
                    break
                case "getAnswer":
                    let copy = [...boardArray]
                    const { row, column, value } = json.value
                    copy[row][column] = value
                    setBoardArray(copy)
                    break;
                default:
                    break;
            }
        }
        ws.onclose = () => {
            console.log("closing");
        }
    }

    return (
        <div>
            <GameLabel {...{ turn, game }} />
            <GameBoard {...{ turn, question, playingAs, boardArray }} />
        </div >
    )
}