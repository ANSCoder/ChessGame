class Board {
    constructor() {
        this.squares = this.initializeBoard();
    }

    initializeBoard() {
        return [
            ['r','n','b','q','k','b','n','r'],
            ['p','p','p','p','p','p','p','p'],
            [null,null,null,null,null,null,null,null],
            [null,null,null,null,null,null,null,null],
            [null,null,null,null,null,null,null,null],
            [null,null,null,null,null,null,null,null],
            ['P','P','P','P','P','P','P','P'],
            ['R','N','B','Q','K','B','N','R']
        ];
    }

    movePiece(fromRow, fromCol, toRow, toCol) {
        this.squares[toRow][toCol] = this.squares[fromRow][fromCol];
        this.squares[fromRow][fromCol] = null;
    }
}

class MoveValidator {
    validateMove(board, fromRow, fromCol, toRow, toCol) {
        if (toRow < 0 || toRow > 7 || toCol < 0 || toCol > 7) return false;
        if (fromRow === toRow && fromCol === toCol) return false;

        const piece = board[fromRow][fromCol];
        if (!piece) return false;

        return true; // simple free movement (basic version)
    }
}

class ChessAI {
    calculateBestMove(board) {
        const moves = [];

        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                if (board[r][c] && board[r][c] === board[r][c].toLowerCase()) {
                    for (let tr = 0; tr < 8; tr++) {
                        for (let tc = 0; tc < 8; tc++) {
                            moves.push({ fromRow: r, fromCol: c, toRow: tr, toCol: tc });
                        }
                    }
                }
            }
        }

        if (moves.length === 0) return null;
        return moves[Math.floor(Math.random() * moves.length)];
    }
}

class ChessGame {
    constructor() {
        this.board = new Board();
        this.moveValidator = new MoveValidator();
        this.chessAI = new ChessAI();
        this.currentTurn = "white";
        this.selected = null;
    }

    startGame() {
        this.board = new Board();
        this.currentTurn = "white";
        this.selected = null;
        this.ui.renderBoard();
    }

    makeMove(fromRow, fromCol, toRow, toCol) {
        if (!this.moveValidator.validateMove(this.board.squares, fromRow, fromCol, toRow, toCol))
            return;

        this.board.movePiece(fromRow, fromCol, toRow, toCol);
        this.currentTurn = this.currentTurn === "white" ? "black" : "white";
        this.ui.renderBoard();

        if (this.currentTurn === "black") {
            setTimeout(() => this.aiMove(), 300);
        }
    }

    aiMove() {
        const move = this.chessAI.calculateBestMove(this.board.squares);
        if (!move) return;

        this.board.movePiece(move.fromRow, move.fromCol, move.toRow, move.toCol);
        this.currentTurn = "white";
        this.ui.renderBoard();
    }

    setUI(ui) {
        this.ui = ui;
    }
}

class ChessGameUI {
    constructor(game) {
        this.game = game;
        this.boardElement = document.getElementById("chessBoard");
        this.pieces = {
            r:'♜',n:'♞',b:'♝',q:'♛',k:'♚',p:'♟',
            R:'♖',N:'♘',B:'♗',Q:'♕',K:'♔',P:'♙'
        };
    }

    renderBoard() {
        this.boardElement.innerHTML = "";

        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const square = document.createElement("div");
                square.className = "square " + ((r + c) % 2 === 0 ? "white-square" : "black-square");

                const piece = this.game.board.squares[r][c];
                if (piece) square.textContent = this.pieces[piece];

                square.addEventListener("click", () => {
                    if (this.game.selected) {
                        this.game.makeMove(this.game.selected.row, this.game.selected.col, r, c);
                        this.game.selected = null;
                    } else {
                        this.game.selected = { row: r, col: c };
                    }
                });

                this.boardElement.appendChild(square);
            }
        }
    }
}

/* ===== INITIALIZATION ===== */

document.addEventListener("DOMContentLoaded", () => {
    const game = new ChessGame();
    const ui = new ChessGameUI(game);
    game.setUI(ui);

    document.getElementById("startBtn").onclick = () => game.startGame();
    document.getElementById("resetBtn").onclick = () => game.startGame();

    game.startGame();
});
