/// <reference path="sprite.ts"/>
/// <reference path="stopwatch.ts"/>

declare var $V:any;
declare var $ : any;

"use strict";


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
    this._mass = 0.3;
    this._brainType = "";
    this._totalReward = 0.0;
    this._sprite = new Sprite("textures/test.png");
    this._goalPosition = this._position;
    this._currentSquare = 15;
    this._numOfMoves = 0;
    this._iteration = 0;
    this._travelTimer = new Stopwatch(0.5);
    this._autoMove = false;
    this._nextMove = ""
    this._envSize = Math.sqrt(Environment._squares.length);
    this._HUD = true;

    this._prev_pos_error = $V([0,0]);
    this._pos_integral = $V([0,0]);

    this.updateInfo();
    window.addEventListener( 'keydown', this.onKeyDown, false );
    window.addEventListener( 'mousedown', this.onMouseDown, false );

    // init
    this.setBrain("simple");

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

      case "SpeedUp":
        this.multiplySpeed(1.2);
      break;

      case "SpeedDown":
        this.multiplySpeed(0.8);
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
          this._nextMove = "left";
          this.moveLeft();
          break;
        case 38:
        case 87:
          this._nextMove = "up";
          this.moveUp();
          break;
        case 39:
        case 68:
          this._nextMove = "right";
          this.moveRight();
          break;
        case 40:
        case 83:
          this._nextMove = "down";
          this.moveDown();
          break;
        case 82:
          this.reset(15);
          this._nextMove = "";
          break;
        case 72:
          this.toggleHUD();
          break;
        case 32:
          this.toggleAutoMove();
          break;
        case 188:
          this.multiplySpeed(0.8);
          break;
        case 190:
          this.multiplySpeed(1.2);
          break;
        case 49:
          this.setBrain("stupid");
          break;
        case 50:
          this.setBrain("simple");
          break;
        case 51:
          this.setBrain("smart");
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
    $('.fa-play').toggleClass('fa-pause');
  }

  private setBrain(type : string) : void{
    this.setBrainSelected(type, this._brainType);
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

    this.updateCurrentStatusInfo();
    this.clearHistory();
    Environment.setMap("standard");


  }

  // ========================================
  // ============= UI MANAGER ===============
  // ========================================
  private setBrainSelected(current_id, prev_id){
    var current = document.getElementById(current_id);
    var prev = document.getElementById(prev_id);
    $(prev).css("opacity", "0.5");
    $(prev).css("color", " RGBA(120,120,120,1)");

    $(current).css("opacity", "1.0");
    $(current).css("color", "white");
  }

  private toggleHUD() : void{
    $("#HUD").fadeToggle(300, null);
    this._HUD = !this._HUD;
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

  private updateCurrentStatusInfo() : void{
    var pos = this.getGridPos().elements;

    var agentCurrentStatusDiv =   document.getElementById('agent-current-status');

    var agentNMovesDiv =   document.getElementById('agent-n-moves');
    var agentPosDiv =   document.getElementById('agent-pos');
    var agentRewardDiv =   document.getElementById('agent-reward');
    var agentTotRewardDiv =   document.getElementById('agent-tot-reward');

    agentNMovesDiv.innerHTML = '' + this._numOfMoves;
    agentPosDiv.innerHTML = '(' +  pos[0] + ',' + pos[1] + ')';
    agentRewardDiv.innerHTML = '' + Math.round(Environment._squares[this._currentSquare].getReward() * 100) / 100;
    agentTotRewardDiv.innerHTML = '' + Math.round(this._totalReward * 100) / 100;

    //Change Color
    agentCurrentStatusDiv.className = Environment._squares[this._currentSquare].getType();
  }
  private updateHistoryInfo() : void{
    var agentHistoryDiv = document.getElementById('agent-history');
    agentHistoryDiv.innerHTML = this.getInfoString() + agentHistoryDiv.innerHTML.substring(0,2000);
  }

  private clearHistory(){
    document.getElementById('agent-history').innerText = "";
  }

  private updateInfo() : void{
    this.updateCurrentStatusInfo();
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
    else{
      this.bumpTowards("left");
      this.hitWall();
    }
  }
  private moveUp() : void{
    if(this.outerWallCheck("up")){
      var temp : number = this.getUpId();
      this.innerWallCheck(temp, this._currentSquare);
    }
    else{
      this.hitWall();
      this.bumpTowards("up");
    }
  }
  private moveRight() : void{
    if(this.outerWallCheck("right")){
      var temp : number = this.getRightId();
      this.innerWallCheck(temp, this._currentSquare);
    }
    else{
      this.hitWall();
      this.bumpTowards("right");
    }
  }
  private moveDown() : void{
    if(this.outerWallCheck("down")){
      var temp : number = this.getDownId();
      this.innerWallCheck(temp, this._currentSquare);
    }
    else{
      this.hitWall();
      this.bumpTowards("down");
    }
  }
  private setGoal(goal, prev) : void{
    this._travelTimer.reset(); // Start moving
    this._currentSquare = goal;
    this._goalPosition = Environment._squares[this._currentSquare]._center;
    Environment._squares[goal].enterSquare();
    this._totalReward += Environment._squares[this._currentSquare].getReward();
    Environment._squares[prev].leaveSquare();
    this._numOfMoves++;
    this.updateInfo();

    if(Environment._squares[goal].getType() != "start"){
      Environment._squares[goal].setType("neutral", Environment._theme);
    }
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
    else{
      this.hitInnerWall(temp);
      this.bumpTowards(this._nextMove);
    }
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
  private multiplySpeed(factor : number) : void{
    var newTime = this._travelTimer.getStartTime() * (1/factor);
    this._travelTimer.setStartTime(newTime);
  }

  private bumpTowards(direction : string){
    var bump = 30;
    switch(direction){
      case "left" : this._position.elements[0] -= bump; break;
      case "up" : this._position.elements[1] -= bump;  break;
      case "right" : this._position.elements[0] += bump; break;
      case "down" : this._position.elements[1] += bump; break;
    }
  }

  private moveTowardsGoal(deltaTime) : void{
    // PID, the I is silent
    var kP : number = .0004;
    var kI : number = .0;
    var kD : number = 0.5;

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
