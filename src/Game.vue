<template>
    <div>
        <svg
            version="1.1"
            baseprofile="full"
            :width="boardWidth"
            :height="aboveBoard + boardHeight"
            xmlns="http://www.w3.org/2000/svg">

            <!-- pieces on board -->
            <template
                v-for="(_, col) in cols"
                >
                <GamePiece
                    v-for="(_, row) in board.colHeight(col)"
                    :key="`${row},${col}`"
                    :isHuman="board.get(row, col)"
                    :x="cx(col)"
                    :y="cy(row)"
                    />
            </template>

            <!-- Hovering piece -->
            <GamePiece 
                v-show="showHoveringPiece"
                :isHuman="true"
                :x="cx(hoverCol)"
                :y="pieceRadius"
                />

            <!-- Animated piece -->
            <GamePiece
                v-if="animationState"
                :isHuman="animationState.isHuman"
                :x="cx(animationState.col)"
                :y="animationState.currentCY"
                />

            <GameBoard />

            <!-- Hover column detector -->
            <GameInvisibleColumn
                v-for="col in board.availableMoves()"
                :key="col"
                :col="col"
                @mouseover.native="hoverCol = col"
                @mouseout.native="hoverCol = null"
                @click.native="attemptMove(col)"
                />
        </svg>

        <GameMessageBar
            :humanTurn="humanTurn"
            :gameOver="gameOver"
            :humanWin="humanWin"
            />
    </div>
</template>


<script>
import PromiseWorker from 'promise-worker'

import Worker from 'worker-loader!./worker.js'
import Board from './board.js'

/* Mixins */
import gameGraphicsMixin from './gameGraphicsMixin.js'

/* Components */
import GameBoard from './GameBoard.vue'
import GamePiece from './GamePiece.vue'
import GameInvisibleColumn from './GameInvisibleColumn.vue'
import GameMessageBar from './GameMessageBar.vue'

export default {
    mixins: [ gameGraphicsMixin ],
    components: {
        GameBoard,
        GamePiece,
        GameInvisibleColumn,
        GameMessageBar,
    },
    data: function() {
        return {
            // The column the mouse is hovering over
            hoverCol: null,

            // The game board containing placed pieces; initialized in created
            // hook
            board: null,

            // The state of the drop animation
            animationState: null,

            // The state of the game flow
            // humanWin: true = human wins, false = computer wins, null = draw
            humanTurn: true,
            gameOver: false,
            humanWin: null, // Is not relevant until game is over

            // The worker responsible for the computer player
            worker: new PromiseWorker(new Worker()),
        }
    },
    created: function() {
        // Initialize the game board
        this.board = new Board(this.rows, this.cols)
    },
    computed: {
        showHoveringPiece: function() {
            return this.hoverCol != null
                && this.board.isAvailableMove(this.hoverCol)
                && this.humanTurn
        },
    },
    methods: {
        attemptMove: async function(col) {
            let gameOver, draw

            // Only proceed with the attempt if it's actually the human's turn 
            // to move
            if (this.humanTurn) {
                this.humanTurn = false

                let [, computerMove] = await Promise.all([
                    (async () => {
                        // Piece drop animation
                        await this.animateDrop(col, true)

                        // Make the human player's move onto the actual board
                        ;({ gameOver, draw } = this.board.makeMove(col, true))
                    })(),

                    // Compute computer player's next move
                    this.worker.postMessage({
                        board: this.board,
                        move: col,
                    }),
                ])

                if (gameOver) {
                    // Update state of game flow
                    this.gameOver = true
                    if (!draw)
                        this.humanWin = true
                }
                else {
                    // Piece drop animation
                    await this.animateDrop(computerMove, false)

                    // Make the computer player's move onto the actual board
                    ;({ gameOver, draw } =
                        this.board.makeMove(computerMove, false))

                    if (gameOver) {
                        // Update state of game flow
                        this.gameOver = true
                        if (!draw)
                            this.humanWin = false
                    }
                    else {
                        // Return control back to human player
                        this.humanTurn = true
                    }
                }
            }
        },
        animateDrop: function(col, isHuman) {
            return new Promise(resolve => {
                // Initiate animation variables
                this.animationState = {
                    col: col,
                    currentCY: this.pieceRadius,
                    isHuman: isHuman,
                }
                let targetCY = this.cy(this.board.colHeight(col))
                let velocity = 0

                let animate = () => {
                    // Compute next frame
                    velocity += this.acceleration
                    this.animationState.currentCY += velocity

                    if (this.animationState.currentCY >= targetCY) {
                        // End animation
                        this.animationState = null
                        resolve()
                    }
                    else {
                        // Queue next frame
                        requestAnimationFrame(animate)
                    }
                }

                // Queue first frame
                requestAnimationFrame(animate)
            })
        },
    },
}
</script>
