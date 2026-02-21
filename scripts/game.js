document.addEventListener("DOMContentLoaded", () => {
    // 1. Library Loading Logic
    const startChessGame = () => {
        if (typeof Chess === 'undefined') {
            setTimeout(startChessGame, 500);
            return;
        }

        const game = new Chess();
        const boardElement = document.getElementById("chessBoard");
        let selectedSquare = null;
        let level = "easy"; // Default level

        const pieceMap = {
            p:'♟', r:'♜', n:'♞', b:'♝', q:'♛', k:'♚',
            P:'♙', R:'♖', N:'♘', B:'♗', Q:'♕', K:'♔'
        };

        // 2. Render Board Function
        function renderBoard() {
            if (!boardElement) return;
            boardElement.innerHTML = "";
            const board = game.board();

            for (let r = 0; r < 8; r++) {
                for (let c = 0; c < 8; c++) {
                    const square = document.createElement("div");
                    square.className = "square " + ((r + c) % 2 === 0 ? "white-square" : "black-square");
                    const squareName = String.fromCharCode(97 + c) + (8 - r);
                    const piece = board[r][c];
                    
                    if (piece) {
                        const key = piece.color === "w" ? piece.type.toUpperCase() : piece.type.toLowerCase();
                        square.textContent = pieceMap[key];
                    }
                    if (selectedSquare === squareName) square.classList.add("selected");
                    square.onclick = () => handleClick(squareName);
                    boardElement.appendChild(square);
                }
            }
        }

        // 3. Handle Clicks & Moves
        function handleClick(squareName) {
            const piece = game.get(squareName);
            if (piece && piece.color === "w") {
                selectedSquare = squareName;
                renderBoard();
                return;
            }
            if (selectedSquare) {
                const move = game.move({ from: selectedSquare, to: squareName, promotion: "q" });
                selectedSquare = null;
                renderBoard();
                if (move && !game.game_over()) setTimeout(aiMove, 300);
            }
        }

        // 4. AI Logic
        function aiMove() {
            const moves = game.moves();
            if (moves.length > 0) {
                game.move(moves[Math.floor(Math.random() * moves.length)]);
                renderBoard();
            }
        }

        /* ===============================
           BUTTONS LOGIC (THE MISSING PART)
        =============================== */

        // Start & Reset Buttons
        const resetGame = () => {
            game.reset();
            selectedSquare = null;
            renderBoard();
            console.log("Game Reset");
        };
        document.getElementById("startBtn").onclick = resetGame;
        document.getElementById("resetBtn").onclick = resetGame;

        // Theme Toggle
        document.getElementById("themeBtn").onclick = () => {
            document.body.classList.toggle("light-mode");
        };

        // 2D / 3D Mode Toggle
        document.getElementById("modeBtn").onclick = () => {
            document.body.classList.toggle("mode-3d");
        };

        // Difficulty Levels
        document.querySelectorAll(".level-btn").forEach(btn => {
            btn.onclick = () => {
                document.querySelectorAll(".level-btn").forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                level = btn.getAttribute("data-level");
            };
        });

        renderBoard(); // Initial render
    };

    // Library Injection
    const script = document.createElement('script');
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/chess.js/0.10.3/chess.min.js";
    script.onload = startChessGame;
    document.head.appendChild(script);
});
