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
        PlayerTwo: "PlayerTwo",
        Next: player => {
            if (player == Player.PlayerOne) {
                return Player.PlayerTwo
            } else if (player == Player.PlayerTwo) {
                return Player.PlayerOne
            }
        }
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
        console.log("It is now " + turn + "'s turn")

    }, [turn])


    useEffect(() => {
        if (!user) return
        let gameid = localStorage.getItem("gid")
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
                        localStorage.removeItem("gid")
                        return
                    }
                })
                .then(data => {
                    if (data) {
                        setGame(data)
                        setPlayingAs(data.playerOne.id === user.id ? Player.PlayerOne : Player.PlayerTwo)
                        gameSocket(data)
                        localStorage.setItem("gameId", data._id)
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

        let gameid = localStorage.getItem("gid")
        let uid = localStorage.getItem("uid")
        const ws = new WebSocket(`ws://localhost:8080/game?id=${gameid}&uid=${uid}`);
        ws.onopen = () => {
            console.log("Making game connection")
            dispatch({ type: "setClient", value: ws })
        }

        ws.onmessage = ({ data }) => {
            let json = JSON.parse(data)
            // console.log(json)
            console.log(json)
            switch (json.type) {
                case "playerTwoName":
                    if (json.value.username) {
                        console.log("setting game")
                        setGame({ ...initGame, playerTwo: json.value })
                        setGameState(GameState.Start)
                    }
                    break;
                case "getQuestion":
                    setQuestion(json.value)
                    break
                case "getAnswer":
                    const { row, column, value } = json.value
                    if (value == true) {
                        let copy = [...boardArray]
                        let cell;
                        if (turn == Player.PlayerOne) {
                            cell = 0
                        } else {
                            cell = 1
                        }
                        copy[row][column] = cell
                        setBoardArray(copy)
                    }
                    setTurn(Player.Next(turn))
                    setQuestion(null)
                    break;
                default:
                    console.log(json)
                    break;
            }
        }
        ws.onclose = () => {
            console.log("closing");
        }
    }

    return (
        <div>
            <p>👏</p>
            <GameLabel {...{ turn, game }} />
            <GameBoard {...{ turn, question, playingAs, boardArray }} />
        </div >
    )
}