/// <reference path="square.ts"/>
/// <reference path="agent.ts"/>

class Environment{

  private _agent : Agent;
  static _theme : string;
  static _squares : Square[];
  static _background : Square;
  static _backdrop1 : Square;
  static _backdrop2 : Square;

  constructor(){
    Environment._theme = "night";
    this.createGrid(6, 6, 427);
    this._agent = new Agent();
  }

  public update(deltaTime){
    this._agent.update(deltaTime);
    Environment._background.update(deltaTime);

    for(var i = 0; i < Environment._squares.length; i++){
        Environment._squares[i].update(deltaTime);
    }
  }

  static setMap(type : string){
    if(type == "standard"){
      Environment._squares[15].setType("start", Environment._theme);

      Environment._squares[0].setType("green", Environment._theme);
      Environment._squares[12].setType("green", Environment._theme);
      Environment._squares[30].setType("green", Environment._theme);
      Environment._squares[19].setType("green", Environment._theme);
      Environment._squares[26].setType("green", Environment._theme);
      Environment._squares[33].setType("green", Environment._theme);

      Environment._squares[7].setType("red", Environment._theme);
      Environment._squares[31].setType("red", Environment._theme);
      Environment._squares[14].setType("red", Environment._theme);
      Environment._squares[21].setType("red", Environment._theme);
      Environment._squares[28].setType("red", Environment._theme);

      Environment._squares[6].setType("wall", Environment._theme);
      Environment._squares[25].setType("wall", Environment._theme);
      Environment._squares[10].setType("wall", Environment._theme);
      Environment._squares[16].setType("wall", Environment._theme);
      Environment._squares[22].setType("wall", Environment._theme);
    }
  }


  private createGrid(X,Y, envSize){
    Environment._squares = [];
    var xStart = 160;
    var yStart = 100;
    var margin = 1;
    var squareSize = envSize/X - margin;

    var bg_margin = 20;
    var backdrop_radius = 5;
    var square_radius = 1;
    Environment._backdrop1 = new Square($V([xStart-bg_margin, yStart-bg_margin]),
      "wallhit", X*(squareSize+margin) + 2*bg_margin, backdrop_radius);
    Environment._backdrop1.setType("wallhit", Environment._theme);

    // Wall backdrop
    Environment._background = new Square($V([xStart-bg_margin, yStart-bg_margin]),
      "wall", X*(squareSize+margin) + 2*bg_margin, backdrop_radius);
      Environment._background.setType("wall", Environment._theme);

    // Red backdrop
    Environment._backdrop2 = new Square($V([xStart, yStart]),
      "wallhit", X*(squareSize), backdrop_radius);
    Environment._backdrop2.setType("wallhit", Environment._theme);

    for(var i = 0; i < X; i++){
      for(var j = 0; j < Y; j++){
        Environment._squares.push(new Square($V([xStart + (squareSize + margin)*i,
          yStart + (squareSize + margin)*j]), "neutral", squareSize, square_radius));
          Environment._squares[j + X*i].setType("neutral", Environment._theme);
      }
    }
    Environment.setMap("standard");
  }
}
