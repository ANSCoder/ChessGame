document.addEventListener("DOMContentLoaded", () => {
    const startChessGame = () => {
        if (typeof Chess === 'undefined') {
            setTimeout(startChessGame, 500);
            return;
        }

        const game = new Chess();
        const boardElement = document.getElementById("chessBoard");
        let selectedSquare = null;

        const pieceMap = {
            p:'♟', r:'♜', n:'♞', b:'♝', q:'♛', k:'♚',
            P:'♙', R:'♖', N:'♘', B:'♗', Q:'♕', K:'♔'
        };

        function renderBoard(lastMove = null) {
            if (!boardElement) return;
            boardElement.innerHTML = "";
            const board = game.board();

            for (let r = 0; r < 8; r++) {
                for (let c = 0; c < 8; c++) {
                    const square = document.createElement("div");
                    const squareName = String.fromCharCode(97 + c) + (8 - r);
                    square.className = "square " + ((r + c) % 2 === 0 ? "white-square" : "black-square");
                    square.setAttribute("data-square", squareName);
                    
                    const piece = board[r][c];
                    if (piece) {
                        const key = piece.color === "w" ? piece.type.toUpperCase() : piece.type.toLowerCase();
                        const icon = pieceMap[key];
                        
                        square.textContent = icon;
                        
                        // 3D FIX: Attribute aur Color class
                        square.setAttribute("data-piece", icon);
                        if(piece.color === 'w') square.classList.add("white-piece");
                    }

                    if (selectedSquare === squareName) square.classList.add("selected");
                    if (lastMove && (lastMove.from === squareName || lastMove.to === squareName)) {
                        square.classList.add("last-move");
                    }

                    square.onclick = () => handleClick(squareName);
                    boardElement.appendChild(square);
                }
            }
            updateStatus();
            checkGameOver();
        }

        function handleClick(squareName) {
            const piece = game.get(squareName);

            if (piece && piece.color === "w") {
                selectedSquare = squareName;
                renderBoard();
                return;
            }

            if (selectedSquare) {
                const move = game.move({ from: selectedSquare, to: squareName, promotion: "q" });
                if (move) {
                    selectedSquare = null;
                    renderBoard(move);
                    setTimeout(aiMove, 500);
                } else {
                    selectedSquare = null;
                    renderBoard();
                }
            }
        }

        function aiMove() {
            const moves = game.moves();
            if (moves.length > 0) {
                const move = game.move(moves[Math.floor(Math.random() * moves.length)]);
                renderBoard(move);
            }
        }

        function updateStatus() {
            document.getElementById("player-w")?.classList.toggle("active", game.turn() === 'w');
            document.getElementById("player-b")?.classList.toggle("active", game.turn() === 'b');
        }

        function checkGameOver() {
            if (game.game_over()) {
                const overlay = document.createElement("div");
                overlay.className = "game-over-overlay";
                overlay.innerHTML = `<div class="winner-card">
                    <h2>GAME OVER</h2>
                    <button onclick="location.reload()" class="control-btn" style="margin-top:20px">PLAY AGAIN</button>
                </div>`;
                document.body.appendChild(overlay);
            }
        }

        document.getElementById("modeBtn").onclick = () => {
            document.body.classList.toggle("mode-3d");
            renderBoard();
        };

        document.getElementById("themeBtn").onclick = () => document.body.classList.toggle("light-mode");

        renderBoard();
    };

    const script = document.createElement('script');
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/chess.js/0.10.3/chess.min.js";
    script.onload = startChessGame;
    document.head.appendChild(script);
});
