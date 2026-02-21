document.addEventListener("DOMContentLoaded", () => {
    let game = new Chess();
    const boardElement = document.getElementById("chessBoard");
    let selectedSquare = null;
    let difficulty = 'easy'; // Default

    const pieceMap = {
        'p':'♟','r':'♜','n':'♞','b':'♝','q':'♛','k':'♚',
        'P':'♟','R':'♜','N':'♞','B':'♝','Q':'♛','K':'♚'
    };

    function renderBoard(lastMove = null) {
        if (!boardElement) return;
        boardElement.innerHTML = "";
        const board = game.board();

        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const square = document.createElement("div");
                const sqName = String.fromCharCode(97 + c) + (8 - r);
                
                // Base classes
                square.className = `square ${(r + c) % 2 === 0 ? "white-square" : "black-square"}`;
                
                // Highlight last move (AI or Player)
                if (lastMove && (sqName === lastMove.from || sqName === lastMove.to)) {
                    square.classList.add("last-move");
                }

                const piece = board[r][c];
                if (piece) {
                    square.textContent = pieceMap[piece.color === 'w' ? piece.type.toUpperCase() : piece.type.toLowerCase()];
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
        
        // Select piece
        if (piece && piece.color === game.turn()) {
            selectedSquare = sq;
            renderBoard();
            return;
        }

        // Execute move
        if (selectedSquare) {
            const move = game.move({ from: selectedSquare, to: sq, promotion: 'q' });
            if (move) {
                selectedSquare = null;
                renderBoard(move);
                if (!game.game_over()) {
                    // Small delay for AI move
                    setTimeout(aiMove, 600);
                }
            } else {
                selectedSquare = null;
                renderBoard();
            }
        }
    }

    // --- FIXED AI LOGIC ---
    function aiMove() {
        const moves = game.moves({ verbose: true });
        if (moves.length === 0) return;

        let chosenMove;
        
        if (difficulty === 'easy') {
            // Level Easy: 100% Random
            chosenMove = moves[Math.floor(Math.random() * moves.length)];
        } 
        else if (difficulty === 'medium') {
            // Level Medium: Priority to captures
            const captures = moves.filter(m => m.captured);
            chosenMove = captures.length > 0 ? captures[0] : moves[Math.floor(Math.random() * moves.length)];
        } 
        else {
            // Level Hard: Priority to checks and captures
            const checks = moves.filter(m => m.san.includes('+'));
            const captures = moves.filter(m => m.captured);
            
            if (checks.length > 0) chosenMove = checks[0];
            else if (captures.length > 0) chosenMove = captures[0];
            else chosenMove = moves[Math.floor(Math.random() * moves.length)];
        }

        const moveResult = game.move(chosenMove);
        renderBoard(moveResult);
    }

    function showGameOver() {
        const overlay = document.createElement("div");
        overlay.className = "game-over-overlay";
        overlay.innerHTML = `
            <div class="winner-card">
                <h2>Game Over!</h2>
                <p>${game.in_draw() ? "It's a Draw!" : "Winner: " + (game.turn() === 'w' ? "Black" : "White")}</p>
                <button onclick="location.reload()" class="control-btn" style="background:#22c55e; margin-top:15px; color:white;">Play Again</button>
            </div>`;
        document.body.appendChild(overlay);
    }

    // --- BUTTON LISTENERS FIX ---
    
    // Level Buttons: Click karke active class add karna aur logic change karna
    const diffBtns = document.querySelectorAll(".diff-btn");
    diffBtns.forEach(btn => {
        btn.onclick = (e) => {
            // 1. Remove active from everyone
            diffBtns.forEach(b => b.classList.remove("active"));
            
            // 2. Add active to clicked button
            const target = e.target;
            target.classList.add("active");
            
            // 3. Update internal difficulty variable
            difficulty = target.innerText.toLowerCase();
            console.log("Difficulty set to:", difficulty);
        };
    });

    // Theme Switch
    const themeBtn = document.getElementById("themeBtn");
    if (themeBtn) {
        themeBtn.onclick = () => document.body.classList.toggle("light-mode");
    }

    // Reset & Start
    const reset = () => { 
        game = new Chess(); 
        selectedSquare = null; 
        renderBoard(); 
    };
    
    const startBtn = document.getElementById("startBtn");
    const resetBtn = document.getElementById("resetBtn");
    if (startBtn) startBtn.onclick = reset;
    if (resetBtn) resetBtn.onclick = reset;

    // Initial Render
    renderBoard();
});
