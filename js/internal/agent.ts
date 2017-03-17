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
  private _fast : boolean;
  private _brain : Brain;
  private _totalReward : number;
  private _sprite : any;
  public _currentSquare : number;
  private _iteration : number;
  private _numOfMoves : number;
  private _travelTimer : Stopwatch;
  private _autoMove : boolean;
  public _nextMove : string;
  private _HUD : boolean;
  public UPDATE_SQUARES : boolean;

  private _prev_pos_error : any;
  private _pos_integral : any;

  constructor(){
    this._position = Environment._squares[15]._center;
    this._velocity = $V([0, 0]);
    this._acceleration = $V([0, 0]);
    this._mass = 0.3;
    this._fast = true;
    this._brain = new Brain(this, "");
    this._totalReward = 0.0;
    this._sprite = new Sprite("textures/AI.png");
    this._goalPosition = this._position;
    this._currentSquare = 15;
    this._numOfMoves = 0;
    this._iteration = 0;
    this._travelTimer = new Stopwatch(0.1);
    this._autoMove = false;
    this._nextMove = "";
    this._HUD = false;
    this.UPDATE_SQUARES = false;

    this._prev_pos_error = $V([0,0]);
    this._pos_integral = $V([0,0]);

    this.updateInfo();
    window.addEventListener( 'keydown', this.onKeyDown, false );
    window.addEventListener( 'mousedown', this.onMouseDown, false );

    // init
    this._brain.setBrain("value");
    $('.fa-rocket').toggleClass('fa-blind');


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

      case "Speed":
        this.toggleSpeed();
      break;

      case "HUD":
        this.toggleHUD();
      break;

      case "Stupid":
        this._brain.setBrain("stupid");
        break;

      case "Simple":
        this._brain.setBrain("simple");
      break;

      case "Forward":
        this._brain.setBrain("forward");
      break;

      case "Careful":
        this._brain.setBrain("careful");
      break;

      case "Value":
        this._brain.setBrain("value");
      break;

      case "Policy":
        this._brain.setBrain("policy");
      break;

      case "Random Map":
        var current = document.getElementById("random_map");
        if(Environment._mapType != "standard"){
          Environment._mapType = "standard";
          $(current).css("border-left", "7px solid RGBA(240,140,140,1)");
        }else{
          $(current).css("border-left", "7px solid RGBA(140,240,140,1)");
          Environment._mapType = "random";
        }
        this.reset(15);
      break;

      case "Update Squares":
        this.UPDATE_SQUARES = !this.UPDATE_SQUARES;

        var current = document.getElementById("update_squares");
        if(this.UPDATE_SQUARES){
          $(current).css("border-left", "7px solid RGBA(140,240,140,1)");
        }else{
          $(current).css("border-left", "7px solid RGBA(240,140,140,1)");
        }
      break;
    default:
  }


  }
  onKeyDown = (e) => {
    if (e) {
      //console.log(e);
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
        case 81:
          this.toggleSpeed();
          break;
        case 49:
          this._brain.setBrain("stupid");
          break;
        case 50:
          this._brain.setBrain("simple");
          break;
        case 51:
          this._brain.setBrain("forward");
          break;
          case 52:
            this._brain.setBrain("careful");
            break;
          case 53:
            this._brain.setBrain("value");
            break;
          case 54:
            this._brain.setBrain("policy");
            break;
        default:
      }
    }
  }

  // ========================================
  // =============== BRAIN ==================
  // ========================================

  public setMove(direction : string){
    this._nextMove = direction;
  }

  public getMove(){
    return this._nextMove;
  }

  public toggleAutoMove() : void{
    this._autoMove = !this._autoMove;
    $('.fa-play').toggleClass('fa-pause');
  }


  // ========================================
  // ============= MAIN LOOP ================
  // ========================================
  public update(deltaTime) : void{

    this._travelTimer.update(deltaTime);

    if(this._travelTimer.done()){

      if(this._autoMove){

        // think...
        this._brain.think();

        // move...
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
    this._brain.reset();

    for(var i = 0; i < Environment._squares.length; i++){
      Environment._squares[i].setUtility(0);
    }

    this.updateCurrentStatusInfo();
    this.clearHistory();
    Environment.setMap(Environment._mapType);


  }

  // ========================================
  // ============= UI MANAGER ===============
  // ========================================
  public setBrainSelected(current_id, prev_id){
    var current = document.getElementById(current_id);
    var prev = document.getElementById(prev_id);
    $(prev).css("opacity", "0.5");
    $(prev).css("color", " RGBA(120,120,120,1)");
    $(prev).css("box-shadow", "0px 0px 0px #888888");

    $(current).css("opacity", "1.0");
    $(current).css("color", "RGBA(200,200,200,1)");
    $(current).css("box-shadow", "3px 2px 3px RGBA(100,100,100,0.5)");
  }

  private toggleHUD() : void{
    var fadeSpeed = 300;
    if(this._HUD){
      $("#agent-current-status").fadeTo( fadeSpeed, 0.0 )
      $("#agent-history-holder").fadeTo( fadeSpeed, 0.0 )
    }else{
      $("#agent-current-status").fadeTo( fadeSpeed, 1 )
      $("#agent-history-holder").fadeTo( fadeSpeed, 1 )
    }
    this._HUD = !this._HUD;


  }

  private getInfoString() : string{

    var pos = this.getGridPos().elements;
    return '<p class= "' + Environment._squares[this._currentSquare].getType() + ' history-text"' +
      '>' +  this._numOfMoves +
      ' | ' +  '(' +  pos[0] + ',' + pos[1] + ')' +
      ' | ' + Math.round(Environment._squares[this._currentSquare].getUtility() * 100) / 100 +
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
    agentRewardDiv.innerHTML = '' + Math.round(Environment._squares[this._currentSquare].getUtility() * 100) / 100;
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
  public getLeftId() : number{ return this._currentSquare - Environment._sideLength; };
  public getUpId() : number{ return this._currentSquare - 1; };
  public getRightId() : number{ return this._currentSquare + Environment._sideLength; };
  public getDownId() : number{ return this._currentSquare + 1; };

  public outerWallCheck(direction : string) : boolean{
    switch(direction){
      case "left" : return this._currentSquare > Environment._sideLength-1;
      case "up" : return this._currentSquare % Environment._sideLength != 0;
      case "right" : return this._currentSquare < Environment._squares.length - Environment._sideLength;
      case "down" : return (this._currentSquare+1) % Environment._sideLength != 0;
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
      if(this.UPDATE_SQUARES)
        Environment._squares[goal].setType("neutral");
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

  private toggleSpeed(){
    $('.fa-rocket').toggleClass('fa-blind');
    this._fast = !this._fast;
    if(this._fast) this.speedUp();
    else this.speedDown();
  }

  private speedUp() : void{
    this.setSpeed(0.1);
    this._fast = true;
  }
  private speedDown() : void{
    this.setSpeed(10);
    this._fast = false;
  }
  private setSpeed(speed : number) : void{
    this._travelTimer.setStartTime(speed);
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
    this._acceleration = force.multiply(1.0/this._mass);
    this._velocity = this._velocity.add(this._acceleration.multiply(deltaTime));
    this._position = this._position.add(this._velocity.multiply(deltaTime));
  }

  private updateSprite() : void{
    this._sprite.setPosition(this._position.elements[0], this._position.elements[1]);
  }

}
