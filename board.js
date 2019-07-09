export default class Board {
    constructor(rows, cols) {
        this._rows = rows
        this._cols = cols
        this._columns = Array(cols).fill(null).map(() => [])
    }

    get rows() {
        return this._rows
    }

    get cols() {
        return this._cols
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

        /* Check column victory */
        if (
            this.colHeight(col) >= 4 
            && this._columns[col].slice(-4).every(piece => piece == isHuman)
        )
            return true

        /* Check row victory */
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
                return true
        }

        /* Check diagonal victory */
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
                return true
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
                return true
        }

        return false
    }

    minimax(move, depth, minimizing) {
        let gameOver = this.makeMove(move, minimizing), evaluation

        if (gameOver)
            evaluation = minimizing ? Infinity : -Infinity
        else if (depth == 0)
            evaluation = this.score()
        else {
            if (minimizing) {
                evaluation = Math.min(
                    ...this.availableMoves()
                        .map(availableMove => 
                            minimax(availableMove, depth - 1, false)
                        )
                )
            }
            else {
                evaluation = Math.max(
                    ...this.availableMoves()
                        .map(availableMove =>
                            minimax(availableMove, depth - 1, true)
                        )
                )
            }
        }

        this._columns[move].pop()
        return evaluation
    }

    score() {
        let score = 0, directR, directC, cond

        /* Score rows */
        directR = 0
        directC = 1
        cond = (row, col) => col < this._cols
        for (let row = 0, col = 0; row < this._rows; ++row)
            score += this._scoreLine(row, col, directR, directC, cond)

        /* Score columns */
        directR = 1
        directC = 0
        cond = (row, col) => row < this._rows
        for (let row = 0, col = 0; col < this._cols; ++col)
            score += this._scoreLine(row, col, directR, directC, cond)

        /* Score forward diagonals */
        directR = 1
        directC = 1
        cond = (row, col) => row < this._rows && col < this._cols
        for (let row = 0, col = 0; col < this._cols; ++col)
            score += this._scoreLine(row, col, directR, directC, cond)
        for (let row = 1, col = 0; row < this._rows; ++row)
            score += this._scoreLine(row, col, directR, directC, cond)

        /* Score backward diagonals */
        directR = 1
        directC = -1
        cond = (row, col) => row < this._rows && col > 0
        for (let row = 0, col = 0; col < this._cols; ++col) 
            score += this._scoreLine(row, col, directR, directC, cond)
        for (let row = 1, col = this._cols - 1; row < this._rows; ++row)
            score += this._scoreLine(row, col, directR, directC, cond)

        return score
    }

    _scoreLine(startR, startC, directR, directC, cond) {
        let score = 0, row = startR, col = startC, isHuman, length = 0

        for (
            let square;
            isHuman == undefined && cond(row, col);
            row += directR, col += directC, ++length
        ) {
            square = this.get(row, col)
            if (square != undefined)
                isHuman = square
        }

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

    _value(pieces) {
        if (pieces == 3)
            return 2
        else if (pieces == 2)
            return 1
        else
            return 0
    }
}
