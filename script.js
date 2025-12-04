
const cells = document.querySelectorAll(".cell");
const statusText = document.getElementById("status");
const resetBtn = document.getElementById("reset");
const resetScoresBtn = document.getElementById("resetScores");
const modeSelect = document.getElementById("mode");
const soundBtn = document.getElementById("soundToggle");


let board = ["", "", "", "", "", "", "", "", ""];
let currentPlayer = "X";
let gameActive = true;
let soundOn = true;


let scoreX = Number(localStorage.getItem("scoreX")) || 0;
let scoreO = Number(localStorage.getItem("scoreO")) || 0;
let scoreDraw = Number(localStorage.getItem("scoreDraw")) || 0;

document.getElementById("scoreX").textContent = scoreX;
document.getElementById("scoreO").textContent = scoreO;
document.getElementById("scoreDraw").textContent = scoreDraw;

// SOUNDS
const clickSound = new Audio("https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3");
const winSound = new Audio("https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3");


const winningConditions = [
    [0,1,2], [3,4,5], [6,7,8],
    [0,3,6], [1,4,7], [2,5,8],
    [0,4,8], [2,4,6]
];


cells.forEach(cell => cell.addEventListener("click", handleCellClick));

function handleCellClick() {
    const index = this.getAttribute("data-index");

    if (board[index] !== "" || !gameActive) return;

    
    board[index] = currentPlayer;
    this.textContent = currentPlayer;

    if (soundOn) clickSound.play();

    checkWinner();
    if (!gameActive) return;

    
    if (modeSelect.value !== "pvp" && currentPlayer === "O") {
        setTimeout(() => {
            if (modeSelect.value === "easy") aiEasy();
            if (modeSelect.value === "hard") aiHard();
        }, 300);
    }
}


function aiEasy() {
    let empty = board.map((v, i) => v === "" ? i : null).filter(v => v !== null);
    let move = empty[Math.floor(Math.random() * empty.length)];
    cells[move].click();
}


function aiHard() {
    let move = minimax(board, "O").index;
    cells[move].click();
}

function minimax(newBoard, player) {
    let empties = newBoard.map((v, i) => v === "" ? i : null).filter(v => v !== null);

    if (checkWin(newBoard, "X")) return { score: -10 };
    if (checkWin(newBoard, "O")) return { score: 10 };
    if (empties.length === 0) return { score: 0 };

    let moves = [];

    for (let i of empties) {
        let move = {};
        move.index = i;
        newBoard[i] = player;

        move.score = (player === "O")
            ? minimax(newBoard, "X").score
            : minimax(newBoard, "O").score;

        newBoard[i] = "";
        moves.push(move);
    }

    if (player === "O") {
        return moves.reduce((best, m) => m.score > best.score ? m : best);
    } else {
        return moves.reduce((best, m) => m.score < best.score ? m : best);
    }
}


function checkWinner() {
    let win = false;

    for (let condition of winningConditions) {
        const [a, b, c] = condition;

        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            win = true;
            break;
        }
    }

    if (win) {
        statusText.textContent = `Player ${currentPlayer} Wins! 🎉`;
        if (soundOn) winSound.play();
        gameActive = false;

        if (currentPlayer === "X") scoreX++;
        else scoreO++;

        saveScores();
        updateScores();
        return;
    }

    if (!board.includes("")) {
        statusText.textContent = "It's a Draw! 🤝";
        gameActive = false;
        scoreDraw++;
        saveScores();
        updateScores();
        return;
    }

    currentPlayer = currentPlayer === "X" ? "O" : "X";
    statusText.textContent = `Player ${currentPlayer}'s Turn`;
}

function checkWin(boardState, player) {
    return winningConditions.some(cond =>
        cond.every(i => boardState[i] === player)
    );
}


resetBtn.addEventListener("click", resetGame);

function resetGame() {
    board = ["", "", "", "", "", "", "", "", ""];
    currentPlayer = "X";
    gameActive = true;
    statusText.textContent = "Player X's Turn";
    cells.forEach(cell => cell.textContent = "");
}


function updateScores() {
    document.getElementById("scoreX").textContent = scoreX;
    document.getElementById("scoreO").textContent = scoreO;
    document.getElementById("scoreDraw").textContent = scoreDraw;
}

function saveScores() {
    localStorage.setItem("scoreX", scoreX);
    localStorage.setItem("scoreO", scoreO);
    localStorage.setItem("scoreDraw", scoreDraw);
}

resetScoresBtn.addEventListener("click", () => {
    scoreX = 0;
    scoreO = 0;
    scoreDraw = 0;
    saveScores();
    updateScores();
});


soundBtn.addEventListener("click", () => {
    soundOn = !soundOn;
    soundBtn.textContent = soundOn ? "🔊 Sound: ON" : "🔇 Sound: OFF";
});
