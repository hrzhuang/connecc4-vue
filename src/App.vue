<template>
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
                :key="col*row+row"
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
</template>


<script>
import Worker from 'worker-loader!./worker.js'
import PromiseWorker from 'promise-worker'
import Board from './board.js'
import gameGraphicsMixin from './gameGraphicsMixin.js'
import GameBoard from './GameBoard.vue'
import GamePiece from './GamePiece.vue'
import GameInvisibleColumn from './GameInvisibleColumn.vue'

export default {
    mixins: [ gameGraphicsMixin ],
    components: {
        GameBoard,
        GamePiece,
        GameInvisibleColumn,
    },
    data: function() {
        return {
            hoverCol: null,
            // The board object will be initiated in created hook
            board: null,
            animationState: null,
            awaitingInput: true,
            worker: new PromiseWorker(new Worker()),
        }
    },
    created: function() {
        this.board = new Board(this.rows, this.cols)
    },
    computed: {
        showHoveringPiece: function() {
            return this.hoverCol != null
                && this.board.isAvailableMove(this.hoverCol)
                && this.awaitingInput
        },
    },
    methods: {
        attemptMove: function(col) {
            if (this.awaitingInput) {
                this.awaitingInput = false

                Promise.all([
                    this.animateDrop(col, true)
                        .then(() => {
                            let { gameOver, draw } = this.board.makeMove(col, true)
                        }),
                    this.worker.postMessage({
                        board: this.board,
                        move: col,
                    })
                ])
                    .then(([, computerMove]) => {
                        return this.animateDrop(computerMove, false)
                            .then(() => {
                                let { gameOver, draw } = this.board.makeMove(computerMove, false)
                            })
                    })
                    .then(() => {
                        this.awaitingInput = true
                    })
            }
        },
        animateDrop: function(col, isHuman) {
            return new Promise(resolve => {
                this.animationState = {
                    col: col,
                    currentCY: this.pieceRadius,
                    isHuman: isHuman,
                }
                let targetCY = this.cy(this.board.colHeight(col))
                let velocity = 0
                let animate = () => {
                    velocity += this.acceleration
                    this.animationState.currentCY += velocity
                    if (this.animationState.currentCY >= targetCY) {
                        this.animationState = null
                        resolve()
                    }
                    else {
                        requestAnimationFrame(animate)
                    }
                }
                requestAnimationFrame(animate)
            })
        },
    },
}
</script>
