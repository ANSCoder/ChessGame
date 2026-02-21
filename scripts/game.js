document.addEventListener("DOMContentLoaded", () => {
    // FIX: Access the Chess constructor correctly from the window object
    const game = new Chess.Chess(); 
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
                square.className = "square " + ((r + c) % 2 === 0 ? "white-square" : "black-square");

                const squareName = String.fromCharCode(97 + c) + (8 - r);
                const piece = board[r][c];

                if (piece) {
                    // Correctly mapping piece types to Unicode
                    const key = piece.color === "w" ? piece.type.toUpperCase() : piece.type.toLowerCase();
                    square.textContent = pieceMap[key];
                }

                if (selectedSquare === squareName) {
                    square.classList.add("selected");
                }

                square.onclick = () => handleClick(squareName);
                boardElement.appendChild(square);
            }
        }
    }

    function handleClick(squareName) {
        if (game.turn() !== "w") return;

        const piece = game.get(squareName);

        // If clicking a new white piece, just change selection
        if (piece && piece.color === "w") {
            selectedSquare = squareName;
            renderBoard();
            return;
        }

        // If a piece was selected and we click a target square
        if (selectedSquare) {
            const move = game.move({
                from: selectedSquare,
                to: squareName,
                promotion: "q"
            });

            selectedSquare = null;

            if (move) {
                renderBoard();
                if (!game.game_over()) {
                    setTimeout(aiMove, 300);
                } else {
                    alert("Game Over!");
                }
            } else {
                // Invalid move
                renderBoard();
            }
        }
    }

    function aiMove() {
        const moves = game.moves({ verbose: true });
        if (moves.length === 0) return;

        let move;
        if (level === "easy") {
            move = moves[Math.floor(Math.random() * moves.length)];
        } else if (level === "medium") {
            const captures = moves.filter(m => m.captured);
            move = captures.length ? captures[Math.floor(Math.random() * captures.length)] : moves[Math.floor(Math.random() * moves.length)];
        } else {
            // Hard: Simple piece value capture
            const captures = moves.filter(m => m.captured).sort((a, b) => pieceValue(b.captured) - pieceValue(a.captured));
            move = captures.length ? captures[0] : moves[Math.floor(Math.random() * moves.length)];
        }

        game.move(move);
        renderBoard();
        if (game.game_over()) alert("Game Over!");
    }

    function pieceValue(p) {
        const values = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 100 };
        return values[p] || 0;
    }

    // Controls
    document.getElementById("startBtn").onclick = () => { game.reset(); selectedSquare = null; renderBoard(); };
    document.getElementById("resetBtn").onclick = () => { game.reset(); selectedSquare = null; renderBoard(); };
    document.getElementById("themeBtn").onclick = () => document.body.classList.toggle("light-mode");
    document.getElementById("modeBtn").onclick = () => document.body.classList.toggle("mode-3d");

    document.querySelectorAll(".level-btn").forEach(btn => {
        btn.onclick = () => {
            document.querySelectorAll(".level-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            level = btn.dataset.level;
        };
    });

    renderBoard();
});
