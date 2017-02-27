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
  private _sprite : any;
  private _currentSquare : number;
  private _iteration : number;
  private _numOfMoves : number;
  private _stopwatch : Stopwatch;

  private _prev_pos_error : any;
  private _pos_integral : any;

  constructor(){
    this._position = Environment._squares[15]._center;
    this._velocity = $V([0, 0]);
    this._acceleration = $V([0, 0]);
    this._mass = 0.8;
    this._sprite = new Sprite("textures/test.png");
    this._goalPosition = this._position;
    this._currentSquare = 15;
    this._numOfMoves = 0;
    this._iteration = 0;
    this._stopwatch = new Stopwatch(10.0);

    this._prev_pos_error = $V([0,0]);
    this._pos_integral = $V([0,0]);

    this.updateInfo();
    window.addEventListener( 'keydown', this.onKeyDown, false );
    window.addEventListener( 'mousedown', this.onMouseDown, false );
  }


  onMouseDown = (e) => {
    switch (e.target.value) {
      case "Reset":
        this.reset(15);
      break;
    default:
  }


  }
  onKeyDown = (e) => {
    console.log(e)
    var size = Math.sqrt(Environment._squares.length);
    if (e) {
      switch (e.keyCode) {
        case 37:
        case 65:
          this.moveLeft(size);
          break;
        case 38:
        case 87:
          this.moveUp(size);
          break;
        case 39:
        case 68:
          this.moveRight(size);
          break;
        case 40:
        case 83:
          this.moveDown(size);
          break;
        case 82:
          this.reset(15);
          break;

          case 72:
            $("#ui").fadeToggle(300, null);
            break;
        default:
      }
    }
  }

  private calcValueIteration(s : number) : number{
    this._iteration++;
    if(this._iteration > 50) return;
    // U(s) = R(s) + gamma * P(s'|s,a) * U(s')
    // Utility = Reward + DicountFactor * Probability * nextUtility
    var gamma : number = .99;
    var reward : number = Environment._squares[s].getReward();
    var prob = 0.8;

    // Calculate PUvalue for each option
    var left = Environment._squares[this.getLeftId(s)].getReward();
    var up = Environment._squares[this.getUpId(s)].getReward();
    var right = Environment._squares[this.getRightId(s)].getReward();
    var down = Environment._squares[this.getUpId(s)].getReward();

    var PUvalue = Math.max(left, up, right, down);
    var U = reward + gamma * PUvalue;
    return U;
  }

  private calcPolicyIteration() : void{

  }

  private calculateMove(type : string) : void{
    switch(type){
      case "value" :
        var U = this.calcValueIteration(this._currentSquare);
        Environment._squares[this._currentSquare].setUtility(U);
        this._iteration = 0;
        break;
      case "policy" :

        break;
      default:
    }
  }

  private getLeftId(s) : number{ return this._currentSquare - Math.sqrt(Environment._squares.length); };
  private getUpId(s) : number{ return this._currentSquare - 1; };
  private getRightId(s) : number{ return s + Math.sqrt(Environment._squares.length); };
  private getDownId(s) : number{ return this._currentSquare + 1; };

  private moveLeft(size : number) : void{
    if(this._currentSquare > size-1){
      var temp : number = this.getLeftId(this._currentSquare);
      this.innerWallCheck(temp, this._currentSquare);
    }
    else
      this.hitWall();
  }
  private moveUp(size : number) : void{
    if(this._currentSquare % 6 != 0){
      var temp : number = this.getUpId(this._currentSquare);
      this.innerWallCheck(temp, this._currentSquare);
    }
    else
      this.hitWall();
  }
  private moveRight(size : number) : void{
    if(this._currentSquare < Environment._squares.length - size){
      var temp : number = this.getRightId(this._currentSquare);
      this.innerWallCheck(temp, this._currentSquare);
    }
    else
      this.hitWall();
  }
  private moveDown(size : number) : void{
    if((this._currentSquare+1) % 6 != 0){
      var temp : number = this.getDownId(this._currentSquare);
      this.innerWallCheck(temp, this._currentSquare);
    }
    else
      this.hitWall();
  }
  private setGoal(goal, prev) : void{
    this._currentSquare = goal;
    Environment._squares[goal].enterSquare();
    Environment._squares[prev].leaveSquare();
    this._goalPosition = Environment._squares[this._currentSquare]._center;
    this._numOfMoves++;
    this.updateInfo();
    this.calculateMove("value");
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

  private getInfoString() : string{

    var pos = this.getGridPos().elements;
    return '<p class= "' + Environment._squares[this._currentSquare].getType() + ' history-text"' +
      '>' +  this._numOfMoves +
      ' | ' +  '(' +  pos[0] + ',' + pos[1] + ')' +
      ' | ' + Environment._squares[this._currentSquare].getReward() +
      ' | ' + Environment._squares[this._currentSquare].getUtility() +
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

  public reset(start) : void{
    this.setGoal(start, this._currentSquare);
    this._numOfMoves=0;
    this._currentSquare = start;
    this._iteration = 0;

    for(var i = 0; i < Environment._squares.length; i++){
      Environment._squares[i].setUtility(0);
    }

    this.updateGridPosInfo();
    this.clearHistory();
  }



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


    public update(deltaTime) : void{
      this._stopwatch.update(deltaTime);

      // if(this._stopwatch.done()){
      //     var size = Math.sqrt(Environment._squares.length);
      //     this.moveRight(size);
      //     this._goalPosition = Environment._squares[this._currentSquare]._center;
      //     this._stopwatch.reset();
      // }

      this.moveTowardsGoal(deltaTime);
      this.updateSprite();
    }

  private updateSprite() : void{
    this._sprite.setPosition(this._position.elements[0], this._position.elements[1]);
  }

}
