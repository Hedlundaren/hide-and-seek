/// <reference path="square.ts"/>
/// <reference path="agent.ts"/>

class Environment{

  private _agent : Agent;
  static _theme : string;
  static _start : number;
  static _mapType : string;
  static _sideLength : number;
  static _squares : Square[];

  static _background : Square;
  static _backdrop1 : Square;
  static _backdrop2 : Square;

  constructor(side : number, start : number){
    Environment._theme = "night";
    Environment._mapType = "random";
    Environment._sideLength = side;
    Environment._start = start;
    this.createGrid(Environment._sideLength, Environment._sideLength, 500);
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
      Environment._squares[Environment._start].setType("start");

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
    else if(type == "random"){
      Environment._squares[Environment._start].setType("start");

      for(var i = 0; i < Environment._squares.length; i++){
        if(i != Environment._start){
          var num = Math.floor(Math.random() * 36);
          switch(true){
            case num < 4 : Environment._squares[i].setType("wall"); break; // chance for wall : 4/36
            case (num > 3 && num < 9) : Environment._squares[i].setType("red"); break; // chance for red : 5/36
            case (num > 8 && num < 15) : Environment._squares[i].setType("green"); break; // chance for green : 6/36
            default: Environment._squares[i].setType("neutral");
          }
        }
      }
    }
  }

  private createGrid(X,Y, envSize){
    Environment._squares = [];
    var xStart = 20;
    var yStart = 20;
    var margin = 1;
    var squareSize = envSize/X - margin;

    var bg_margin = 20;
    var backdrop_radius = 5;
    var square_radius = 1;
    Environment._backdrop1 = new Square($V([xStart-bg_margin, yStart-bg_margin]), -1,
      "wallhit", X*(squareSize+margin) + 2*bg_margin, backdrop_radius);
    Environment._backdrop1.setType("wallhit");
    Environment._backdrop1.create();

    // Wall backdrop
    Environment._background = new Square($V([xStart-bg_margin, yStart-bg_margin]), -1,
      "wall", X*(squareSize+margin) + 2*bg_margin, backdrop_radius);
      Environment._background.setType("wall");
    Environment._background.create();

    // Red backdrop
    Environment._backdrop2 = new Square($V([xStart, yStart]), -1,
      "wallhit", X*(squareSize), backdrop_radius);
    Environment._backdrop2.setType("wallhit");
    Environment._backdrop2.create();

    for(var i = 0; i < X; i++){
      for(var j = 0; j < Y; j++){
        Environment._squares.push(new Square($V([xStart + (squareSize + margin)*i,
          yStart + (squareSize + margin)*j]), j + i*X,"neutral", squareSize, square_radius));
          Environment._squares[j + X*i].setType("neutral");
        Environment._squares[j + i*X].create();
      }
    }
    Environment.setMap(Environment._mapType);
  }
}
