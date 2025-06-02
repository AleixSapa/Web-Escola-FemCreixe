// Creem un objecte global per al joc d'escacs
window.chessGame = {
  selectedPiece: null,
  currentTurn: "white",
  gameBoard: [],
  difficultyLevel: 0,
  gameOver: false,

  PIECES: {
    white: {
      pawn: "♙",
      rook: "♖",
      knight: "♘",
      bishop: "♗",
      queen: "♕",
      king: "♔",
    },
    black: {
      pawn: "♟",
      rook: "♜",
      knight: "♞",
      bishop: "♝",
      queen: "♛",
      king: "♚",
    },
  },

  // Configuració inicial del tauler
  initializeBoard() {
    this.gameBoard = [
      ["br", "bn", "bb", "bq", "bk", "bb", "bn", "br"],
      ["bp", "bp", "bp", "bp", "bp", "bp", "bp", "bp"],
      ["", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", ""],
      ["wp", "wp", "wp", "wp", "wp", "wp", "wp", "wp"],
      ["wr", "wn", "wb", "wq", "wk", "wb", "wn", "wr"],
    ];
    this.gameOver = false;
    this.currentTurn = "white";
    this.selectedPiece = null;
  },

  // Funció per seleccionar la dificultat
  selectDifficulty(level) {
    console.log("Seleccionant dificultat:", level);
    this.difficultyLevel = level;
    document.getElementById("difficulty-screen").style.display = "none";
    document.getElementById("game-screen").style.display = "block";
    document.getElementById(
      "level"
    ).textContent = `Nivell: ${this.getDifficultyName(level)}`;
    this.initializeGame();
  },

  // Obtenir el nom del nivell de dificultat
  getDifficultyName(level) {
    const levels = {
      1: "Fàcil",
      2: "Normal",
      3: "Difícil",
    };
    return levels[level];
  },

  // Inicialitzar el joc
  initializeGame() {
    this.initializeBoard();
    this.createBoard();
    this.updateBoard();
  },

  // Crear el tauler visual
  createBoard() {
    const board = document.getElementById("board");
    board.innerHTML = "";

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const square = document.createElement("div");
        square.className = `square ${(row + col) % 2 === 0 ? "light" : "dark"}`;
        square.dataset.row = row;
        square.dataset.col = col;
        square.addEventListener("click", (e) => this.handleSquareClick(e));
        board.appendChild(square);
      }
    }
  },

  // Actualitzar la visualització del tauler
  updateBoard() {
    const squares = document.querySelectorAll(".square");
    squares.forEach((square) => {
      const row = parseInt(square.dataset.row);
      const col = parseInt(square.dataset.col);
      const piece = this.gameBoard[row][col];

      square.innerHTML = "";
      if (piece) {
        const pieceDiv = document.createElement("div");
        pieceDiv.className = "piece";
        const color = piece[0] === "w" ? "white" : "black";
        const type = this.getPieceType(piece[1]);
        pieceDiv.textContent = this.PIECES[color][type];
        square.appendChild(pieceDiv);
      }
    });
  },

  // Gestionar el clic en una casella
  handleSquareClick(e) {
    if (this.gameOver) return;

    const square = e.target.closest(".square");
    const row = parseInt(square.dataset.row);
    const col = parseInt(square.dataset.col);

    if (!this.selectedPiece) {
      this.selectPiece(row, col);
    } else {
      this.movePiece(row, col);
    }
  },

  // Seleccionar una peça
  selectPiece(row, col) {
    const piece = this.gameBoard[row][col];
    if (!piece || piece[0] !== (this.currentTurn === "white" ? "w" : "b"))
      return;

    this.selectedPiece = { row, col };
    this.highlightPossibleMoves(row, col);
  },

  // Mostrar moviments possibles
  highlightPossibleMoves(row, col) {
    const squares = document.querySelectorAll(".square");
    squares.forEach((square) => {
      square.classList.remove("selected", "possible-move");
    });

    document
      .querySelector(`[data-row="${row}"][data-col="${col}"]`)
      .classList.add("selected");

    for (let toRow = 0; toRow < 8; toRow++) {
      for (let toCol = 0; toCol < 8; toCol++) {
        if (this.isValidMove(row, col, toRow, toCol)) {
          document
            .querySelector(`[data-row="${toRow}"][data-col="${toCol}"]`)
            .classList.add("possible-move");
        }
      }
    }
  },

  // Moure una peça
  movePiece(toRow, toCol) {
    if (!this.selectedPiece) return;

    if (
      this.isValidMove(
        this.selectedPiece.row,
        this.selectedPiece.col,
        toRow,
        toCol
      )
    ) {
      const capturedPiece = this.gameBoard[toRow][toCol];

      if (capturedPiece) {
        this.updateCapturedPieces(capturedPiece);
        if (capturedPiece[1] === "k") {
          this.gameOver = true;
          const winner = capturedPiece[0] === "b" ? "Blanques" : "Negres";
          document.getElementById(
            "turn"
          ).textContent = `Fi del joc! Guanyen les ${winner}!`;
          this.selectedPiece = null;
          this.updateBoard();
          return;
        }
      }

      const piece =
        this.gameBoard[this.selectedPiece.row][this.selectedPiece.col];
      this.gameBoard[toRow][toCol] = piece;
      this.gameBoard[this.selectedPiece.row][this.selectedPiece.col] = "";

      this.currentTurn = this.currentTurn === "white" ? "black" : "white";
      if (!this.gameOver) {
        document.getElementById("turn").textContent = `Torn: ${
          this.currentTurn === "white" ? "Blanques" : "Negres"
        }`;
      }

      if (this.currentTurn === "black" && !this.gameOver) {
        setTimeout(() => this.makeAIMove(), 500);
      }
    }

    this.selectedPiece = null;
    const squares = document.querySelectorAll(".square");
    squares.forEach((square) =>
      square.classList.remove("selected", "possible-move")
    );
    this.updateBoard();
  },

  // Verificar si un moviment és vàlid
  isValidMove(fromRow, fromCol, toRow, toCol) {
    const piece = this.gameBoard[fromRow][fromCol];
    if (!piece) return false;

    const targetPiece = this.gameBoard[toRow][toCol];
    if (targetPiece && targetPiece[0] === piece[0]) return false;

    const pieceType = piece[1];
    const isWhite = piece[0] === "w";

    switch (pieceType) {
      case "p":
        return this.isValidPawnMove(fromRow, fromCol, toRow, toCol, isWhite);
      case "r":
        return this.isValidRookMove(fromRow, fromCol, toRow, toCol);
      case "n":
        return this.isValidKnightMove(fromRow, fromCol, toRow, toCol);
      case "b":
        return this.isValidBishopMove(fromRow, fromCol, toRow, toCol);
      case "q":
        return this.isValidQueenMove(fromRow, fromCol, toRow, toCol);
      case "k":
        return this.isValidKingMove(fromRow, fromCol, toRow, toCol);
      default:
        return false;
    }
  },

  // Regles de moviment per cada peça
  isValidPawnMove(fromRow, fromCol, toRow, toCol, isWhite) {
    const direction = isWhite ? -1 : 1;
    const startRow = isWhite ? 6 : 1;

    // Moviment normal d'una casella endavant
    if (fromCol === toCol && toRow === fromRow + direction) {
      return !this.gameBoard[toRow][toCol];
    }

    // Moviment inicial de dues caselles
    if (
      fromCol === toCol &&
      fromRow === startRow &&
      toRow === fromRow + 2 * direction
    ) {
      return (
        !this.gameBoard[fromRow + direction][toCol] &&
        !this.gameBoard[toRow][toCol]
      );
    }

    // Captura diagonal
    if (Math.abs(fromCol - toCol) === 1 && toRow === fromRow + direction) {
      return (
        this.gameBoard[toRow][toCol] &&
        this.gameBoard[toRow][toCol][0] !== (isWhite ? "w" : "b")
      );
    }

    return false;
  },

  isValidRookMove(fromRow, fromCol, toRow, toCol) {
    if (fromRow !== toRow && fromCol !== toCol) return false;

    const rowDir = fromRow === toRow ? 0 : toRow > fromRow ? 1 : -1;
    const colDir = fromCol === toCol ? 0 : toCol > fromCol ? 1 : -1;

    let currentRow = fromRow + rowDir;
    let currentCol = fromCol + colDir;

    while (currentRow !== toRow || currentCol !== toCol) {
      if (this.gameBoard[currentRow][currentCol]) return false;
      currentRow += rowDir;
      currentCol += colDir;
    }

    return true;
  },

  isValidKnightMove(fromRow, fromCol, toRow, toCol) {
    const rowDiff = Math.abs(toRow - fromRow);
    const colDiff = Math.abs(toCol - fromCol);
    return (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2);
  },

  isValidBishopMove(fromRow, fromCol, toRow, toCol) {
    if (Math.abs(toRow - fromRow) !== Math.abs(toCol - fromCol)) return false;

    const rowDir = toRow > fromRow ? 1 : -1;
    const colDir = toCol > fromCol ? 1 : -1;

    let currentRow = fromRow + rowDir;
    let currentCol = fromCol + colDir;

    while (currentRow !== toRow && currentCol !== toCol) {
      if (this.gameBoard[currentRow][currentCol]) return false;
      currentRow += rowDir;
      currentCol += colDir;
    }

    return true;
  },

  isValidQueenMove(fromRow, fromCol, toRow, toCol) {
    return (
      this.isValidRookMove(fromRow, fromCol, toRow, toCol) ||
      this.isValidBishopMove(fromRow, fromCol, toRow, toCol)
    );
  },

  isValidKingMove(fromRow, fromCol, toRow, toCol) {
    const rowDiff = Math.abs(toRow - fromRow);
    const colDiff = Math.abs(toCol - fromCol);
    return rowDiff <= 1 && colDiff <= 1;
  },

  // Funció de la IA
  makeAIMove() {
    if (this.gameOver) return;

    const possibleMoves = [];
    for (let fromRow = 0; fromRow < 8; fromRow++) {
      for (let fromCol = 0; fromCol < 8; fromCol++) {
        if (
          this.gameBoard[fromRow][fromCol] &&
          this.gameBoard[fromRow][fromCol][0] === "b"
        ) {
          for (let toRow = 0; toRow < 8; toRow++) {
            for (let toCol = 0; toCol < 8; toCol++) {
              if (this.isValidMove(fromRow, fromCol, toRow, toCol)) {
                const score = this.evaluateMove(fromRow, fromCol, toRow, toCol);
                possibleMoves.push({
                  from: { row: fromRow, col: fromCol },
                  to: { row: toRow, col: toCol },
                  score: score,
                });
              }
            }
          }
        }
      }
    }

    possibleMoves.sort((a, b) => b.score - a.score);

    let selectedMove;
    switch (this.difficultyLevel) {
      case 1: // Fàcil - Moviments bastant aleatoris
        const easyIndex = Math.floor(possibleMoves.length * 0.8);
        selectedMove = possibleMoves[Math.floor(Math.random() * easyIndex)];
        break;

      case 2: // Normal - Equilibrat
        const normalIndex = Math.floor(possibleMoves.length * 0.4);
        selectedMove = possibleMoves[Math.floor(Math.random() * normalIndex)];
        break;

      case 3: // Difícil - Intel·ligent
        const hardIndex = Math.min(3, possibleMoves.length);
        selectedMove = possibleMoves[Math.floor(Math.random() * hardIndex)];
        break;
    }

    if (selectedMove) {
      const capturedPiece =
        this.gameBoard[selectedMove.to.row][selectedMove.to.col];
      if (capturedPiece) {
        this.updateCapturedPieces(capturedPiece);
        if (capturedPiece[1] === "k") {
          this.gameOver = true;
          document.getElementById("turn").textContent =
            "Fi del joc! Guanyen les Negres!";
          this.updateBoard();
          return;
        }
      }

      const piece =
        this.gameBoard[selectedMove.from.row][selectedMove.from.col];
      this.gameBoard[selectedMove.to.row][selectedMove.to.col] = piece;
      this.gameBoard[selectedMove.from.row][selectedMove.from.col] = "";

      this.currentTurn = "white";
      if (!this.gameOver) {
        document.getElementById("turn").textContent = "Torn: Blanques";
      }
      this.updateBoard();
    }
  },

  // Avaluar un moviment
  evaluateMove(fromRow, fromCol, toRow, toCol) {
    let score = 0;
    const piece = this.gameBoard[fromRow][fromCol];
    const targetPiece = this.gameBoard[toRow][toCol];

    // Valors base de les peces
    const pieceValues = {
      p: 10, // Peó
      n: 30, // Cavall
      b: 30, // Alfil
      r: 50, // Torre
      q: 90, // Reina
      k: 900, // Rei
    };

    // Valor base per captures
    if (targetPiece) {
      score += pieceValues[targetPiece[1]];
    }

    // Factors estratègics basats en el nivell
    if (this.difficultyLevel >= 2) {
      // Normal i Difícil
      // Control del centre
      if ((toRow === 3 || toRow === 4) && (toCol === 3 || toCol === 4)) {
        score += 5;
      }

      // Desenvolupament de peces
      if (piece[1] !== "p" && fromRow === 7) {
        score += 3;
      }
    }

    if (this.difficultyLevel === 3) {
      // Només Difícil
      // Control del territori
      score += (7 - toRow) * 2;

      // Protecció del rei
      if (piece[1] === "k") {
        if (toRow < 6) score -= 10;
        if (toCol > 5 || toCol < 2) score -= 10;
      }

      // Atac agressiu
      if (toRow < 3) {
        score += 7;
      }
    }

    return score;
  },

  // Actualitzar peces capturades
  updateCapturedPieces(capturedPiece) {
    const color = capturedPiece[0] === "w" ? "white" : "black";
    const type = this.getPieceType(capturedPiece[1]);
    const pieceSymbol = this.PIECES[color][type];

    const capturedDiv = document.getElementById(`captured-${color}`);
    capturedDiv.textContent += ` ${pieceSymbol}`;
  },

  // Obtenir el tipus de peça
  getPieceType(letter) {
    const types = {
      p: "pawn",
      r: "rook",
      n: "knight",
      b: "bishop",
      q: "queen",
      k: "king",
    };
    return types[letter];
  },

  // Reiniciar el joc
  resetGame() {
    document.getElementById("difficulty-screen").style.display = "block";
    document.getElementById("game-screen").style.display = "none";
    document.getElementById("captured-white").textContent =
      "Peces capturades (Blanques): ";
    document.getElementById("captured-black").textContent =
      "Peces capturades (Negres): ";
    this.currentTurn = "white";
    this.selectedPiece = null;
    this.gameOver = false;
  },
};

// Inicialitzar el joc quan es carrega la pàgina
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("game-screen").style.display = "none";
});
function inici() {
  window.location.href =
    "https://aleixsapa.github.io/Web-Escola-FemCreixe/dashboard.html";
}
