import { useContext, useEffect, useState } from "react"
import "../css/game.css"
import { useNavigate } from "react-router-dom"
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

export default function Game({ state }) {
    const { userStore } = useContext(UserContext)
    const { user } = userStore
    const { gameStore, gameDispatch } = useContext(GameContext)
    const { gameState, turn, playingAs, game, winner, gameClient } = gameStore
    const [promptMessage, setPromptMessage] = useState("")
    const nav = useNavigate()

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
        let gameId = localStorage.getItem("gid")
        if (!gameId) nav("/")


        if (state == 'entered') {
            fetch(`${process.env.REACT_APP_API_BASE}/game`, {
                method: "GET",
                credentials: 'include'
            })
                .then(response => {
                    if (response.status === 200) {
                        return response.json()
                    } else {
                        localStorage.removeItem("gid")
                        nav("/")
                        return
                    }
                })
                .then(data => {
                    if (data) {
                        // TODO - Clean this trash up
                        gameDispatch({ type: "setGame", value: data })
                        gameDispatch({ type: "setBoard", value: data.board })
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

    }, [])

    useEffect(() => {
        return () => {
            if (gameClient) {
                gameClient.close()
            }
        }
    }, [])

    // useEffect(() => {
    //     if (gameState === GameState.Start) {
    //         gameDispatch({ type: "setTurn", value: Player.PlayerOne })
    //     }
    // }, [gameState])

    const gameSocket = (initGame) => {
        let gameId = localStorage.getItem("gid")
        let uid = localStorage.getItem("uid")
        const ws = new WebSocket(`${process.env.REACT_APP_WS_BASE}/game?id=${gameId}&uid=${uid}`);
        ws.onopen = () => {
            gameDispatch({ type: "setGameClient", value: ws })
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
                    const { from, board } = json.value
                    // TODO Clean these dispatches up
                    gameDispatch({ type: "setTurn", value: from == Player.PlayerOne ? Player.PlayerTwo : Player.PlayerOne })
                    gameDispatch({ type: "setQuestion", value: null })
                    gameDispatch({ type: "setBoard", value: board })
                    break;
                case "gameOver":
                    gameDispatch({ type: "setGameState", value: GameState.Finished })
                    gameDispatch({ type: "setWinner", value: json.value })
                    break;
                default:
                    break;
            }
        }
        ws.onclose = () => {
            gameDispatch({ type: "setGameClient", value: null })
        }
    }

    return (
        <>
            {winner ? <GameOver /> : (
                <div id='gp'>
                    <GameLabel />
                    {gameState == GameState.Start && <GameBoard {...{ promptMessage }} />}
                </div >
            )}
        </>
    )
}

function GameOver() {
    const nav = useNavigate()

    const { gameStore } = useContext(GameContext)
    const { winner, playingAs, gameClient } = gameStore

    const handleCancel = () => {
        gameClient.close()
        localStorage.removeItem("gid")
        nav("/")
    }
    return winner == playingAs ? (
        <>
            <div id="overlay" className="win"></div>
            <p>Winner winner {winner}</p>
            <button onClick={handleCancel}>Back to lobby</button>
        </>
    ) : (
        <>
            <div id="overlay" className="lost"></div>
            <p>better luck next time</p>
            <button onClick={handleCancel}>Back to lobby</button>
        </>
    )
}