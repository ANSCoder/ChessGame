document.addEventListener("DOMContentLoaded", () => {
    const startChessGame = () => {
        if (typeof Chess === 'undefined') {
            setTimeout(startChessGame, 500);
            return;
        }

        const game = new Chess();
        const boardElement = document.getElementById("chessBoard");
        let selectedSquare = null;
        let level = "easy";

        // --- AUDIO ASSETS ---
        const moveSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3');
        const captureSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2572/2572-preview.mp3');
        const checkSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2573/2573-preview.mp3');

        const pieceMap = {
            p:'♟', r:'♜', n:'♞', b:'♝', q:'♛', k:'♚',
            P:'♙', R:'♖', N:'♘', B:'♗', Q:'♕', K:'♔'
        };

        // --- CORE FUNCTIONS ---
        function renderBoard(lastMove = null) {
            if (!boardElement) return;
            boardElement.innerHTML = "";
            const board = game.board();
            const turn = game.turn();

            for (let r = 0; r < 8; r++) {
                for (let c = 0; c < 8; c++) {
                    const square = document.createElement("div");
                    const squareName = String.fromCharCode(97 + c) + (8 - r);
                    square.className = "square " + ((r + c) % 2 === 0 ? "white-square" : "black-square");
                    square.setAttribute("data-square", squareName);
                    
                    const piece = board[r][c];
                    
                    // Render Piece
                    if (piece) {
                        const key = piece.color === "w" ? piece.type.toUpperCase() : piece.type.toLowerCase();
                        square.textContent = pieceMap[key];

                        // King Danger Alert
                        if (piece.type === 'k' && piece.color === turn && game.in_check()) {
                            square.classList.add("check-alert");
                        }
                    }

                    // Highlight Selected Square
                    if (selectedSquare === squareName) {
                        square.classList.add("selected");
                    }

                    // Highlight Last Move (For AI and Player)
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

        function highlightLegalMoves(squareName) {
            // Remove previous dots
            document.querySelectorAll(".square").forEach(s => s.classList.remove("legal-move"));
            
            const moves = game.moves({ square: squareName, verbose: true });
            moves.forEach(move => {
                const el = document.querySelector(`[data-square="${move.to}"]`);
                if (el) el.classList.add("legal-move");
            });
        }

        function handleClick(squareName) {
            const piece = game.get(squareName);

            // 1. Select Player Piece (White)
            if (piece && piece.color === "w") {
                selectedSquare = squareName;
                renderBoard(); 
                highlightLegalMoves(squareName);
                return;
            }

            // 2. Try to Move
            if (selectedSquare) {
                const move = game.move({ 
                    from: selectedSquare, 
                    to: squareName, 
                    promotion: "q" 
                });
                
                if (move) {
                    playMoveSound(move);
                    triggerCaptureAnimation(squareName);
                    selectedSquare = null;
                    
                    // Render board with last move highlight
                    renderBoard(move); 
                    
                    if (!game.game_over()) {
                        setTimeout(aiMove, 600);
                    }
                } else {
                    // Invalid click - Reset selection
                    selectedSquare = null;
                    renderBoard();
                }
            }
        }

        function aiMove() {
            const moves = game.moves();
            if (moves.length > 0) {
                // Easy: Random move | Medium/Hard: Aap yahan minimax add kar sakte hain
                const move = game.move(moves[Math.floor(Math.random() * moves.length)]);
                
                playMoveSound(move);
                triggerCaptureAnimation(move.to);
                
                // AI move ko highlight karne ke liye renderBoard mein pass karein
                renderBoard(move);
            }
        }

        function playMoveSound(move) {
            if (game.in_check()) {
                checkSound.play();
            } else if (move.captured) {
                captureSound.play();
            } else {
                moveSound.play();
            }
        }

        function triggerCaptureAnimation(sq) {
            setTimeout(() => {
                const el = document.querySelector(`[data-square="${sq}"]`);
                if(el) {
                    el.classList.add("captured-effect");
                    setTimeout(() => el.classList.remove("captured-effect"), 500);
                }
            }, 10);
        }

        function updateStatus() {
            const whiteBox = document.getElementById("player-w");
            const blackBox = document.getElementById("player-b");
            if (whiteBox && blackBox) {
                whiteBox.classList.toggle("active", game.turn() === 'w');
                blackBox.classList.toggle("active", game.turn() === 'b');
            }
        }

        function checkGameOver() {
            if (game.game_over()) {
                let status = "";
                if (game.in_checkmate()) {
                    const winner = game.turn() === 'w' ? "BLACK AI" : "YOU";
                    status = `CHECKMATE! ${winner} WINS`;
                    if(winner === "YOU") launchFireworks();
                } else {
                    status = "GAME OVER - DRAW / STALEMATE";
                }

                const overlay = document.createElement("div");
                overlay.className = "game-over-overlay";
                overlay.innerHTML = `
                    <div class="winner-card">
                        <h1 style="font-size:4rem; margin-bottom:10px;">🏆</h1>
                        <h2 style="color:#1e293b;">${status}</h2>
                        <button onclick="location.reload()" class="control-btn" style="margin-top:25px; background:#22c55e; padding: 15px 30px;">PLAY AGAIN</button>
                    </div>
                `;
                document.body.appendChild(overlay);
            }
        }

        function launchFireworks() {
            for(let i=0; i<40; i++) {
                setTimeout(() => {
                    const f = document.createElement("div");
                    f.className = "firework";
                    f.style.left = Math.random() * 100 + "vw";
                    f.style.top = Math.random() * 100 + "vh";
                    f.style.background = `hsl(${Math.random()*360}, 100%, 50%)`;
                    document.body.appendChild(f);
                    setTimeout(() => f.remove(), 1200);
                }, i * 150);
            }
        }

        // --- BUTTON HANDLERS ---
        document.getElementById("resetBtn").onclick = () => { 
            game.reset(); 
            selectedSquare = null; 
            renderBoard(); 
        };
        document.getElementById("startBtn").onclick = () => { 
            game.reset(); 
            selectedSquare = null; 
            renderBoard(); 
        };
        document.getElementById("themeBtn").onclick = () => document.body.classList.toggle("light-mode");
        
        // Mode toggle logic
        document.getElementById("modeBtn").onclick = () => {
            document.body.classList.toggle("mode-3d");
            renderBoard(); // Re-render to ensure 3D classes apply correctly
        };

        document.querySelectorAll(".level-btn").forEach(btn => {
            btn.onclick = () => {
                document.querySelectorAll(".level-btn").forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                level = btn.getAttribute("data-level");
            };
        });

        renderBoard(); // Initial render
    };

    const script = document.createElement('script');
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/chess.js/0.10.3/chess.min.js";
    script.onload = startChessGame;
    document.head.appendChild(script);
});
