import Vue from 'vue'
import Board from './board.js'
import Worker from 'worker-loader!./worker.js'
import PromiseWorker from 'promise-worker'


new Vue({
    el: "#app",
    props: [
        'rows',
        'cols',
        'holeRadius',
        'boardPadding',
        'pieceGap',
        'hoverHeight',
        'acceleration',
    ],
    propsData: {
        rows: 6,
        cols: 7,
        holeRadius: 20,
        boardPadding: 10,
        pieceGap: 10,
        hoverHeight: 10,
        acceleration: 1,
    },
    data: function() {
        return {
            hoverCol: null,
            board: new Board(this.rows, this.cols),
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
        pieceID: function(isHuman) {
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
})
