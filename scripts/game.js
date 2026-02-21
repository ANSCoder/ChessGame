document.addEventListener("DOMContentLoaded", () => {
    // FIX: Chess.js v0.13.4 ke liye constructor aise call hota hai
    const game = new Chess.Chess(); 
    const boardElement = document.getElementById("chessBoard");

    let selectedSquare = null;
    let level = "easy";

    // Unicode pieces for rendering
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
                    // Piece logic: White is UpperCase, Black is LowerCase
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

        // Agar white piece par click kiya toh select karo
        if (piece && piece.color === "w") {
            selectedSquare = squareName;
            renderBoard();
            return;
        }

        // Agar pehle se selected hai aur move kar rahe ho
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
                    checkGameOver();
                }
            } else {
                renderBoard(); // Invalid move par reset selection
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
            const captures = moves.filter(m => m.captured).sort((a, b) => pieceValue(b.captured) - pieceValue(a.captured));
            move = captures.length ? captures[0] : moves[Math.floor(Math.random() * moves.length)];
        }

        game.move(move);
        renderBoard();
        if (game.game_over()) checkGameOver();
    }

    function pieceValue(p) {
        const values = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 100 };
        return values[p] || 0;
    }

    function checkGameOver() {
        if (game.in_checkmate()) alert("Checkmate! Game Over.");
        else if (game.in_draw()) alert("Draw! Game Over.");
        else alert("Game Over!");
    }

    // Button Controls
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
