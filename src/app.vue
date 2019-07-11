<template>
    <svg
        version="1.1"
        baseprofile="full"
        :width="boardWidth"
        :height="aboveBoard + boardHeight"
        xmlns="http://www.w3.org/2000/svg">

        <defs>
            <mask id="boardMask">
                <rect
                    :y="aboveBoard"
                    :width="boardWidth"
                    :height="boardHeight"
                    fill="white"
                    rx="10"
                    />
                <template v-for="(_, row) in rows">
                    <circle
                        v-for="(_, col) in cols"
                        :cx="cx(col)"
                        :cy="cy(row)"
                        :r="holeRadius"
                        />
                </template>
            </mask>
            <circle
                id="humanPiece"
                :r="pieceRadius"
                fill="#ffd500"
                />
            <circle
                id="computerPiece"
                :r="pieceRadius"
                fill="#e63c1a"
                />
        </defs>

        <!-- pieces on board -->
        <template
            v-for="(_, col) in board.cols">
            <use
                v-for="(_, row) in board.colHeight(col)"
                :href="pieceId(board.get(row, col))"
                :x="cx(col)"
                :y="cy(row)"
                />
        </template>

        <!-- Hovering piece -->
        <use 
            v-show="showHoveringPiece"
            href="#humanPiece"
            :x="cx(hoverCol)"
            :y="pieceRadius"
            />

        <!-- Animated piece -->
        <use
            v-if="animationState"
            :href="pieceId(animationState.isHuman)"
            :x="cx(animationState.col)"
            :y="animationState.currentCY"
            />

        <!-- Board cover -->
        <rect
            :y="aboveBoard"
            :width="boardWidth" 
            :height="boardHeight" 
            fill="#3d6bf5"
            mask="url(#boardMask)"
            />

        <!-- Hover column detector -->
        <rect
            v-for="col in board.availableMoves()"
            :x="boardPadding + col*(2*pieceRadius + pieceGap)"
            :y="aboveBoard"
            :width="2*pieceRadius"
            :height="boardHeight"
            fill="none"
            pointer-events="visible"
            @mouseover="hoverCol = col"
            @mouseout="hoverCol = null"
            @click="attemptMove(col)"
            />
    </svg>
</template>


<script>
import Board from './board.js'
import Worker from 'worker-loader!./worker.js'
import PromiseWorker from 'promise-worker'

const rows = 6, cols = 7
const holeRadius = 20, boardPadding = 10, pieceGap = 10, hoverHeight = 10
const acceleration = 1

export default {
    data: function() {
        return {
            /* Constants */
            rows,
            cols,
            holeRadius,
            boardPadding,
            pieceGap,
            hoverHeight,
            acceleration,

            /* Variables */
            hoverCol: null,
            board: new Board(rows, cols),
            animationState: null,
            awaitingInput: true,
            worker: new PromiseWorker(new Worker()),
        }
    },
    computed: {
        pieceRadius: function() {
            return this.holeRadius + 5
        },
        boardWidth: function() {
            return 2*this.pieceRadius*this.cols 
                + this.pieceGap*(this.cols - 1)
                + 2*this.boardPadding
        },
        boardHeight: function() {
            return 2*this.pieceRadius*this.rows 
                + this.pieceGap*(this.rows - 1)
                + 2*this.boardPadding
        },
        aboveBoard: function() {
            return 2*this.pieceRadius + this.hoverHeight
        },
        showHoveringPiece: function() {
            return this.hoverCol != null
                && this.board.isAvailableMove(this.hoverCol)
                && this.awaitingInput
        },
    },
    methods: {
        cx: function(col) {
            return this.boardPadding 
                + (2*col + 1)*this.pieceRadius
                + this.pieceGap*col
        },
        cy: function(row) {
            return this.aboveBoard
                + this.boardHeight
                - this.boardPadding
                - (2*row + 1)*this.pieceRadius
                - this.pieceGap*row
        },
        pieceId: function(isHuman) {
            if (isHuman) {
                return "#humanPiece"
            }
            else {
                return "#computerPiece"
            }
        },
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
