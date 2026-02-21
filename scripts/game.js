document.addEventListener("DOMContentLoaded", () => {
    let game = new Chess();
    const boardElement = document.getElementById("chessBoard");
    let selectedSquare = null;
    let difficulty = 'easy'; // Default

    const pieceMap = {
        'p': '♟', 'r': '♜', 'n': '♞', 'b': '♝', 'q': '♛', 'k': '♚',
        'P': '♟', 'R': '♜', 'N': '♞', 'B': '♝', 'Q': '♛', 'K': '♚'
    };

    function renderBoard(moveObj = null) {
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
                    const icon = pieceMap[piece.color === 'w' ? piece.type.toUpperCase() : piece.type.toLowerCase()];
                    square.textContent = icon;
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

        // Select own color piece
        if (piece && piece.color === game.turn()) {
            selectedSquare = sq;
            renderBoard();
            return;
        }

        // Try to move
        if (selectedSquare) {
            const move = game.move({ from: selectedSquare, to: sq, promotion: 'q' });
            if (move) {
                selectedSquare = null;
                renderBoard();
                if (!game.game_over()) setTimeout(aiMove, 600);
            } else {
                selectedSquare = null;
                renderBoard();
            }
        }
    }

    // --- AI MOVE FUNCTION (FIXED) ---
    function aiMove() {
        const moves = game.moves();
        if (moves.length === 0) return;

        let selectedMove;
        if (difficulty === 'easy') {
            // Totally random
            selectedMove = moves[Math.floor(Math.random() * moves.length)];
        } else if (difficulty === 'medium') {
            // Prioritize captures
            const captures = moves.filter(m => m.includes('x'));
            selectedMove = captures.length > 0 ? captures[0] : moves[Math.floor(Math.random() * moves.length)];
        } else {
            // Hard: Priority to checks and captures
            const checks = moves.filter(m => m.includes('+'));
            const captures = moves.filter(m => m.includes('x'));
            selectedMove = checks.length > 0 ? checks[0] : (captures.length > 0 ? captures[0] : moves[Math.floor(Math.random() * moves.length)]);
        }

        game.move(selectedMove);
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

    // --- BUTTON EVENT LISTENERS ---
    const resetGame = () => { game = new Chess(); selectedSquare = null; renderBoard(); };
    
    document.getElementById("startBtn").onclick = resetGame;
    document.getElementById("resetBtn").onclick = resetGame;
    document.getElementById("themeBtn").onclick = () => document.body.classList.toggle("light-mode");

    // Difficulty buttons setup
    const diffBtns = document.querySelectorAll(".diff-btn");
    diffBtns.forEach(btn => {
        btn.onclick = (e) => {
            diffBtns.forEach(b => b.classList.remove("active"));
            e.target.classList.add("active");
            difficulty = e.target.id.toLowerCase();
            console.log("Difficulty set to:", difficulty);
        };
    });

    renderBoard();
});
