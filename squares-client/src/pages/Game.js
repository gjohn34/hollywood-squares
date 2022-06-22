import { useContext, useEffect, useState } from "react"
import "./game.css"
import UserContext from '../userContext'
import GameContext from '../gameContext'
import GameBoard from "../components/GameBoard"
import GameLabel from "../components/GameLabel"

export const GameState = {
    Loading: "Loading",
    Waiting: "Waiting",
    Start: "Start",
}

export const Player = {
    PlayerOne: "PlayerOne",
    PlayerTwo: "PlayerTwo"
}

export default function Game() {
    // Lazy enum

    const { userStore, userDispatch } = useContext(UserContext)
    const { user } = userStore
    const { gameStore, gameDispatch } = useContext(GameContext)
    const { gameId, gameState, turn, question } = gameStore

    // TODO
    // Have board retrieved from game after fetch
    const [boardArray, setBoardArray] = useState([[null, null, null], [null, null, null], [null, null, null]])

    useEffect(() => {
        console.log("It is now " + turn + "'s turn")
    }, [turn])


    useEffect(() => {
        if (!user) return
        let gameid = localStorage.getItem("gid")
        if (!gameId && gameid) {
            gameDispatch({ type: "setGameId", value: gameid })
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
                    console.log(data)
                    if (data) {
                        gameDispatch({ type: "setGame", value: data })
                        gameDispatch({ type: "setGameState", value: data.playerOne && data.playerTwo ? GameState.Start : GameState.Waiting })
                        let x = data.playerOne._id == user._id ? Player.PlayerOne : Player.PlayerTwo
                        gameDispatch({ type: "setPlayingAs", value: x })
                        gameSocket(data, x)
                        localStorage.setItem("gid", data._id)
                    }
                })
        }
    }, [user])

    useEffect(() => {
        if (gameState === GameState.Start) {
            // setPrompt(`${game.turn % 2 == 0 ? game.playerOne : game.playerTwo}, select a square`)
            gameDispatch({ type: "setTurn", value: Player.PlayerOne })
        }
    }, [gameState])

    const gameSocket = (initGame, playingAs) => {
        let gameid = localStorage.getItem("gid")
        let uid = localStorage.getItem("uid")
        const ws = new WebSocket(`ws://localhost:8080/game?id=${gameid}&uid=${uid}`);
        ws.onopen = () => {
            console.log("Making game connection")
            userDispatch({ type: "setClient", value: ws })
        }

        ws.onmessage = ({ data }) => {
            let json = JSON.parse(data)
            // console.log(json)
            switch (json.type) {
                case "playerTwoName":
                    if (json.value.username) {
                        console.log("setting game")
                        gameDispatch({ type: "setGame", value: { ...initGame, playerTwo: json.value } })
                        gameDispatch({ type: "setGameState", value: GameState.Start })
                    }
                    break;
                case "getQuestion":
                    console.log('question   ')
                    gameDispatch({ type: "setQuestion", value: json.value })
                    break
                case "getAnswer":
                    const { row, column, value, from } = json.value
                    if (value == true) {
                        let copy = [...boardArray]
                        let cell;
                        if (from == Player.PlayerOne) {
                            cell = 0
                        } else {
                            cell = 1
                        }
                        copy[row][column] = cell
                        setBoardArray(copy)
                    }
                    gameDispatch({ type: "setTurn", value: from == Player.PlayerOne ? Player.PlayerTwo : Player.PlayerOne })
                    gameDispatch({ type: "setQuestion", value: null })

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
        <div style={{ display: "flex" }}>
            <GameLabel />
            {gameState == GameState.Start && <GameBoard {...{ boardArray }} />}
        </div >
    )
}