let app = new Vue({
    el: "#app",
    props: [
        'rows',
        'columns',
        'holeRadius',
        'boardPadding',
        'pieceGap',
        'hoverHeight',
        'acceleration',
    ],
    propsData: {
        rows: 6,
        columns: 7,
        holeRadius: 20,
        boardPadding: 10,
        pieceGap: 10,
        hoverHeight: 10,
        acceleration: 1,
    },
    data: function() {
        return {
            hoverColumn: null,
            pieceColumns: Array(this.columns).fill(null).map(() => []),
            animationState: null,
        }
    },
    computed: {
        pieceRadius: function() {
            return this.holeRadius + 5
        },
        boardWidth: function() {
            return 2*this.pieceRadius*this.columns 
                + this.pieceGap*(this.columns - 1)
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
        freeColumns: function() {
            return Array.from(
                this.pieceColumns.keys()
            ).filter(column => {
                return this.pieceColumns[column].length < this.rows
            })
        },
        awaitingInput: function() {
            return !this.animationState
        },
        showHoveringPiece: function() {
            return this.hoverColumn != null
                && this.pieceColumns[this.hoverColumn].length < this.rows
                && this.awaitingInput
        },
    },
    methods: {
        cx: function(column) {
            return this.boardPadding 
                + (2*column + 1)*this.pieceRadius
                + this.pieceGap*column
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
        attemptMove: function(column) {
            if (this.awaitingInput) {
                this.animateDrop(column, true)
            }
        },
        animateDrop: function(column, isHuman) {
            return new Promise(resolve => {
                this.animationState = {
                    column: column,
                    currentCY: this.pieceRadius,
                    isHuman: isHuman,
                }
                let targetCY = this.cy(this.pieceColumns[column].length)
                let velocity = 0
                let animate = () => {
                    velocity += this.acceleration
                    this.animationState.currentCY += velocity
                    if (this.animationState.currentCY >= targetCY) {
                        this.animationState = null
                        this.pieceColumns[column].push(isHuman)
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
