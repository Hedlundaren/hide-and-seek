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

  public thinkStupid() : void{
    // Randomize direction
    var num = Math.floor(Math.random() * 4); // random 0 - 3
    switch(num){
      case 0 : this._agent.setMove("left"); break;
      case 1 : this._agent.setMove("up"); break;
      case 2 : this._agent.setMove("right"); break;
      case 3 : this._agent.setMove("down"); break;
    }
  }

  public thinkSimple() : void{

    this._agent.setMove("")
    while(this._agent.getMove() == ""){
      // Randomize direction
      var num = Math.floor(Math.random() * 4); // random 0 - 3
      switch(num){
        case 0 : // left
          if(this._agent.outerWallCheck("left")){
            var type = Environment._squares[this._agent.getLeftId()].getType();
            if(type != "wall" && type != "red") this._agent.setMove("left");
          }
          break;
        case 1 : // up
          if(this._agent.outerWallCheck("up")){
            var type = Environment._squares[this._agent.getUpId()].getType();
            if(type != "wall" && type != "red") this._agent.setMove("up");
          }
          break;

        case 2 : // right
          if(this._agent.outerWallCheck("right")){
            var type = Environment._squares[this._agent.getRightId()].getType();
            if(type != "wall" && type != "red") this._agent.setMove("right");
          }
          break;

        case 3 : // down
          if(this._agent.outerWallCheck("down")){
            var type = Environment._squares[this._agent.getDownId()].getType();
            if(type != "wall" && type != "red") this._agent.setMove("down");
          }
          break;
      }
    }
  }



}
