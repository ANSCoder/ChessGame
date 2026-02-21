document.addEventListener("DOMContentLoaded", () => {

    const game = new Chess();
    const boardElement = document.getElementById("chessBoard");

    let selectedSquare = null;
    let level = "easy";

    const pieceMap = {
        p:'♟', r:'♜', n:'♞', b:'♝', q:'♛', k:'♚',
        P:'♙', R:'♖', N:'♘', B:'♗', Q:'♕', K:'♔'
    };

    const pieceValue = {
        p: 1,
        n: 3,
        b: 3,
        r: 5,
        q: 9,
        k: 100
    };

    /* ==============================
       RENDER BOARD
    ============================== */

    function renderBoard() {

        boardElement.innerHTML = "";
        const board = game.board();

        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {

                const square = document.createElement("div");
                square.className = "square " + ((r+c)%2===0 ? "white-square" : "black-square");

                const piece = board[r][c];

                if (piece) {
                    const key = piece.color === "w"
                        ? piece.type.toUpperCase()
                        : piece.type;

                    square.textContent = pieceMap[key];
                }

                const squareName = String.fromCharCode(97+c) + (8-r);

                if (selectedSquare === squareName) {
                    square.classList.add("selected");
                }

                if (game.in_check() && piece && piece.type === "k" && piece.color === game.turn()) {
                    square.classList.add("check");
                }

                square.addEventListener("click", () => handleClick(squareName));

                boardElement.appendChild(square);
            }
        }
    }

    /* ==============================
       HANDLE PLAYER CLICK
    ============================== */

    function handleClick(square) {

        if (game.turn() !== "w") return;

        if (selectedSquare) {

            const move = game.move({
                from: selectedSquare,
                to: square,
                promotion: "q"
            });

            selectedSquare = null;

            if (move) {
                renderBoard();

                if (game.in_checkmate()) {
                    alert("Checkmate! You win!");
                    return;
                }

                if (!game.game_over()) {
                    setTimeout(aiMove, 400);
                }

            } else {
                renderBoard();
            }

            return;
        }

        const piece = game.get(square);

        if (piece && piece.color === "w") {
            selectedSquare = square;
            renderBoard();
        }
    }

    /* ==============================
       SIMPLE AI LOGIC
    ============================== */

    function aiMove() {

        const moves = game.moves({ verbose: true });
        if (!moves.length) return;

        let move;

        if (level === "easy") {
            move = moves[Math.floor(Math.random() * moves.length)];
        }

        if (level === "medium") {
            move = getBestCapture(moves) || randomMove(moves);
        }

        if (level === "hard") {
            move = minimaxRoot(2, true);
        }

        game.move(move);
        renderBoard();

        if (game.in_checkmate()) {
            alert("Checkmate! AI wins!");
        }
    }

    function randomMove(moves) {
        return moves[Math.floor(Math.random() * moves.length)];
    }

    function getBestCapture(moves) {
        let bestMove = null;
        let maxValue = 0;

        moves.forEach(move => {
            if (move.captured) {
                const value = pieceValue[move.captured];
                if (value > maxValue) {
                    maxValue = value;
                    bestMove = move;
                }
            }
        });

        return bestMove;
    }

    /* ==============================
       MINIMAX (Hard Level)
    ============================== */

    function minimaxRoot(depth, isMaximizing) {

        const moves = game.moves({ verbose: true });
        let bestMove = null;
        let bestValue = -Infinity;

        moves.forEach(move => {
            game.move(move);
            const value = minimax(depth - 1, -Infinity, Infinity, false);
            game.undo();

            if (value > bestValue) {
                bestValue = value;
                bestMove = move;
            }
        });

        return bestMove || randomMove(moves);
    }

    function minimax(depth, alpha, beta, isMaximizing) {

        if (depth === 0) {
            return evaluateBoard();
        }

        const moves = game.moves({ verbose: true });

        if (isMaximizing) {
            let maxEval = -Infinity;

            for (let move of moves) {
                game.move(move);
                const evalScore = minimax(depth - 1, alpha, beta, false);
                game.undo();
                maxEval = Math.max(maxEval, evalScore);
                alpha = Math.max(alpha, evalScore);
                if (beta <= alpha) break;
            }

            return maxEval;
        } else {
            let minEval = Infinity;

            for (let move of moves) {
                game.move(move);
                const evalScore = minimax(depth - 1, alpha, beta, true);
                game.undo();
                minEval = Math.min(minEval, evalScore);
                beta = Math.min(beta, evalScore);
                if (beta <= alpha) break;
            }

            return minEval;
        }
    }

    function evaluateBoard() {
        const board = game.board();
        let total = 0;

        board.forEach(row => {
            row.forEach(piece => {
                if (piece) {
                    const value = pieceValue[piece.type];
                    total += piece.color === "w" ? value : -value;
                }
            });
        });

        return total;
    }

    /* ==============================
       BUTTON CONTROLS
    ============================== */

    document.getElementById("startBtn").onclick = () => {
        game.reset();
        renderBoard();
    };

    document.getElementById("resetBtn").onclick = () => {
        game.reset();
        renderBoard();
    };

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
            level = btn.dataset.level;
        });
    });

    renderBoard();
});
