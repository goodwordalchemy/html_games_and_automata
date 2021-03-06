N_ROWS = M_COLUMNS = 5;
BOARD_HEIGHT = BOARD_WIDTH = 400;

var lineLength = BOARD_HEIGHT / (N_ROWS + 1) / 2;


var lineWidth = lineLength / 3 / 2;


function Actor(x, y, width, height, strokeColor, fillColor) {
    this.elt = document.createElementNS('http://www.w3.org/2000/svg', 'rect');

    this.elt.setAttribute('x', x);
    this.elt.setAttribute('y', y);

    this.elt.setAttribute('width', width);
    this.elt.setAttribute('height', height);

    this.elt.style.stroke = strokeColor;
    this.elt.style.fill = fillColor;
}
Actor.prototype.setFillColor = function(color) {
    this.elt.style.fill = color;
}


function LineActor(x, y, orientation) {
    var width, height;

    if (orientation == 'vertical') {

        width = lineWidth;
        height = lineLength;
        x += 2.5 * lineWidth

    } else if (orientation === 'horizontal') {

        width = lineLength;
        height = lineWidth;
        y += 2.5 * lineWidth
    }

    // TODO: else throw.

    Actor.call(this, x, y, width, height, 'black', 'white');

}
LineActor.prototype = Object.create(Actor.prototype);
LineActor.prototype.setClicked = function(clickedBool) {
    this.clicked = clickedBool;
}
LineActor.prototype.getClicked = function() {
    return this.clicked;
}


function InnerBoxActor(x, y) {
    Actor.call(this, x, y, lineLength, lineLength, 'white', 'white');
}
InnerBoxActor.prototype = Object.create(Actor.prototype);
InnerBoxActor.prototype.setFilled = function(filledBool) {
    this.filled = filledBool;
}
InnerBoxActor.prototype.getFilled = function() {
    return this.filled;
}


function VertexActor(x, y) {
    Actor.call(this, x, y, lineLength, lineLength, 'black', 'black');
}
VertexActor.prototype = Object.create(Actor.prototype);


function ActorGrid(game, nRows, mColumns, boardWidth, boardHeight) {
    this.game = game;

    this.nRows = nRows;
    this.mColumns = mColumns;

    var lineGameElt = document.getElementById('line-game');

    this.elt = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    this.elt.setAttribute('width', boardWidth);
    this.elt.setAttribute('height', boardHeight);

    lineGameElt.appendChild(this.elt);

    this.actorsArray = this.createActorsArray(this.nRows, this.mColumns, boardWidth, boardHeight);

}
ActorGrid.prototype.createActorsArray = function(nRows, mColumns, boardWidth, boardHeight) {
    actorsArray = [];

    for (var i = 0; i < nRows * 2 + 1; i++) {
        var rowArray = [];

        for (var j = 0; j < mColumns * 2 + 1; j++) {
            var actor;

            if (i % 2 === 0) {
                if (j % 2 === 0) {
                    actor = new VertexActor(i * lineLength, j * lineLength);
                } else {
                    actor = new LineActor(i * lineLength, j * lineLength, 'vertical');

                    actorCallback = this.getActorCallback(actor);

                    actor.elt.addEventListener('click', actorCallback);
                }
            } else {
                if (j % 2 === 0) {
                    actor = new LineActor(i * lineLength, j * lineLength, 'horizontal');

                    actorCallback = this.getActorCallback(actor);

                    actor.elt.addEventListener('click', actorCallback);
                } else {
                    actor = new InnerBoxActor(i * lineLength, j * lineLength);
                }
            }

            this.elt.appendChild(actor.elt);

            rowArray.push(actor);
        }
        
        actorsArray.push(rowArray);
    }

    return actorsArray;
}
ActorGrid.prototype.getActorCallback = function(actor) {
    return function() {
        if (actor.getClicked()) {
            return;
        }
        actor.setFillColor(this.playerColor);
        actor.setClicked(true);

        this.bubbleUpActorClickEvent();
    }.bind(this);
}
ActorGrid.prototype.setPlayerColor = function(color) {
    this.playerColor = color;       
}
ActorGrid.prototype.bubbleUpActorClickEvent = function() {
   this.game.actorClicked();
}
ActorGrid.prototype.getUnfilledInnerBoxActorIndices = function() {
    var innerBoxActorIndices = [];

    for (var i = 0; i < this.actorsArray.length; i++) {
        for (var j = 0; j < this.actorsArray[i].length; j++) {
            if (!(this.actorsArray[i][j] instanceof InnerBoxActor)) {
                continue;
            }
            
            if (!this.actorsArray[i][j].getFilled()) {
                innerBoxActorIndices.push([i, j]);
            }
        }
    }

    return innerBoxActorIndices;
}
ActorGrid.prototype.getActor = function(x, y) {
    return this.actorsArray[x][y];
}
ActorGrid.prototype.countAndHighlightBoxes = function() {
    var innerBoxActorIndices = this.getUnfilledInnerBoxActorIndices();

    var boxCount = 0;

    for (var i = 0; i < innerBoxActorIndices.length; i++) {
        var x = innerBoxActorIndices[i][0];
        var y = innerBoxActorIndices[i][1];

        var neighbors = [
            this.getActor(x, y + 1),
            this.getActor(x - 1, y),
            this.getActor(x + 1, y),
            this.getActor(x, y - 1) 
        ];

        var boxFormed = neighbors.every(function(actor) {
            return actor.getClicked();
        });

        var innerBoxActor = this.getActor(x, y);
        if (boxFormed) {
            innerBoxActor.setFillColor(this.playerColor);
            innerBoxActor.setFilled(true);
            boxCount += 1;
        }
    }

    return boxCount;
}


