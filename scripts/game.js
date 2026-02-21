document.addEventListener("DOMContentLoaded", () => {
    let game = new Chess();
    const boardElement = document.getElementById("chessBoard");
    let selectedSquare = null;

    // Unicode map for pieces
    const pieceMap = {
        'p': '♟', 'r': '♜', 'n': '♞', 'b': '♝', 'q': '♛', 'k': '♚',
        'P': '♟', 'R': '♜', 'N': '♞', 'B': '♝', 'Q': '♛', 'K': '♚'
    };

    function renderBoard(lastMove = null) {
        if (!boardElement) return;
        boardElement.innerHTML = "";
        const board = game.board();

        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const square = document.createElement("div");
                const squareName = String.fromCharCode(97 + c) + (8 - r);
                square.className = `square ${(r + c) % 2 === 0 ? "white-square" : "black-square"}`;
                
                const piece = board[r][c];
                if (piece) {
                    const icon = pieceMap[piece.color === 'w' ? piece.type.toUpperCase() : piece.type.toLowerCase()];
                    square.textContent = icon;
                    square.classList.add(piece.color === 'w' ? "white-piece" : "black-piece");
                }

                if (selectedSquare === squareName) square.classList.add("selected");
                if (lastMove && (lastMove.from === squareName || lastMove.to === squareName)) {
                    square.classList.add("last-move");
                }

                square.onclick = () => handleClick(squareName);
                boardElement.appendChild(square);
            }
        }
        checkGameOver();
    }

    function handleClick(squareName) {
        const piece = game.get(squareName);

        // Selection logic
        if (piece && piece.color === game.turn()) {
            selectedSquare = squareName;
            renderBoard();
            return;
        }

        // Move logic
        if (selectedSquare) {
            const move = game.move({
                from: selectedSquare,
                to: squareName,
                promotion: 'q'
            });

            if (move) {
                selectedSquare = null;
                renderBoard(move);
                if (!game.game_over()) {
                    setTimeout(makeAiMove, 600);
                }
            } else {
                selectedSquare = null;
                renderBoard();
            }
        }
    }

    function makeAiMove() {
        const moves = game.moves();
        if (moves.length === 0) return;
        const randomMove = moves[Math.floor(Math.random() * moves.length)];
        const move = game.move(randomMove);
        renderBoard(move);
    }

    function checkGameOver() {
        if (game.game_over()) {
            let message = "Game Over!";
            if (game.in_checkmate()) message = `Checkmate! ${game.turn() === 'w' ? 'Black' : 'White'} Wins!`;
            else if (game.in_draw()) message = "It's a Draw!";

            const overlay = document.createElement("div");
            overlay.className = "game-over-overlay";
            overlay.innerHTML = `
                <div class="winner-card">
                    <h2>${message}</h2>
                    <button onclick="location.reload()" class="control-btn" style="margin-top:20px; background:#22c55e; color:white;">Play Again</button>
                </div>`;
            document.body.appendChild(overlay);
        }
    }

    // Reset and Start functionality
    const resetFunc = () => {
        game = new Chess();
        selectedSquare = null;
        renderBoard();
    };

    document.getElementById("resetBtn").addEventListener("click", resetFunc);
    document.getElementById("startBtn").addEventListener("click", resetFunc);

    // Initial Start
    renderBoard();
});
