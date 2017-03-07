
/*=======================================//
Welcome to the brain of the agent. Most functions
in this class are public so that the agent can access them.

Depending on the type of the brain the agent will choose the
correlating thinking method.
//=======================================*/


class Brain{

  private _type : string;
  private _agent : Agent;

  constructor(agent, type){
    this._type = type;
    this._agent = agent;
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
      case "forward" : this.thinkForward(); break;
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

    move = this.slipRisk(move);
    this._agent.setMove(move);
  }

  /*=======================================
  Looks in the future.
  =======================================*/
  private thinkForward(){

    // check rewards
    var reward = -999999;
    var temp_reward = -999999;
    var move = "";
    var id = this._agent._currentSquare;

    // left
    if(this.wallCheck(id, "left")){
      temp_reward = Environment._squares[this._agent.getLeftId()].getReward();
      if(temp_reward > reward){
        reward = temp_reward;
        move = "left"
      }
    }

    // up
    if(this.wallCheck(id, "up")){
      temp_reward = Environment._squares[this._agent.getUpId()].getReward();
      if(temp_reward > reward){
        reward = temp_reward;
        move = "up"
      }
    }

    // right
    if(this.wallCheck(id, "right")){
      temp_reward = Environment._squares[this._agent.getRightId()].getReward();
      if(temp_reward > reward){
        reward = temp_reward;
        move = "right"
      }
    }

    // down
    if(this.wallCheck(id, "down")){
      temp_reward = Environment._squares[this._agent.getDownId()].getReward();
      if(temp_reward > reward){
        reward = temp_reward;
        move = "down"
      }
    }

    // expand square with largest reward
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


  private wallCheck(id, direction : string) : boolean{
    switch(direction){
      case "left" :
        if(this._agent.outerWallCheck("left")){
          if(Environment._squares[this._agent.getLeftId()].getType() != "wall"){
            return true;
          }
        }
        break;

      case "up" :
        if(this._agent.outerWallCheck("up")){
          if(Environment._squares[this._agent.getUpId()].getType() != "wall"){
            return true;
          }
        }
        break;

      case "right" :
        if(this._agent.outerWallCheck("right")){
          if(Environment._squares[this._agent.getRightId()].getType() != "wall"){
            return true;
          }
        }
        break;

      case "down" :
        if(this._agent.outerWallCheck("down")){
          if(Environment._squares[this._agent.getDownId()].getType() != "wall"){
            return true;
          }
        }
        break;
    }
  }
}
