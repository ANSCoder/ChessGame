document.addEventListener("DOMContentLoaded", () => {
    let game = new Chess();
    const boardElement = document.getElementById("chessBoard");
    let selectedSquare = null;
    let difficulty = 'easy';

    // Sounds
    const moveSnd = new Audio('https://images.chesscomfiles.com/chess-themes/sounds/_standard_/move-self.mp3');
    const captureSnd = new Audio('https://images.chesscomfiles.com/chess-themes/sounds/_standard_/capture.mp3');

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
                square.className = `square ${(r + c) % 2 === 0 ? "white-square" : "black-square"}`;
                square.dataset.sq = sqName; // For kill animation targeting

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

    // --- KILL MOTION ANIMATION ---
    function triggerKillEffect(sqName) {
        const sqElement = document.querySelector(`[data-sq="${sqName}"]`);
        if (sqElement) {
            sqElement.style.animation = "none";
            sqElement.offsetHeight; // trigger reflow
            sqElement.style.animation = "killShake 0.4s ease-in-out";
            sqElement.style.backgroundColor = "rgba(239, 68, 68, 0.6)"; // Red Flash
            setTimeout(() => { renderBoard(); }, 400); 
        }
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
                if (move.captured) {
                    captureSnd.play();
                    triggerKillEffect(sq);
                } else {
                    moveSnd.play();
                }
                selectedSquare = null;
                renderBoard(move);
                if (!game.game_over()) setTimeout(aiMove, 600);
            } else {
                selectedSquare = null;
                renderBoard();
            }
        }
    }

    function aiMove() {
        const moves = game.moves({ verbose: true });
        if (moves.length === 0) return;

        let chosenMove;
        if (difficulty === 'easy') {
            chosenMove = moves[Math.floor(Math.random() * moves.length)];
        } else {
            const captures = moves.filter(m => m.captured);
            chosenMove = captures.length > 0 ? captures[0] : moves[Math.floor(Math.random() * moves.length)];
        }

        const moveResult = game.move(chosenMove);
        if (moveResult.captured) {
            captureSnd.play();
            triggerKillEffect(moveResult.to);
        } else {
            moveSnd.play();
        }
        renderBoard(moveResult);
    }

    // --- FIREWORKS LOGIC ---
    function launchFireworks() {
        var duration = 5 * 1000;
        var animationEnd = Date.now() + duration;
        var defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 3000 };

        function randomInRange(min, max) { return Math.random() * (max - min) + min; }

        var interval = setInterval(function() {
            var timeLeft = animationEnd - Date.now();
            if (timeLeft <= 0) return clearInterval(interval);

            var particleCount = 50 * (timeLeft / duration);
            confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
            confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
        }, 250);
    }

    function showGameOver() {
        launchFireworks(); // Start Fireworks
        const overlay = document.createElement("div");
        overlay.className = "game-over-overlay";
        overlay.innerHTML = `
            <div class="winner-card" style="z-index:3001; position:relative;">
                <h2 style="font-size:2rem; color:#38bdf8;">🏆 GAME OVER 🏆</h2>
                <p style="margin:10px 0; font-weight:bold;">${game.in_draw() ? "It's a Draw!" : "Winner: " + (game.turn() === 'w' ? "Black" : "White")}</p>
                <button onclick="location.reload()" class="control-btn" style="background:#22c55e; padding:15px 30px;">PLAY AGAIN</button>
            </div>`;
        document.body.appendChild(overlay);
    }

    // Levels, Theme, Reset (Same logic)
    const diffBtns = document.querySelectorAll(".diff-btn");
    diffBtns.forEach(btn => {
        btn.onclick = (e) => {
            diffBtns.forEach(b => b.classList.remove("active"));
            e.target.classList.add("active");
            difficulty = e.target.innerText.toLowerCase();
        };
    });

    document.getElementById("themeBtn").onclick = () => document.body.classList.toggle("light-mode");
    const reset = () => { game = new Chess(); selectedSquare = null; renderBoard(); };
    document.getElementById("startBtn").onclick = reset;
    document.getElementById("resetBtn").onclick = reset;

    renderBoard();
});
