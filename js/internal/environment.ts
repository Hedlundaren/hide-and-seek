/// <reference path="square.ts"/>
/// <reference path="agent.ts"/>

class Environment{

  private _agent : Agent;
  static _squares : Square[];
  static _background : Square;
  constructor(){
    this.createGrid(6, 6);
    this._agent = new Agent();
  }

  public update(deltaTime){
    this._agent.update(deltaTime);
    Environment._background.update(deltaTime);

    for(var i = 0; i < Environment._squares.length; i++){
        Environment._squares[i].update(deltaTime);
    }
  }

  private createGrid(X,Y){
    Environment._squares = [];
    var xStart = 200;
    var yStart = 100;
    var squareSize = 80;
    var margin = 1;

    var bg_margin = 20;

    var backdrop1 = new Square($V([xStart-bg_margin, yStart-bg_margin]),
      "wallhit", X*(squareSize+margin) + 2*bg_margin);
    backdrop1.setType("wallhit");

    Environment._background = new Square($V([xStart-bg_margin, yStart-bg_margin]),
      "wall", X*(squareSize+margin) + 2*bg_margin);
      Environment._background.setType("wall");

    var backdrop2 = new Square($V([xStart, yStart]),
      "wallhit", X*(squareSize+margin));
    backdrop2.setType("wallhit");

    for(var i = 0; i < X; i++){
      for(var j = 0; j < Y; j++){
        Environment._squares.push(new Square($V([xStart + (squareSize + margin)*i,
          yStart + (squareSize + margin)*j]), "neutral", squareSize));
      }
    }

    Environment._squares[15].setType("start");

    Environment._squares[0].setType("green");
    Environment._squares[12].setType("green");
    Environment._squares[30].setType("green");
    Environment._squares[19].setType("green");
    Environment._squares[26].setType("green");
    Environment._squares[33].setType("green");

    Environment._squares[7].setType("red");
    Environment._squares[31].setType("red");
    Environment._squares[14].setType("red");
    Environment._squares[21].setType("red");
    Environment._squares[28].setType("red");

    Environment._squares[6].setType("wall");
    Environment._squares[25].setType("wall");
    Environment._squares[10].setType("wall");
    Environment._squares[16].setType("wall");
    Environment._squares[22].setType("wall");
  }
}
