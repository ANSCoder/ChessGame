console.log("Chess Game script initialized!");

document.addEventListener("DOMContentLoaded", () => {
    
    // Agar ye alert nahi aata, toh aapka 'src' path galat hai
    console.log("DOM is ready!");

    if (typeof Chess === 'undefined') {
        alert("Chess library load nahi hui! HTML check karein.");
        return;
    }

    const game = new Chess(); 
    const boardElement = document.getElementById("chessBoard");
    let selectedSquare = null;

    const pieceMap = {
        p:'♟', r:'♜', n:'♞', b:'♝', q:'♛', k:'♚',
        P:'♙', R:'♖', N:'♘', B:'♗', Q:'♕', K:'♔'
    };

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

    function aiMove() {
        const moves = game.moves();
        if (moves.length > 0) {
            game.move(moves[Math.floor(Math.random() * moves.length)]);
            renderBoard();
        }
    }

    renderBoard();
});
