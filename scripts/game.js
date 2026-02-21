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

    movePiece(fr, fc, tr, tc) {
        this.squares[tr][tc] = this.squares[fr][fc];
        this.squares[fr][fc] = null;
    }
}

class MoveValidator {
    validateMove(board, fr, fc, tr, tc) {
        if (tr < 0 || tr > 7 || tc < 0 || tc > 7) return false;
        if (fr === tr && fc === tc) return false;
        if (!board[fr][fc]) return false;
        return true;
    }
}

class ChessAI {
    calculateBestMove(board, level = "easy") {

        const moves = [];

        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {

                if (board[r][c] && board[r][c] === board[r][c].toLowerCase()) {

                    for (let tr = 0; tr < 8; tr++) {
                        for (let tc = 0; tc < 8; tc++) {

                            if (!(r === tr && c === tc)) {
                                moves.push({ fr: r, fc: c, tr, tc });
                            }
                        }
                    }
                }
            }
        }

        if (!moves.length) return null;

        // For now difficulty behaves same (future: minimax)
        return moves[Math.floor(Math.random() * moves.length)];
    }
}

class ChessGame {
    constructor() {
        this.board = new Board();
        this.validator = new MoveValidator();
        this.ai = new ChessAI();
        this.currentTurn = "white";
        this.selected = null;
        this.level = "easy";
    }

    startGame() {
        this.board = new Board();
        this.currentTurn = "white";
        this.selected = null;
        this.ui.renderBoard();
    }

    makeMove(fr, fc, tr, tc) {

        const targetPiece = this.board.squares[tr][tc];

        if (!this.validator.validateMove(this.board.squares, fr, fc, tr, tc))
            return;

        this.board.movePiece(fr, fc, tr, tc);
        this.selected = null;

        this.ui.renderBoard();

        if (targetPiece) {
            this.ui.playCaptureEffect(tr, tc);
        }

        this.currentTurn = "black";

        setTimeout(() => this.aiMove(), 500);
    }

    aiMove() {

        const move = this.ai.calculateBestMove(this.board.squares, this.level);
        if (!move) return;

        const targetPiece = this.board.squares[move.tr][move.tc];

        this.board.movePiece(move.fr, move.fc, move.tr, move.tc);

        this.ui.renderBoard();

        if (targetPiece) {
            this.ui.playCaptureEffect(move.tr, move.tc);
        }

        this.currentTurn = "white";
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
                square.className = "square " + ((r+c)%2===0 ? "white-square" : "black-square");

                const piece = this.game.board.squares[r][c];
                if (piece) square.textContent = this.pieces[piece];

                // Highlight selected square
                if (this.game.selected &&
                    this.game.selected.r === r &&
                    this.game.selected.c === c) {
                    square.classList.add("selected");
                }

                square.addEventListener("click", () => {

                    if (this.game.currentTurn !== "white") return;

                    if (this.game.selected) {
                        this.game.makeMove(
                            this.game.selected.r,
                            this.game.selected.c,
                            r, c
                        );
                    } else {
                        this.game.selected = { r, c };
                        this.renderBoard();
                    }
                });

                this.boardElement.appendChild(square);
            }
        }
    }

    playCaptureEffect(row, col) {

        const index = row * 8 + col;
        const square = this.boardElement.children[index];
        if (!square) return;

        square.classList.add("capture-explode");
        document.body.classList.add("screen-shake");

        setTimeout(() => {
            square.classList.remove("capture-explode");
            document.body.classList.remove("screen-shake");
        }, 400);
    }
}

/* ===========================
   INITIALIZATION
=========================== */

document.addEventListener("DOMContentLoaded", () => {

    const game = new ChessGame();
    const ui = new ChessGameUI(game);
    game.setUI(ui);

    document.getElementById("startBtn").onclick = () => game.startGame();
    document.getElementById("resetBtn").onclick = () => game.startGame();

    document.getElementById("themeBtn").onclick = () => {
        document.body.classList.toggle("light-mode");
    };

    document.getElementById("modeBtn").onclick = () => {
        document.body.classList.toggle("mode-3d");
    };

    document.querySelectorAll(".level-btn").forEach(btn => {
        btn.addEventListener("click", () => {

            document.querySelectorAll(".level-btn")
                .forEach(b => b.classList.remove("active"));

            btn.classList.add("active");
            game.level = btn.dataset.level;
        });
    });

    game.startGame();
});
