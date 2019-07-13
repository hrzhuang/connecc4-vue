export default class Board {
    constructor(rows, cols) {
        this._rows = rows
        this._cols = cols
        this._columns = Array(cols).fill(null).map(() => [])
    }

    /* Used to create board object from object passed to worker through message
     */
    static from(board) {
        let newBoard = new Board(board._rows, board._cols)
        newBoard._columns = board._columns
        return newBoard
    }

    get(row, col) {
        return this._columns[col][row]
    }

    colHeight(col) {
        return this._columns[col].length
    }

    isAvailableMove(col) {
        return this.colHeight(col) < this._rows
    }

    availableMoves() {
        let moves = []
        for (let col = 0; col < this._cols; ++col) {
            if (this.isAvailableMove(col))
                moves.push(col)
        }
        return moves
    }

    makeMove(col, isHuman) {
        this._columns[col].push(isHuman)

        // Check column victory
        if (
            this.colHeight(col) >= 4 
            && this._columns[col].slice(-4).every(piece => piece == isHuman)
        )
            return { gameOver: true, draw: false }

        // Check row victory
        let row = this.colHeight(col) - 1
        for (
            let c = Math.max(col - 3, 0), 
            bound = Math.min(col + 4, this._cols),
            length = 0;
            c < bound;
            ++c
        ) {
            if (this.get(row, c) == isHuman)
                ++length
            else
                length = 0

            if (length == 4)
                return { gameOver: true, draw: false }
        }

        // Check diagonal victory
        for (
            let lBound = Math.min(row, col, 3),
            uBound = Math.min(this._rows - row - 1, this._cols - col - 1, 3),
            r = row - lBound,
            c = col - lBound,
            i = 0,
            bound = lBound + 1 + uBound,
            length = 0;
            i < bound;
            ++i, ++r, ++c
        ) {
            if (this.get(r, c) == isHuman)
                ++length
            else
                length = 0

            if (length == 4)
                return { gameOver: true, draw: false }
        }
        
        for (
            let lBound = Math.min(row, this._cols - col - 1, 3),
            uBound = Math.min(this._rows - row - 1, col, 3),
            r = row - lBound,
            c = col + lBound,
            i = 0,
            bound = lBound + 1 + uBound,
            length = 0;
            i < bound;
            ++i, ++r, --c
        ) {
            if (this.get(r, c) == isHuman)
                ++length
            else
                length = 0

            if (length == 4)
                return { gameOver: true, draw: false }
        }

        // Check draw
        if (this._columns.every(column => column.length == this._rows))
            return { gameOver: true, draw: true }

        return { gameOver: false }
    }

    /* move: the move being evaluated
     * depth: maximum depth of the search
     * minimizing: whether or not the player making the move is trying to
     * minimize score (the human player)
     */
    minimax(move, depth, minimizing) {
        // Make the move
        let { gameOver, draw } = this.makeMove(move, minimizing), evaluation

        if (gameOver) {
            if (draw)
                evaluation = 0
            else
                evaluation = minimizing ? -Infinity : Infinity
        }
        else if (depth == 0)
            evaluation = this.score()
        else {
            if (minimizing) {
                // The score of this move is the maximum of the scores of the
                // possible next moves, since the next player is maximizing
                evaluation = Math.max(
                    ...this.availableMoves()
                        .map(availableMove => 
                            this.minimax(availableMove, depth - 1, false)
                        )
                )
            }
            else {
                // Same idea as before
                evaluation = Math.min(
                    ...this.availableMoves()
                        .map(availableMove =>
                            this.minimax(availableMove, depth - 1, true)
                        )
                )
            }
        }

        // Undo the move made earlier since we are not committing it yet
        this._columns[move].pop()
        return evaluation
    }

    /* Scores the current position of the board */
    score() {
        let score = 0, directR, directC, cond

        // Score rows 
        directR = 0
        directC = 1
        cond = (row, col) => col < this._cols
        for (let row = 0, col = 0; row < this._rows; ++row)
            score += this._scoreLine(row, col, directR, directC, cond)

        // Score columns 
        directR = 1
        directC = 0
        cond = row => row < this._rows
        for (let row = 0, col = 0; col < this._cols; ++col)
            score += this._scoreLine(row, col, directR, directC, cond)

        // Score columns 
        directR = 1
        directC = 1
        cond = (row, col) => row < this._rows && col < this._cols
        for (let row = 0, col = 0; col < this._cols; ++col)
            score += this._scoreLine(row, col, directR, directC, cond)
        for (let row = 1, col = 0; row < this._rows; ++row)
            score += this._scoreLine(row, col, directR, directC, cond)

        // Score columns 
        directR = 1
        directC = -1
        cond = (row, col) => row < this._rows && col > 0
        for (let row = 0, col = 0; col < this._cols; ++col) 
            score += this._scoreLine(row, col, directR, directC, cond)
        for (let row = 1, col = this._cols - 1; row < this._rows; ++row)
            score += this._scoreLine(row, col, directR, directC, cond)

        return score
    }

    /* Scores a line (vertical, horizontal, or diagonal) on the board */
    _scoreLine(startR, startC, directR, directC, cond) {
        let score = 0, row = startR, col = startC, isHuman, length = 0

        // Count empty squares until first non-empty square
        for (
            let square;
            isHuman == undefined && cond(row, col);
            row += directR, col += directC, ++length
        ) {
            square = this.get(row, col)
            if (square != undefined)
                isHuman = square
        }

        // This requires more explanation than a single comment, perhaps I will
        // document this elsewhere
        if (isHuman != undefined) {
            for (
                let square, pieces = 1;
                cond(row, col);
                row += directR, col += directC
            ) {
                square = this.get(row, col)

                if (square == isHuman) {
                    ++length
                    ++pieces
                } else if (square == !isHuman) {
                    isHuman = !isHuman
                    length = 1
                    pieces = 1
                } else
                    ++length

                if (length >= 4) {
                    if (isHuman)
                        score -= this._value(pieces)
                    else
                        score += this._value(pieces)

                    if (
                        this.get(row - directR*3, col - directC*3)
                        != undefined
                    )
                        --pieces
                }
            }
        }

        return score
    }

    /* Returns a value given the number of pieces in a 4-piece segment with only
     * pieces of the same color
     */
    _value(pieces) {
        if (pieces == 3)
            return 2
        else if (pieces == 2)
            return 1
        else
            return 0
    }
}
