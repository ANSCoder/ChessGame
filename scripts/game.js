document.addEventListener("DOMContentLoaded", () => {
    let game = new Chess();
    const boardElement = document.getElementById("chessBoard");
    let selectedSquare = null;
    let difficulty = 'easy'; // Default

    // Unicode piece map
    const pieceMap = {
        'p': '♟', 'r': '♜', 'n': '♞', 'b': '♝', 'q': '♛', 'k': '♚',
        'P': '♟', 'R': '♜', 'N': '♞', 'B': '♝', 'Q': '♛', 'K': '♚'
    };

    // Sound handling function
    const playSnd = (id) => {
        const audio = document.getElementById(`sound-${id}`);
        if (audio) {
            audio.currentTime = 0;
            audio.play().catch(() => { /* Auto-play browser block handle */ });
        }
    };

    function renderBoard(moveObj = null) {
        if (!boardElement) return;
        boardElement.innerHTML = "";

        // Sound Logic
        if (moveObj) {
            if (game.in_check()) playSnd('check');
            else if (moveObj.captured) playSnd('capture');
            else playSnd('move');
        }

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
                
                square.onclick = () => handleClick(sqName);
                boardElement.appendChild(square);
            }
        }
        if (game.game_over()) handleGameOver();
    }

    function handleClick(sq) {
        const piece = game.get(sq);

        // Selection
        if (piece && piece.color === game.turn()) {
            selectedSquare = sq;
            renderBoard();
            return;
        }

        // Making a move
        if (selectedSquare) {
            const move = game.move({ from: selectedSquare, to: sq, promotion: 'q' });
            if (move) {
                selectedSquare = null;
                renderBoard(move);
                if (!game.game_over()) {
                    setTimeout(aiMove, 600); // Calling aiMove here
                }
            } else {
                selectedSquare = null;
                renderBoard();
            }
        }
    }

    // --- AI MOVE FUNCTION (FIXED) ---
    function aiMove() {
        const moves = game.moves({ verbose: true });
        if (moves.length === 0) return;

        let selectedMove;
        if (difficulty === 'easy') {
            // Random move logic
            selectedMove = moves[Math.floor(Math.random() * moves.length)];
        } else {
            // Medium/Hard: Priority to capture
            const captures = moves.filter(m => m.captured);
            selectedMove = captures.length > 0 ? captures[0] : moves[Math.floor(Math.random() * moves.length)];
        }

        const moveResult = game.move(selectedMove);
        renderBoard(moveResult);
    }

    function handleGameOver() {
        playSnd('end');
        if (window.confetti) {
            confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
        }

        const overlay = document.createElement("div");
        overlay.className = "game-over-overlay";
        overlay.innerHTML = `
            <div class="winner-card">
                <h2>Game Over!</h2>
                <button onclick="location.reload()" class="control-btn" style="background:#22c55e; margin-top:20px; color:white;">Play Again</button>
            </div>`;
        document.body.appendChild(overlay);
    }

    // --- INITIALIZING BUTTONS ---
    const startBtn = document.getElementById("startBtn");
    const resetBtn = document.getElementById("resetBtn");
    const themeBtn = document.getElementById("themeBtn");

    if (startBtn) startBtn.onclick = () => { game = new Chess(); selectedSquare = null; renderBoard(); };
    if (resetBtn) resetBtn.onclick = () => { game = new Chess(); selectedSquare = null; renderBoard(); };
    if (themeBtn) themeBtn.onclick = () => document.body.classList.toggle("light-mode");

    // Difficulty logic
    document.querySelectorAll(".diff-btn").forEach(btn => {
        btn.onclick = (e) => {
            document.querySelectorAll(".diff-btn").forEach(b => b.classList.remove("active"));
            e.target.classList.add("active");
            difficulty = e.target.id.toLowerCase();
        };
    });

    renderBoard();
});
