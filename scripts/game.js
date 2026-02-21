document.addEventListener("DOMContentLoaded", () => {
    let game = new Chess();
    const boardElement = document.getElementById("chessBoard");
    let selectedSquare = null;
    let difficulty = 'easy'; // Default difficulty

    const pieceMap = {
        'p':'♟','r':'♜','n':'♞','b':'♝','q':'♛','k':'♚',
        'P':'♟','R':'♜','N':'♞','B':'♝','Q':'♛','K':'♚'
    };

    function renderBoard() {
        if (!boardElement) return;
        boardElement.innerHTML = "";
        const board = game.board();

        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const square = document.createElement("div");
                const sqName = String.fromCharCode(97 + c) + (8 - r);
                square.className = `square ${(r + c) % 2 === 0 ? "white-square" : "black-square"}`;
                
                const piece = board[r][c];
                if (piece) {
                    square.textContent = pieceMap[piece.color === 'w' ? piece.type.toUpperCase() : piece.type.toLowerCase()];
                    // CSS classes: white-piece aur black-piece
                    square.classList.add(piece.color === 'w' ? "white-piece" : "black-piece");
                }

                if (selectedSquare === sqName) square.classList.add("selected");
                square.onclick = () => handleSquareClick(sqName);
                boardElement.appendChild(square);
            }
        }
        if (game.game_over()) showGameOver();
    }

    function handleSquareClick(sq) {
        const piece = game.get(sq);
        if (piece && piece.color === game.turn()) {
            selectedSquare = sq;
            renderBoard();
            return;
        }

        if (selectedSquare) {
            const move = game.move({ from: selectedSquare, to: sq, promotion: 'q' });
            if (move) {
                selectedSquare = null;
                renderBoard();
                if (!game.game_over()) setTimeout(aiMove, 600); // AI ko trigger karna
            } else {
                selectedSquare = null;
                renderBoard();
            }
        }
    }

    // --- AI LOGIC BASED ON LEVEL ---
    function aiMove() {
        const moves = game.moves();
        if (moves.length === 0) return;

        let chosenMove;
        if (difficulty === 'easy') {
            chosenMove = moves[Math.floor(Math.random() * moves.length)]; // Random move
        } else {
            // Medium/Hard: Priority to captures (goti kaatna)
            const captures = moves.filter(m => m.includes('x'));
            chosenMove = captures.length > 0 ? captures[0] : moves[Math.floor(Math.random() * moves.length)];
        }

        game.move(chosenMove);
        renderBoard();
    }

    function showGameOver() {
        const overlay = document.createElement("div");
        overlay.className = "game-over-overlay";
        overlay.innerHTML = `
            <div class="winner-card">
                <h2>Game Over!</h2>
                <button onclick="location.reload()" class="control-btn" style="background:#22c55e; margin-top:15px; color:white;">Play Again</button>
            </div>`;
        document.body.appendChild(overlay);
    }

    // --- LEVEL BUTTON LISTENERS ---
    const diffBtns = document.querySelectorAll(".diff-btn");
    diffBtns.forEach(btn => {
        btn.onclick = (e) => {
            diffBtns.forEach(b => b.classList.remove("active")); // Purana active hatana
            e.target.classList.add("active"); // Naya active lagana
            difficulty = e.target.innerText.toLowerCase(); // Level set karna
        };
    });

    // Theme & Reset Buttons
    document.getElementById("themeBtn").onclick = () => document.body.classList.toggle("light-mode");
    const reset = () => { game = new Chess(); selectedSquare = null; renderBoard(); };
    document.getElementById("startBtn").onclick = reset;
    document.getElementById("resetBtn").onclick = reset;

    renderBoard();
});
