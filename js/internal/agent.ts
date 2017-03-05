/// <reference path="sprite.ts"/>
declare var $V:any;
declare var $ : any;

"use strict";
class Stopwatch{

  private _time : number;
  private _startTime : number;
  private _done : boolean;

  constructor(time : number){
    this._time = time;
    this._startTime = time;
    this._done = false;
  }
  public done(){ return this._done;}
  public reset(){ this._time = this._startTime; this._done = false;}
  public update(deltaTime){
    if(this._time > 0)
      this._time -= deltaTime;
    else this._done = true;
  }
}

class Agent{

  public _goalPosition : any;

  private _position : any;
  private _velocity : any;
  private _acceleration : any;
  private _mass : number;
  private _brainType : string;
  private _totalReward : number;
  private _sprite : any;
  private _currentSquare : number;
  private _iteration : number;
  private _numOfMoves : number;
  private _travelTimer : Stopwatch;
  private _autoMove : boolean;
  private _nextMove : string;
  private _envSize : number;
  private _HUD : boolean;

  private _prev_pos_error : any;
  private _pos_integral : any;

  constructor(){
    this._position = Environment._squares[15]._center;
    this._velocity = $V([0, 0]);
    this._acceleration = $V([0, 0]);
    this._mass = 0.8;
    this._brainType = "stupid";
    this._totalReward = 0.0;
    this._sprite = new Sprite("textures/test.png");
    this._goalPosition = this._position;
    this._currentSquare = 15;
    this._numOfMoves = 0;
    this._iteration = 0;
    this._travelTimer = new Stopwatch(1.7);
    this._autoMove = false;
    this._nextMove = ""
    this._envSize = Math.sqrt(Environment._squares.length);
    this._HUD = true;

    this._prev_pos_error = $V([0,0]);
    this._pos_integral = $V([0,0]);

    this.updateInfo();
    window.addEventListener( 'keydown', this.onKeyDown, false );
    window.addEventListener( 'mousedown', this.onMouseDown, false );
  }

  // ========================================
  // =============== INPUT ==================
  // ========================================
  onMouseDown = (e) => {
    switch (e.target.value) {
      case "Reset":
        this.reset(15);
      break;

      case "Auto":
        this.toggleAutoMove();

      break;

      case "HUD":
        this.toggleHUD();
      break;

      case "Stupid":
        this.setBrain("stupid");
        break;

      case "Simple":
        this.setBrain("simple");
      break;

    default:
  }


  }
  onKeyDown = (e) => {
    if (e) {
      switch (e.keyCode) {
        case 37:
        case 65:
          this.moveLeft();
          this._nextMove = "left";
          break;
        case 38:
        case 87:
          this.moveUp();
          this._nextMove = "up";
          break;
        case 39:
        case 68:
          this.moveRight();
          this._nextMove = "right";
          break;
        case 40:
        case 83:
          this.moveDown();
          this._nextMove = "down";
          break;
        case 82:
          this.reset(15);
          this._nextMove = "";
          break;

          case 72:
            this.toggleHUD();
            break;
        default:
      }
    }
  }

  // ========================================
  // =============== BRAIN ==================
  // ========================================
  private toggleAutoMove() : void{
    this._autoMove = !this._autoMove;
    var autoMoveChecker = document.getElementById('autoMoveChecker');
    this.toggleCheckColor(autoMoveChecker, this._autoMove);
  }

  private setBrain(type : string) : void{
    this._brainType = type;
  }

  private thinkStupid() : void{
    // Randomize direction
    var num = Math.floor(Math.random() * 4); // random 0 - 3
    switch(num){
      case 0 : this._nextMove = "left"; break;
      case 1 : this._nextMove = "up"; break;
      case 2 : this._nextMove = "right"; break;
      case 3 : this._nextMove = "down"; break;
    }
  }

