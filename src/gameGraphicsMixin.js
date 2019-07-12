export default {
    data: function() {
        return {
            rows: 6,
            cols: 7,
            holeRadius: 20,
            boardPadding: 10,
            pieceGap: 10,
            hoverHeight: 10,
            acceleration: 1,
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
    },
}
