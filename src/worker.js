import registerPromiseWorker from 'promise-worker/register'
import Board from './board.js'


const depth = 4


registerPromiseWorker(message => {
    let board = Board.from(message.board)
    let gameOver = board.makeMove(message.move, true)

    let availableMoves = board.availableMoves()
    let bestMove = availableMoves[0]
    let bestScore = board.minimax(bestMove, depth, false)

    let score
    for (let move of availableMoves.slice(1)) {
        score = board.minimax(move, depth, false)

        if (score > bestScore) {
            bestScore = score
            bestMove = move
        }
    }

    return bestMove
})