  private thinkSimple() : void{

    this._nextMove = "";
    while(this._nextMove == ""){

      // Randomize direction
      var num = Math.floor(Math.random() * 4); // random 0 - 3
      switch(num){
        case 0 : // left
          if(this.outerWallCheck("left")){
            var type = Environment._squares[this.getLeftId()].getType();
            if(type != "wall" && type != "red") this._nextMove = "left";
          }
          break;

        case 1 : // up
          if(this.outerWallCheck("up")){
            var type = Environment._squares[this.getUpId()].getType();
            if(type != "wall" && type != "red") this._nextMove = "up";
          }
          break;

        case 2 : // right
          if(this.outerWallCheck("right")){
            var type = Environment._squares[this.getRightId()].getType();
            if(type != "wall" && type != "red") this._nextMove = "right";
          }
          break;

        case 3 : // down
          if(this.outerWallCheck("down")){
            var type = Environment._squares[this.getDownId()].getType();
            if(type != "wall" && type != "red") this._nextMove = "down";
          }
          break;
      }
    }
  }


  // ========================================
  // ============= MAIN LOOP ================
  // ========================================
  public update(deltaTime) : void{

    this._travelTimer.update(deltaTime);

    if(this._travelTimer.done()){


      if(this._autoMove){

        // calculating path...
        // ...

        switch(this._brainType){
          case "stupid" : this.thinkStupid(); break;
          case "simple" : this.thinkSimple(); break;
          case "average" :  break;
          case "valueIteration" :  break;
          case "policyIteration" :  break;
        }
        // ...

        switch(this._nextMove){
          case "left" : this.moveLeft(); break;
          case "up" : this.moveUp(); break;
          case "right" : this.moveRight(); break;
          case "down" : this.moveDown(); break;
        }
      }

      this._travelTimer.reset();
    }else{
      // moving...
      this.moveTowardsGoal(deltaTime);
      this.updateSprite();
    }
  }

  // ========================================
  // =============== RESET ==================
  // ========================================
  public reset(start) : void{
    this.setGoal(start, this._currentSquare);
    this._numOfMoves=0;
    this._currentSquare = start;
    this._iteration = 0;
    this._totalReward = 0;
    this._nextMove = "";

    for(var i = 0; i < Environment._squares.length; i++){
      Environment._squares[i].setUtility(0);
    }

    this.updateGridPosInfo();
    this.clearHistory();

  }


  // ========================================
  // ============= UI MANAGER ===============
  // ========================================
  private toggleCheckColor(element, value){
    if(value){
      $(element).css("border-left", "10px solid RGBA(100,140,100,1)");
    }else{
      $(element).css("border-left", "10px solid RGBA(140,100,100,1)");
    }
  }

  private toggleHUD() : void{
    $("#HUD").fadeToggle(300, null);
    this._HUD = !this._HUD;
    this.toggleCheckColor(document.getElementById("HUDToggle"), this._HUD);
  }

  private getInfoString() : string{

    var pos = this.getGridPos().elements;
    return '<p class= "' + Environment._squares[this._currentSquare].getType() + ' history-text"' +
      '>' +  this._numOfMoves +
      ' | ' +  '(' +  pos[0] + ',' + pos[1] + ')' +
      ' | ' + Math.round(Environment._squares[this._currentSquare].getReward() * 100) / 100 +
      ' | ' + Math.round(this._totalReward * 100) / 100 +
      '</p>'
  }

  private updateGridPosInfo() : void{
    var agentPosDiv =   document.getElementById('agent-pos');
    agentPosDiv.innerHTML = this.getInfoString();
    agentPosDiv.className = Environment._squares[this._currentSquare].getType();
  }
  private updateHistoryInfo() : void{
    var agentHistoryDiv = document.getElementById('agent-history');
    agentHistoryDiv.innerHTML = this.getInfoString() + agentHistoryDiv.innerHTML;
  }

  private clearHistory(){
    document.getElementById('agent-history').innerText = "";
  }

  private updateInfo() : void{
    this.updateGridPosInfo();
    this.updateHistoryInfo();
  }

