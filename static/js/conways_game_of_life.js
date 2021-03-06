ANIMATION_TIME_STEP = 500; // milliseconds

CELL_CHECKED_PROB = 0.5;
N_ROWS = 10;
M_COLUMNS = 10;

function Board(nRows, mColumns) {
    this.nRows = nRows;
    this.mColumns = mColumns;

    this.gridElt = document.getElementById('grid');
    
    this.createGrid = function() {
        for (var i = 0; i < this.nRows; i++) {
            row = document.createElement('div');
            row.className = 'row';

            this.gridElt.appendChild(row);

            for (var j = 0; j < M_COLUMNS; j++) {
                cell = document.createElement('input');
                cell.type = 'checkbox'

                row.appendChild(cell);
            }
        }
    };

    this.getCell = function(rowNum, colNum) {
        row = this.gridElt.childNodes[rowNum];
        cell = row.childNodes[colNum];

        return cell;
    };

    this.randomlyAssignCellStates = function() {
        for (var i = 0; i < this.nRows; i++) {
            for (var j = 0; j < this.mColumns; j++) {
                cell = this.getCell(i, j);

                if (Math.random() < CELL_CHECKED_PROB) {
                    cell.checked = true;
                }
            }
        }
    };

    this.initialize = function() {
        this.createGrid();
        this.randomlyAssignCellStates();
    };

    this.getCellNeighbors = function(rowNum, colNum) {
        var neighbors = [];
        for (var i = -1; i <= 1; i++) {
            for (var j = -1; j <= 1; j++) {
                if (i == 0 && j == 0) {
                    continue;
                }

                var altRow = rowNum;
                var altCol = colNum;

                if (rowNum + i < 0) {
                     altRow = rowNum + this.nRows;
                }
                
                if (colNum + j < 0) {
                    altCol = colNum + this.mColumns;
                }

                if (rowNum + i > this.nRows - 1) {
                    altRow = rowNum - this.nRows;
                }

                if (colNum + j > this.mColumns - 1) {
                    altCol = colNum - this.mColumns;
                }

                neighbors.push(this.getCell(altRow + i, altCol + j));
            }
        }

        return neighbors;
    };

    this.getNumberLivingNeighbors = function(rowNum, colNum) {
        var neighbors = this.getCellNeighbors(rowNum, colNum);

        var numberLivingNeighbors = 0;
        for (var i = 0; i < neighbors.length; i++) {
            if (neighbors[i].checked) {
                numberLivingNeighbors++;
            }
        }

        return numberLivingNeighbors;
    };

    this.determineCellLives = function(rowNum, colNum) {
        var cell = this.getCell(rowNum, colNum);
        var numberLivingNeighbors = this.getNumberLivingNeighbors(rowNum, colNum);

        if (cell.checked) {
            if (numberLivingNeighbors < 2 || numberLivingNeighbors > 3) {
                return false;
            } else {
                return true;
            }
        } else {
            if (numberLivingNeighbors == 3) {
                return true;
            } else {
                return false;
            }
        }
    };

    this.stepForward = function() {
        var nextState = [];
        
        for (var i = 0; i < this.nRows; i++) {
            var nextRowState = [];

            for (var j = 0; j < this.mColumns; j++) {
                nextRowState.push(this.determineCellLives(i, j));
            }

            nextState.push(nextRowState);
        }

        for (var i = 0; i < this.nRows; i++) {
            for (var j = 0; j < this.mColumns; j++) {
                var cell = this.getCell(i, j);

                cell.checked = nextState[i][j];
            }
        }
    };

    this.toggleAnimation = function() {
        if (!this.animationOn) {
            this.animationOn = true;

            this.animationIntervalId = setInterval(
                this.stepForward.bind(this), 
                ANIMATION_TIME_STEP
            );

        } else {
            if (typeof this.animationIntervalId !== 'undefined' || this.animationIntervalId !== null) {
                clearInterval(this.animationIntervalId)
            }
            this.animationOn = false;
        }

        return this.animationOn;
    };
}

function main() {
    var board = new Board(N_ROWS, M_COLUMNS);

    board.initialize();

    nextButton = document.getElementById('next');
    nextButton.addEventListener('click', function() {
        board.stepForward();
     });

    animateButton = document.getElementById('animate');

    animateButton.addEventListener('click', function() {
        var animationOn = board.toggleAnimation();

        if (animationOn) {
            animateButton.textContent = 'stop animation';
        } else {
            animateButton.textContent = 'start animation';
        }
    });
}

main();


