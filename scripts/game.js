document.addEventListener("DOMContentLoaded", () => {

const game = new Chess();
const boardElement = document.getElementById("chessBoard");

let selected = null;
let level = "easy";

const pieceMap = {
p:'♟', r:'♜', n:'♞', b:'♝', q:'♛', k:'♚',
P:'♙', R:'♖', N:'♘', B:'♗', Q:'♕', K:'♔'
};

function render() {

boardElement.innerHTML="";
const board=game.board();

for(let r=0;r<8;r++){
for(let c=0;c<8;c++){

const square=document.createElement("div");
square.className="square "+((r+c)%2===0?"white-square":"black-square");

const name=String.fromCharCode(97+c)+(8-r);
const piece=board[r][c];

if(piece){
const key=piece.color==="w"?piece.type.toUpperCase():piece.type;
square.textContent=pieceMap[key];
}

if(selected===name) square.classList.add("selected");

square.onclick=()=>handleClick(name);

boardElement.appendChild(square);
}
}
}

function handleClick(square){

if(game.turn()!=="w") return;

if(selected){
const move=game.move({from:selected,to:square,promotion:"q"});
selected=null;
render();
if(move && !game.game_over()) setTimeout(aiMove,300);
return;
}

const piece=game.get(square);
if(piece && piece.color==="w"){
selected=square;
render();
}
}

function aiMove(){

const moves=game.moves({verbose:true});
if(!moves.length) return;

let move;

if(level==="easy"){
move=moves[Math.floor(Math.random()*moves.length)];
}

if(level==="medium"){
const captures=moves.filter(m=>m.captured);
move=captures.length?captures[Math.floor(Math.random()*captures.length)]
:moves[Math.floor(Math.random()*moves.length)];
}

if(level==="hard"){
const captures=moves.filter(m=>m.captured);
if(captures.length){
captures.sort((a,b)=>pieceValue(b.captured)-pieceValue(a.captured));
move=captures[0];
}else{
move=moves[Math.floor(Math.random()*moves.length)];
}
}

game.move(move);
render();
}

function pieceValue(piece){
const values={p:1,n:3,b:3,r:5,q:9,k:100};
return values[piece]||0;
}

document.getElementById("startBtn").onclick=()=>{
game.reset();
render();
};

document.getElementById("resetBtn").onclick=()=>{
game.reset();
render();
};

document.getElementById("themeBtn").onclick=()=>{
document.body.classList.toggle("light-mode");
};

document.getElementById("modeBtn").onclick=()=>{
document.body.classList.toggle("mode-3d");
};

document.querySelectorAll(".level-btn").forEach(btn=>{
btn.addEventListener("click",()=>{
document.querySelectorAll(".level-btn").forEach(b=>b.classList.remove("active"));
btn.classList.add("active");
level=btn.dataset.level;
});
});

render();

});
