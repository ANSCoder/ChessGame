document.addEventListener("DOMContentLoaded", () => {

    const game = new Chess();
    const boardElement = document.getElementById("chessBoard");

    let selectedSquare = null;
    let level = "easy";

    const pieceMap = {
        p:'♟', r:'♜', n:'♞', b:'♝', q:'♛', k:'♚',
        P:'♙', R:'♖', N:'♘', B:'♗', Q:'♕', K:'♔'
    };

    /* ===============================
       RENDER BOARD
    =============================== */

    function renderBoard() {

        boardElement.innerHTML = "";
        const board = game.board();

        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {

                const square = document.createElement("div");
                square.className = "square " + ((r+c)%2===0 ? "white-square" : "black-square");

                const squareName = String.fromCharCode(97+c) + (8-r);
                const piece = board[r][c];

                if (piece) {
                    const key = piece.color === "w"
                        ? piece.type.toUpperCase()
                        : piece.type;
                    square.textContent = pieceMap[key];
                }

                if (selectedSquare === squareName) {
                    square.classList.add("selected");
                }

                square.addEventListener("click", () => handleClick(squareName));

                boardElement.appendChild(square);
            }
        }
    }

    /* ===============================
       HANDLE PLAYER MOVE
    =============================== */

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
                if (!game.game_over()) {
                    setTimeout(aiMove, 300);
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

    /* ===============================
       AI MOVE
    =============================== */

    function aiMove() {

        const moves = game.moves({ verbose: true });
        if (!moves.length) return;

        let move;

        if (level === "easy") {
            move = randomMove(moves);
        }

        if (level === "medium") {
            const captureMoves = moves.filter(m => m.captured);
            move = captureMoves.length
                ? randomMove(captureMoves)
                : randomMove(moves);
        }

        if (level === "hard") {
            move = bestCaptureMove(moves) || randomMove(moves);
        }

        game.move(move);
        renderBoard();
    }

    function randomMove(moves) {
        return moves[Math.floor(Math.random() * moves.length)];
    }

    function bestCaptureMove(moves) {
        const captureMoves = moves.filter(m => m.captured);
        if (!captureMoves.length) return null;

        captureMoves.sort((a,b) => pieceValue(b.captured) - pieceValue(a.captured));
        return captureMoves[0];
    }

    function pieceValue(piece) {
        const values = { p:1, n:3, b:3, r:5, q:9, k:100 };
        return values[piece] || 0;
    }

    /* ===============================
       BUTTON CONTROLS
    =============================== */

    document.getElementById("startBtn").onclick = () => {
        game.reset();
        selectedSquare = null;
        renderBoard();
    };

    document.getElementById("resetBtn").onclick = () => {
        game.reset();
        selectedSquare = null;
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

    /* ===============================
       INIT
    =============================== */

    renderBoard();

});
