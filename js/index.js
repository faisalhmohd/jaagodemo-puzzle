/**  FamousJS Puzzle Game (Work In Progress)
 *   Author: Farias Maiquita http://farias.gotolab.co
 *   Last Nodified: March 1st 2016
 */

'use strict';

// Famous dependencies

var FamousEngine = famous.core.FamousEngine,
    Node = famous.core.Node,
    Rotation = famous.components.Rotation,
    Scale = famous.components.Scale,
    DOMElement = famous.domRenderables.DOMElement,
    Boardpieces = [];


// Puzzle App Module

function PuzzleApp() {
    Node.call(this);
    this.el = new DOMElement(this, {tagName: 'puzzle-app'});
    this.roundData = {
        counter: 1,
        piecesPerRow: 4//_randomIntBetween(2, 4)
    };
    this.board = this.addChild(new Board(this.roundData.piecesPerRow));
    this.boardMaxWidth = 800;
    this.resizeChildren();
}

PuzzleApp.prototype = Object.create(Node.prototype);

PuzzleApp.prototype.resizeChildren = function ()  {
    var boardWidth = window.innerWidth > window.innerHeight ?
        window.innerHeight : window.innerWidth;
    boardWidth = boardWidth > this.boardMaxWidth ?
        this.boardMaxWidth : boardWidth;
    this.board.resizeChildren(boardWidth);
}

PuzzleApp.prototype.onReceive = function(e, payload) {
    if ((e === 'click') && (payload.node.constructor === Piece)) {
      Board.prototype.rotateAll();
      $(".caption").fadeOut();
    }
}.bind(this);


// Board Module

function Board(piecesPerRow) {
    Node.call(this);
    this.setSizeMode(1, 1);
    this.setAlign(0.5, 0.5);
    this.setMountPoint(0.5, 0.5)
    this.setOrigin(0.5, 0.5);
    this.piecesPerRow = piecesPerRow;
    this.el = new DOMElement(this, {tagName: 'board'});
    this.pieces = [];
    this.setupRound(piecesPerRow);

}

Board.prototype = Object.create(Node.prototype);

Board.prototype.resizeChildren = function (boardWidth) {
    this.setAbsoluteSize(boardWidth, boardWidth);
    var totalPieces = this.piecesPerRow * this.piecesPerRow;
    for (var i = 0; i < totalPieces; i++) {
        this.pieces[i].repositionNode(boardWidth);
    }
}

Board.prototype.setupRound = function (piecesPerRow) {
    this.piecesPerRow = piecesPerRow;
    this.pieces = [];
    var imageUrl = 'http://i.imgur.com/WDIl2m5.jpg';
    for (var y = 0; y < piecesPerRow; y++) {
        for (var x = 0; x < piecesPerRow; x++) {
            this.pieces.push(this.addChild(new Piece(imageUrl, {
                xIndex: x,
                yIndex: y,
                maxXYIndex: piecesPerRow - 1,
                angleIndex: _randomIntBetween(0, 3) / 2
            })));
        }
    }
    Boardpieces = this.pieces;
}

Board.prototype.rotateAll = function () {
  for (var y = 0; y < Boardpieces.length; y++) {
      Boardpieces[y].rotateSolve();
    }
}



// Piece Module

function Piece(imageUrl, indexData) {
    Node.call(this);
    this.proportion = 1 / (indexData.maxXYIndex + 1);
    this.setProportionalSize(this.proportion, this.proportion);
    this.setOrigin(0.5, 0.5);
    this.setRotation(0, 0, Math.PI * indexData.angleIndex);
    this.inMotion = false;
    this.indexData = indexData;
    this.el = new DOMElement(this, {
        tagName: 'piece',
        properties: {
            backgroundImage: 'url(' + imageUrl + ')',
            backgroundSize: 100 / this.proportion + '%'
        }
    });
    this.setImagePosition(indexData);
    this.addUIEvent('click');
}

Piece.prototype = Object.create(Node.prototype);
Piece.prototype.constructor = Piece;

Piece.prototype.setImagePosition = function (indexData) {
    var positionX = 100 * indexData.xIndex / indexData.maxXYIndex + '%',
        positionY = 100 * indexData.yIndex / indexData.maxXYIndex + '%';
    this.el.setProperty('backgroundPosition', positionX + ' ' + positionY);
}

Piece.prototype.repositionNode = function (boardWidth) {
    var xPosition = boardWidth * this.proportion * this.indexData.xIndex,
        yPosition = boardWidth * this.proportion * this.indexData.yIndex;
    this.setPosition(xPosition, yPosition);
}

Piece.prototype.rotateSolve = function () {
  var duration = 500;
    if (!this.inMotion) {
        this.inMotion = true;
        this.el.addClass('in-motion');
        var rotation = new Rotation(this),
            scale = new Scale(this),
            node = this;
        rotation.set(0, 0, 0, {
            duration: duration,
            curve: 'easeInOut'
        }, function () {
            node.inMotion = false;
            node.el.removeClass('in-motion');
        });
        scale.set(1.2, 1.2, 1, {
            duration: duration,
            curve: 'easeIn'
        }, function () {
            scale.set(1, 1, 1, {
                duration: duration,
                curve: 'easeOut'
            });
        });
    }
}


// Helper Module

function _randomIntBetween(minInt, maxInt) {
    return Math.floor((Math.random() * (maxInt - minInt + 1)) + minInt);
}


// Main Module

function initApp() {
    FamousEngine.init();
    var puzzleApp = FamousEngine.createScene().addChild(new PuzzleApp());
    window.onresize = function () {
        puzzleApp.resizeChildren();
    }
}

initApp();
