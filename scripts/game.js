document.addEventListener("DOMContentLoaded", () => {

    const game = new Chess();
    const boardElement = document.getElementById("chessBoard");

    let selectedSquare = null;
    let level = "easy";

    const pieceMap = {
        p:'♟', r:'♜', n:'♞', b:'♝', q:'♛', k:'♚',
        P:'♙', R:'♖', N:'♘', B:'♗', Q:'♕', K:'♔'
    };

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

                square.addEventListener("click", () => handleClick(squareName));

                boardElement.appendChild(square);
            }
        }
    }

    function handleClick(square) {

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

    function aiMove() {

        const moves = game.moves({ verbose: true });
        if (!moves.length) return;

        let move;

        if (level === "easy") {
            move = moves[Math.floor(Math.random() * moves.length)];
        }

        if (level === "medium") {
            move = moves[Math.floor(Math.random() * moves.length)];
        }

        if (level === "hard") {
            move = moves[Math.floor(Math.random() * moves.length)];
        }

        game.move(move);
        renderBoard();
    }

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