  // ========================================
  // =============== SENSORS ================
  // ========================================
  private getLeftId() : number{ return this._currentSquare - this._envSize; };
  private getUpId() : number{ return this._currentSquare - 1; };
  private getRightId() : number{ return this._currentSquare + this._envSize; };
  private getDownId() : number{ return this._currentSquare + 1; };

  private outerWallCheck(direction : string) : boolean{
    switch(direction){
      case "left" : return this._currentSquare > this._envSize-1;
      case "up" : return this._currentSquare % this._envSize != 0;
      case "right" : return this._currentSquare < Environment._squares.length - this._envSize;
      case "down" : return (this._currentSquare+1) % this._envSize != 0;
    }
  }

  private moveLeft() : void{
    if(this.outerWallCheck("left")){
      var temp : number = this.getLeftId();
      this.innerWallCheck(temp, this._currentSquare);
    }
    else
      this.hitWall();
  }
  private moveUp() : void{
    if(this.outerWallCheck("up")){
      var temp : number = this.getUpId();
      this.innerWallCheck(temp, this._currentSquare);
    }
    else
      this.hitWall();
  }
  private moveRight() : void{
    if(this.outerWallCheck("right")){
      var temp : number = this.getRightId();
      this.innerWallCheck(temp, this._currentSquare);
    }
    else
      this.hitWall();
  }
  private moveDown() : void{
    if(this.outerWallCheck("down")){
      var temp : number = this.getDownId();
      this.innerWallCheck(temp, this._currentSquare);
    }
    else
      this.hitWall();
  }
  private setGoal(goal, prev) : void{
    this._travelTimer.reset(); // Start moving
    this._currentSquare = goal;
    Environment._squares[goal].enterSquare();
    Environment._squares[prev].leaveSquare();
    this._goalPosition = Environment._squares[this._currentSquare]._center;
    this._totalReward += Environment._squares[this._currentSquare].getReward();
    this._numOfMoves++;
    this.updateInfo();
  }

  private hitWall() : void{
    Environment._background.hitWall();
    var agentHistoryDiv = document.getElementById('agent-history');
    agentHistoryDiv.innerHTML = '- wall -' + '<br>' + agentHistoryDiv.innerHTML;
  }

  private hitInnerWall(wall) : void{
    Environment._squares[wall].hitWall();
    var agentHistoryDiv = document.getElementById('agent-history');
    agentHistoryDiv.innerHTML = '- wall -' + '<br>' + agentHistoryDiv.innerHTML;
  }
  private innerWallCheck(temp, prev) : void{
    if(Environment._squares[temp].getType() != "wall")
      this.setGoal(temp, prev);
    else this.hitInnerWall(temp);
  }
  private getGridPos() : any{
    var size = Math.sqrt(Environment._squares.length)
    var xPos : number = Math.floor(this._currentSquare/size);
    var yPos : number = this._currentSquare % 6;
    return $V([xPos,yPos]);
  }

  // ========================================
  // =========== PHYSICAL ENGINE ============
  // ========================================
  private moveTowardsGoal(deltaTime) : void{
    // PID, the I is silent
    var kP : number = .0004;
    var kI : number = .0;
    var kD : number = .7;

    var pos_error = this._goalPosition.add(this._position.multiply(-1));
    this._pos_integral = this._pos_integral.add(pos_error.multiply(deltaTime));
    var pos_derivative = pos_error.add(this._prev_pos_error.multiply(-1)).multiply(1.0/deltaTime);

    var pos_adjustment = pos_error.multiply(kP).add(pos_derivative.multiply(kD)).add(this._pos_integral.multiply(kI));
    this._prev_pos_error = pos_error;
    this.addForce(pos_adjustment, deltaTime);
  }

  private addForce(force, deltaTime): void{

    // f = ma, a = f/m
    this._acceleration = force.multiply(1.0/this._mass);
    // v = v + a*t
    this._velocity = this._velocity.add(this._acceleration.multiply(deltaTime));
    // p = p + v*t
    this._position = this._position.add(this._velocity.multiply(deltaTime));

  }

  private updateSprite() : void{
    this._sprite.setPosition(this._position.elements[0], this._position.elements[1]);
  }

}
