var CANVAS_WIDTH = 500;
var CANVAS_HEIGHT = 500;

function CellGrid(cellsPerRow, cellsPerColumn) {
    this.cellsPerRow = cellsPerRow;
    this.cellsPerColumn = cellsPerColumn;
}
CellGrid.prototype.initializeVirtualGrid = function(initialSlope) {
    var virtualGrid = [];

    for (var i = 0; i < this.cellsPerRow; i++) {
        var row = [];

        for (var j = 0; j < this.cellsPerColumn; j++) {
            row.push(initialSlope);
        }

        virtualGrid.push(row);
    }

    this.virtualGrid = virtualGrid;
}
CellGrid.prototype.getCell = function(x, y) {
    return this.virtualGrid[x][y];
}
CellGrid.prototype.setCell = function(x, y, value) {
    this.virtualGrid[x][y] = value;
}
CellGrid.prototype.avalancheCell = function(x, y) {
    this.virtualGrid[x][y] -= 4;

    if (y + 1 < this.cellsPerColumn) {
        this.virtualGrid[x][y + 1] += 1;
    }
    if (x > 0) {
        this.virtualGrid[x - 1][y] += 1;
    }
    if (x + 1 < this.cellsPerRow) {
        this.virtualGrid[x + 1][y] += 1;
    }
    if (y > 0) {
        this.virtualGrid[x][y - 1] += 1;
    }
}
CellGrid.prototype.step = function(x, y) {
    var newGrid = this.virtualGrid.slice();

    newGrid.forEach(function(row, i) {
        row.forEach(function(cell, j){
            if (cell >= 4){
                this.avalancheCell(i, j);
            }
        }, this);
    }, this);
}


function GameCanvas(canvasWidth, canvasHeight) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
        
    this.elt = document.createElement('canvas');
    this.elt.setAttribute('height', canvasHeight);
    this.elt.setAttribute('width', canvasWidth);

    var lineGameDiv = document.getElementById('sand-piles');
    lineGameDiv.appendChild(this.elt);

    this.context = this.elt.getContext('2d');
}
GameCanvas.prototype.draw = function(cellGrid) {
    var numberOfRows = cellGrid.virtualGrid.length;
    var numberOfColumns = cellGrid.virtualGrid[0].length;

    var cellWidth = this.canvasWidth / numberOfColumns;
    var cellHeight = this.canvasHeight / numberOfRows;

    this.cellWidth = cellWidth;
    this.cellHeight = cellHeight;

    cellGrid.virtualGrid.forEach(function(row, i){
        row.forEach(function(cellValue, j) {
            var colorMap = {}
            for (var k = 0; k < 5; k++) {
                var colorCode = Math.floor(255 / 5 * (5 - k)).toString();
                colorMap[k] = 'rgb(' + colorCode + ',' + colorCode + ',' + colorCode + ')';
            }

            this.context.fillStyle = colorMap[cellValue];

            this.context.fillRect(
                i * cellWidth, j * cellHeight, 
                (i + 1) * cellWidth, (j + 1) * cellHeight
            );
        }, this);
    }, this);
}
GameCanvas.prototype.getClickCellCoordinates = function(event) {
    var elemLeft = this.elt.offsetLeft,
        elemTop = this.elt.offsetTop;

    var xPixel = event.pageX - elemLeft,
        yPixel = event.pageY - elemTop;

    var xCell = Math.floor(xPixel / this.cellWidth);
    var yCell = Math.floor(yPixel / this.cellHeight);
        
    return [xCell, yCell];
}

function TimeStepSlider(intialValue) {
    this.timestep = intialValue;
    this.elt = this.createElt();

    addEventListener('input', this.inputCallback.bind(this));

    var container = document.createElement('div');
    container.className = 'timestep-slider';

    var label = document.createElement('span');
    label.textContent = 'timestep slider:';

    container.appendChild(label);
    container.appendChild(this.elt);

    var lineGameDiv = document.getElementById('sand-piles');
    lineGameDiv.appendChild(container);
}
TimeStepSlider.prototype.createElt = function() {
    var elt = document.createElement('input');
    elt.setAttribute('type', 'range');
    elt.setAttribute('min', .1);
    elt.setAttribute('max', 1000);
    elt.setAttribute('value', this.timestep);

    return elt;
}
TimeStepSlider.prototype.getTimeStep = function() {
    return this.timestep;
}
TimeStepSlider.prototype.inputCallback = function(event) {
    this.timestep = this.elt.value;
}



function Game(timestep) {
    this.timestepSlider = new TimeStepSlider(timestep);
    this.timestepSlider.elt.addEventListener('input', this.timestepSliderCallback.bind(this));

    this.cellGrid = new CellGrid(50, 50)
    this.cellGrid.initializeVirtualGrid(4);

    this.canvas = new GameCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
    this.canvas.elt.addEventListener('click', this.canvasClickCallback.bind(this));

    this.updateTimeStep(this.timestepSlider.getTimeStep());

}
Game.prototype.updateTimeStep = function(timestep) {
    clearInterval(this.intervalId);
    
    this.intervalId = setInterval(
        this.step.bind(this),
        this.timestepSlider.getTimeStep()
    );
}
Game.prototype.step = function() {
    this.cellGrid.step();

    this.canvas.draw(this.cellGrid);
}
Game.prototype.canvasClickCallback = function(event) {
    var coords = this.canvas.getClickCellCoordinates(event);

    var x = coords[0],
        y = coords[1];

    var currentCellValue = this.cellGrid.getCell(x, y);

    this.cellGrid.setCell(x, y, currentCellValue + 1);

}
Game.prototype.timestepSliderCallback = function(event) {
    this.updateTimeStep(this.timestepSlider.getTimeStep());
}


new Game(100);
