document.addEventListener("DOMContentLoaded", () => {
    // Check if Chess is loaded
    if (typeof Chess === 'undefined') {
        console.error("Chess library not loaded! Check your internet or HTML script tag.");
        return;
    }

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

    function handleClick(squareName) {
        const piece = game.get(squareName);

        // Agar white turn hai aur apna piece select kiya
        if (piece && piece.color === "w") {
            selectedSquare = squareName;
            renderBoard();
            return;
        }

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
                renderBoard();
            }
        }
    }

    function aiMove() {
        const moves = game.moves();
        if (moves.length === 0) return;
        const randomMove = moves[Math.floor(Math.random() * moves.length)];
        game.move(randomMove);
        renderBoard();
    }

    renderBoard();
});
