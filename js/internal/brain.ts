
/*=======================================//
Welcome to the brain of the agent. Most functions
in this class are public so that the agent can access them.

Depending on the type of the brain the agent will choose the
correlating thinking method.
//=======================================*/
class Path{
  private _path : string[];
  private _pathIds : number[];
  private _reward : number;
  private _arrayId : number;

  constructor(){
    this._path = []; // array of directions
    this._pathIds = []; // array of square ids
    this._reward = 0; // total reward of this path
  }

  public addReward(reward : number) : void{ this._reward += reward; }
  public addDirection(direction : string) : void{ this._path.push(direction); }
  public addId(id : number) : void{ this._pathIds.push(id); }
  public setArrayId(array_id){ this._arrayId = array_id; }

  public getArrayId(){ return this._arrayId; }
  public getReward() : number{ return this._reward; }
  public getFirst() : string{ return this._path[0]; };
  public getFirstId() : number{ return this._pathIds[0]; };
  public getLast() : string{ return this._path[this._path.length - 1]; };
  public getLastId() : number{ return this._pathIds[this._path.length - 1]; };

  public copy(other : Path){
      this._reward = other._reward;
      for(var i = 0; i < other._path.length; i++){
        this._path[i] = other._path[i];
        this._pathIds[i] = other._pathIds[i];
      }
  }

  public reset(){
    this._path = [];
    this._pathIds = [];
    this._reward = 0;
  }
}

class Brain{

  private _type : string;
  private _agent : Agent;
  private _frontier : Path[];
  private _iterations : number;

  constructor(agent, type){
    this._type = type;
    this._agent = agent;
    this._frontier = [];
    this._iterations = 0;
  }


  private reset(){
    this._iterations = 0;
    this._frontier = [];

    for(var i = 0; i < this._frontier.length; i++){
        this._frontier[i].reset();
      }
  }

  public setBrain(type : string) : void{
    this._agent.setBrainSelected(type, this._type);
    this._type = type;
  }

  public getBrain() : string{
    return this._type;
  }

  public think(){
    switch(this.getBrain()){
      case "stupid" : this.thinkStupid(); break;
      case "simple" : this.thinkSimple(); break;
      case "forward" : this.thinkForward(200); break;
    }
  }

  /*=======================================
  thinkStupid randomizes move without
  concidering its circumstances.
  =======================================*/
  private thinkStupid() : void{
    // Randomize direction
    var move = "";
    var num = Math.floor(Math.random() * 4); // random 0 - 3
    switch(num){
      case 0 : move = "left"; break;
      case 1 : move = "up"; break;
      case 2 : move = "right"; break;
      case 3 : move = "down"; break;
    }
    this._agent.setMove(move)
  }

  /*=======================================
  thinkSimple first randomizes and then
  checks if current path leads to
  a red square or a wall, not moving if so.
  =======================================*/
  private thinkSimple() : void{

    var move = "";
    while(move == ""){
      // Randomize direction
      var num = Math.floor(Math.random() * 4); // random 0 - 3
      switch(num){
        case 0 : // left
          if(this._agent.outerWallCheck("left")){
            var type = Environment._squares[this._agent.getLeftId()].getType();
            if(type != "wall" && type != "red") move = "left";
          }
          break;
        case 1 : // up
          if(this._agent.outerWallCheck("up")){
            var type = Environment._squares[this._agent.getUpId()].getType();
            if(type != "wall" && type != "red") move = "up";
          }
          break;

        case 2 : // right
          if(this._agent.outerWallCheck("right")){
            var type = Environment._squares[this._agent.getRightId()].getType();
            if(type != "wall" && type != "red") move = "right";
          }
          break;

        case 3 : // down
          if(this._agent.outerWallCheck("down")){
            var type = Environment._squares[this._agent.getDownId()].getType();
            if(type != "wall" && type != "red") move = "down";
          }
          break;
      }
    }

    //move = this.slipRisk(move);

    this._agent.setMove(move);
  }


  /*=======================================
  Looks in the future.
  =======================================*/
  private addPath(direction, path, id, array_id){
    if(!this.wall(id, direction)){

      var temp = new Path();
      temp.copy(path);
      temp.addDirection(direction);
      temp.setArrayId(array_id);
      temp.addId(id);
      temp.addReward(Environment._squares[this.getId(id, direction)].getReward());
      this._frontier.push(temp);
    }
  }

  private expandNode(id, step, path){
    var direction = "";

    // Remove prev from frontier
    //this._frontier.splice(path.getArrayId(), 1);

    // Add all new possible ways to frontier
    direction = "left";
    this.addPath(direction, path, id, this._frontier.length - 1);
    direction = "up";
    this.addPath(direction, path, id, this._frontier.length - 1);
    direction = "right";
    this.addPath(direction, path, id, this._frontier.length - 1);
    direction = "down";
    this.addPath(direction, path, id, this._frontier.length - 1);


    // Choose frontier with best reward
    var next = 0;
    var maxReward = this._frontier[next].getReward();
    for(var i = 1; i < this._frontier.length; i++){
      if(this._frontier[i].getReward() > maxReward){
        next = i;
        maxReward = this._frontier[i].getReward();
      }
    }

    this._iterations++;
    while(step > this._iterations){
      var newDirection = this._frontier[next].getFirst();
      var newId = this._frontier[next].getFirstId();
      this.expandNode(newId, step, this._frontier[next]);
    }

  }

  private thinkForward(step : number){

    var move = "";
    var path = new Path();
    var id = this._agent._currentSquare;

    this.expandNode(id, step, path);

    var next = 0;
    var maxReward = this._frontier[0].getReward();
    for(var i = 1; i < this._frontier.length; i++){
      if(this._frontier[i].getReward() > maxReward){
        next = i;
        maxReward = this._frontier[i].getReward();
      }
    }

    move = this._frontier[next].getFirst();
    console.log(this._frontier.length);
    this.reset();

    this._agent.setMove(move);
  }


  private slipRisk(move : string) : string{
    var num = Math.random();
    if(num <= 0.2){ // Slip risk of 20%
      switch(move){
        case "left":
          if(num <= 0.1) return "down";
          else return "up";
        case "up":
          if(num <= 0.1) return "left";
          else return "right";
        case "right":
          if(num <= 0.1) return "up";
          else return "down";
        case "down":
          if(num <= 0.1) return "right";
          else return "left";
      }
    }
    return move;
  }

  private getId(id : number, move : string) : number{
    switch(move){
      case "left": return this.getLeftId(id);
      case "up": return this.getUpId(id);
      case "right": return this.getRightId(id);
      case "down": return this.getDownId(id);
      default: return id;
    }
  }

  private getLeftId(id) : number{ return id - Environment._sideLength; };
  private getUpId(id) : number{ return Environment._sideLength - 1; };
  private getRightId(id) : number{ return id + Environment._sideLength; };
  private getDownId(id) : number{ return id + 1; };


  // Returns true if there is a wall in this direction
  private outerWall(id : number, direction : string) : boolean{
    switch(direction){
      case "left" : return id <= (Environment._sideLength-1);
      case "up" : return id % Environment._sideLength == 0;
      case "right" : return id >= Environment._squares.length - Environment._sideLength;
      case "down" : return (id+1) % Environment._sideLength == 0;
    }
  }

  // Returns true if there is a wall in this direction
  private wall(id : number, direction : string) : boolean{
    if(!this.outerWall(id, direction)){

      var slot = this.getId(id,direction);
      if(Environment._squares[slot].getType() == "wall"){
        return true;  // Inner wall collision
      }
    }else{
      return true;  // Outer wall collision
    }

    return false; // No wall
  }
}
