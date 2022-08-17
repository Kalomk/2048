import Grid from "./grid.js";
import Tile from "./tile.js";
const gameBoard = document.getElementById("game-board");
const grid = new Grid(gameBoard);
grid.randomEmptyCell().tile = new Tile(gameBoard);
grid.randomEmptyCell().tile = new Tile(gameBoard);
setupInput();

function setupInput() {
  window.addEventListener("keydown", handleInput, { once: true });
}
async function handleInput(e) {
  switch (e.key) {
    case "ArrowUp":
      if (!canMoveup()) {
        setupInput();
        return;
      }
      await moveUp();
      break;
    case "ArrowDown":
      if (!canMoveDown()) {
        setupInput();
        return;
      }
      await moveDown();
      break;
    case "ArrowRight":
      if (!canMoveRight()) {
        setupInput();
        return;
      }
      await moveRight();
      break;
    case "ArrowLeft":
      if (!canMoveLeft()) {
        setupInput();
        return;
      }
      await moveLeft();
      break;
    default:
      setupInput();
      return;
  }
  grid.cells.forEach((cell) => cell.mergeTiles());
  const newTile = new Tile(gameBoard);
  grid.randomEmptyCell().tile = newTile;
  if (!canMoveup() && !canMoveDown() && !canMoveLeft() && !canMoveRight()) {
    newTile.waitForPromise(true).then(() => {
      alert("You Lose");
    });
    return;
  }
  setupInput();
}
function moveUp() {
  slideTiles(grid.cellsByColumn);
}
function moveDown() {
  slideTiles(grid.cellsByColumn.map((column) => [...column].reverse()));
}
function moveLeft() {
  slideTiles(grid.cellsByRow);
}
function moveRight() {
  slideTiles(grid.cellsByRow.map((row) => [...row].reverse()));
}

function slideTiles(cells) {
  Promise.all(
    cells.flatMap((group) => {
      const promises = [];
      for (let i = 0; i < group.length; i++) {
        const cell = group[i];
        if (cell.tile == null) continue;
        let lastValidCell;
        for (let j = i - 1; j >= 0; j--) {
          let moveToCell = group[j];
          if (!moveToCell.canAccept(cell.tile)) break;
          lastValidCell = moveToCell;
        }
        if (lastValidCell != null) {
          promises.push(cell.tile.waitForPromise());
          if (lastValidCell.tile != null) {
            lastValidCell.mergeTile = cell.tile;
          } else {
            lastValidCell.tile = cell.tile;
          }
          cell.tile = null;
        }
      }
      return promises;
    })
  );
}
function canMoveup() {
  return canMove(grid.cellsByColumn);
}
function canMoveDown() {
  return canMove(grid.cellsByColumn.map((column) => [...column].reverse()));
}
function canMoveLeft() {
  return canMove(grid.cellsByRow);
}
function canMoveRight() {
  return canMove(grid.cellsByRow.map((row) => [...row].reverse()));
}
function canMove(cell) {
  return cell.some((group) => {
    return group.some((cell, index) => {
      if (index === 0) return false;
      if (cell.tile == null) return false;
      const moveToCell = group[index - 1];
      return moveToCell.canAccept(cell.tile);
    });
  });
}
