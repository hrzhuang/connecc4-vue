let app = new Vue({
    el: "#app",
    props: [
        'rows',
        'columns',
        'holeRadius',
        'boardPadding',
        'pieceGap',
        'hoverHeight',
    ],
    propsData: {
        rows: 6,
        columns: 7,
        holeRadius: 20,
        boardPadding: 10,
        pieceGap: 10,
        hoverHeight: 10,
    },
    data: function() {
        return {
            hoverColumn: null,
            pieceColumns: Array(this.columns).fill(null).map(() => []),
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
        attemptMove: function(column) {
            this.pieceColumns[column].push(true)
            if (this.pieceColumns[column].length == this.rows)
                this.hoverColumn = null
        },
    },
})
