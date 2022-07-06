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
    Finished: "Finished"
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
    const { gameId, gameState, turn, question, playingAs, game } = gameStore
    const [promptMessage, setPromptMessage] = useState("")
    const [winner, setWinner] = useState(null)

    // TODO
    // Have board retrieved from game after fetch with right colours
    const [boardArray, setBoardArray] = useState([[null, null, null], [null, null, null], [null, null, null]])

    const getMessage = (turn, username) => {
        if (turn == playingAs) {
            if (playingAs == Player.PlayerOne) {
                return `${game.playerOne.username}, choose a square`
            } else {
                return `${game.playerTwo.username}, choose a square`
            }
        }
        return "waiting on other player"
    }

    useEffect(() => {
        if (!user || !game) return
        setPromptMessage(getMessage(turn, user.username))
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
                    if (data) {
                        gameDispatch({ type: "setGame", value: data })
                        setBoardArray(data.board)
                        gameDispatch({ type: "setGameState", value: data.playerOne && data.playerTwo ? GameState.Start : GameState.Waiting })
                        let x = data.playerOne._id == user._id ? Player.PlayerOne : Player.PlayerTwo
                        gameDispatch({ type: "setQuestion", value: data.question })
                        gameDispatch({ type: "setPlayingAs", value: x })
                        gameDispatch({ type: "setTurn", value: data.turn % 2 == 0 ? Player.PlayerOne : Player.PlayerTwo })
                        gameSocket(data, x)
                        localStorage.setItem("gid", data._id)
                    }
                })
        }
    }, [user])

    useEffect(() => {
        if (gameState === GameState.Start) {
            gameDispatch({ type: "setTurn", value: Player.PlayerOne })
        }
    }, [gameState])

    const gameSocket = (initGame, playingAs) => {
        let gameid = localStorage.getItem("gid")
        let uid = localStorage.getItem("uid")
        const ws = new WebSocket(`ws://localhost:8080/game?id=${gameid}&uid=${uid}`);
        ws.onopen = () => {
            userDispatch({ type: "setClient", value: ws })
        }

        ws.onmessage = ({ data }) => {
            let json = JSON.parse(data)
            switch (json.type) {
                case "playerTwoName":
                    if (json.value.username) {
                        gameDispatch({ type: "setGame", value: { ...initGame, playerTwo: json.value } })
                        gameDispatch({ type: "setGameState", value: GameState.Start })
                    }
                    break;
                case "getQuestion":
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
                case "gameOver":
                    // gameState not context?
                    gameDispatch({ type: "setGameState", value: GameState.Finished })
                    setWinner(json.value.value)
                    break;
                default:
                    break;
            }
        }
        ws.onclose = () => {
            userDispatch({ type: "setClient", value: null })
        }
    }

    return (
        <>
            {winner ? <p>winner winner {winner}</p> : (
                <div style={{ display: "flex" }}>
                    <GameLabel />
                    {gameState == GameState.Start && <GameBoard {...{ boardArray, promptMessage }} />}
                </div >
            )}
        </>
    )
}