function Player(color) {
    this.color = color;
    this.score = 0;
}
Player.prototype.getColor = function() {
    return this.color;
}


function ScoreBoard(playersArray) {
    this.playersArray = playersArray;

    var previousScoreboardElt = document.getElementById('score-board');

    if (previousScoreboardElt) {
        previousScoreboardElt.parentNode.removeChild(previousScoreboardElt);
    }

    this.elt = document.createElement('div');
    this.elt.id = 'score-board';
    
    this.drawContent();

    var lineGameElt = document.getElementById('line-game');
    lineGameElt.appendChild(this.elt);

}
ScoreBoard.prototype.drawContent = function() {
    while (this.elt.hasChildNodes()) {
        this.elt.removeChild(this.elt.lastChild);
    }

    for (var i = 0; i < this.playersArray.length; i++) {
        var playerInfo = document.createElement('div');

        playerInfo.textContent = this.playersArray[i].color + ': ' + this.playersArray[i].score;

        this.elt.appendChild(playerInfo)
    }
}
ScoreBoard.prototype.highlightPlayer = function(playerNumber) {
    for (var i = 0; i < this.elt.childNodes.length; i++) {
        this.elt.childNodes[i].style['background-color'] = 'white';
    }

    this.elt.childNodes[playerNumber].style['background-color'] = 'yellow';
}


function Game() {
    this.players = [new Player('red'), new Player('blue')];

    this.actorGrid = new ActorGrid(this, N_ROWS, M_COLUMNS, BOARD_WIDTH, BOARD_HEIGHT)

    this.scoreBoard = new ScoreBoard(this.players);

    this.currentPlayerIndex = 0;
    this.togglePlayerTurn();
}
Game.prototype.getCurrentPlayer = function() {
    return this.players[this.currentPlayerIndex];
}
Game.prototype.togglePlayerTurn = function() {
    this.currentPlayerIndex = this.currentPlayerIndex ? 0 : 1;

    this.scoreBoard.highlightPlayer(this.currentPlayerIndex);
    
    this.actorGrid.setPlayerColor(this.getCurrentPlayer().getColor());

}
Game.prototype.actorClicked = function() {
    var numBoxes = this.actorGrid.countAndHighlightBoxes();

    if (numBoxes) {
        console.log(this.getCurrentPlayer().getColor() + ' go again!');

        this.players[this.currentPlayerIndex].score += numBoxes;
        this.scoreBoard.drawContent();
        this.scoreBoard.highlightPlayer(this.currentPlayerIndex);
    } else {
        this.togglePlayerTurn();
    }
}


var game = new Game();

