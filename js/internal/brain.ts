
/*=======================================//
Welcome to the brain of the agent. Most functions
in this class are public so that the agent can access them.

Depending on the type of the brain the agent will choose the
correlating thinking method.
//=======================================*/
class Path{
  public _directions : string[];
  public _squareIds : number[]; // square ids
  public _reward : number; // Used for picking path and expanding nodes

  constructor(){
    this._directions = []; // array of directions
    this._squareIds = []; // array of square ids
    this._reward = 0; // total reward of this path
  }

  public addReward(reward : number) : void{ this._reward = this._reward + reward; }
  public addDirection(direction : string) : void{ this._directions.push(direction); }
  public addSquareId(id : number) : void{ this._squareIds.push(id); }

  public getReward() : number{ return this._reward; }
  public getFirst_Direction() : string{ return this._directions[0]; };
  public getFirst_SquareId() : number{ return this._squareIds[0]; };
  public getLast_Direction() : string{ return this._directions[this._directions.length - 1]; };
  public getLast_SquareId() : number{ return this._squareIds[this._squareIds.length - 1]; };

  public copy(path : Path){
    this._reward = path.getReward();
    for(var i = 0; i < path._directions.length; i++){
      this.addSquareId(path._squareIds[i]);
      this.addDirection(path._directions[i]);
    }
  }

  public reset(){
    this._directions = [];
    this._squareIds = [];
    this._reward = 0;
  }
}

class Brain{

  private _type : string;
  private _agent : Agent;
  private _frontier : Path[];
  private _iterations : number;
  private _done : boolean;
  private _avoid_red : boolean;

  constructor(agent, type){
    this._type = type;
    this._agent = agent;
    this._frontier = [];
    this._iterations = 0;
    this._done = false;
    this._avoid_red = false;
    window.addEventListener( 'keydown', this.onKeyDown, false );
  }

  onKeyDown = (e) => {
    switch(e.key){
      case "Control" :
      console.log(this.getId(this._agent._currentSquare, "up"));
      break;
    }

  }
  private Done(){
    this._done = true;
    this._agent.toggleAutoMove();
  }

  public reset(){
    for(var i = 0; i < this._frontier.length; i++){
      this._frontier[i].reset();
    }

    this._iterations = 0;
    this._frontier = [];

  }

  public setBrain(type : string) : void{
    this._agent.setBrainSelected(type, this._type);
    this._type = type;
    if(type == "careful") this._avoid_red = true; else this._avoid_red = false;
  }

  public getBrain() : string{
    return this._type;
  }

  private addFrontier(path : Path){
    this._frontier.push(path);
  }

  public think(){
    switch(this.getBrain()){
      case "stupid" : this.thinkStupid(); break;
      case "simple" : this.thinkSimple(); break;
      case "forward" : this.thinkForward(500); this._avoid_red = false; break;
      case "careful" : this.thinkForward(300); this._avoid_red = true; break;
    }
  }

  /*=======================================
    thinkForward expands every node that leads to a new final destination with better reward.
    Enables agent to find all green slots but is limited since it
    increases size of frontiers with a power of 4 each expansion.
  =======================================*/
  private tryAddDirection(direction, path, prev_square_id){
    var current_square_id = this.getId(prev_square_id, direction);

    // Checker becomes false if we should avoid red and next square is red
    var red_check = true;
    if(this._avoid_red && !this.wall(prev_square_id, direction) && Environment._squares[current_square_id].getType() == "red"){
      red_check = false;
    }

    if(!this.wall(prev_square_id, direction) && red_check){

      // Create new path with old values
      var newPath = new Path();
      newPath.copy(path); // copy existing path into newPath

      // Add new values
      newPath.addDirection(direction);
      newPath.addSquareId(current_square_id);
      newPath.addReward(Environment._squares[current_square_id].getReward());

      // See if node ending already exists with better outcome
      var bad_expansion : boolean = false;
      var bad_node : boolean = false;
      var bad_id : number = -1;
      for(var i = 0; i < this._frontier.length; i++){
        // if path to current ending square already exists
        // find out what is bad
        if(this._frontier[i].getLast_SquareId() == current_square_id ){
          if( this._frontier[i].getReward() > newPath.getReward()){
            bad_expansion = true;
          }else{
            bad_node = true;
            bad_id = i;
          }
        }
      }
      if(bad_node){
        var temp_frontier : Path[] = [];
        for(var i = 0; i < this._frontier.length; i++){
          if(i != bad_id){
            temp_frontier.push(this._frontier[i]);
          }
        }
        this._frontier = temp_frontier;
      }
      if(!bad_expansion){
        this.addFrontier(newPath);
      }
    }

  }

  private shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;
    while (0 !== currentIndex) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }
    return array;
  }

  private expandNode(square_id, path){
    this._iterations++;
    // expand node in all directions randomly
    var dirs = ["left", "up", "right", "down"];
    dirs = this.shuffle(dirs);
    for(var i = 0; i < dirs.length; i++){
      this.tryAddDirection(dirs[i], path, square_id);
    }
  }

  private thinkForward(steps : number){
    var move = "right";
    var first_square_id = this._agent._currentSquare;
    var empty_path = new Path();

    // expand first node
    this.expandNode(first_square_id, empty_path);

    while(this._iterations < steps){
      // EXPAND ALL FRONTIERS
      // decide what node has the highest reward
      var num_expansions = this._frontier.length;
      for(var i = 0; i < num_expansions; i++){
        // expand node with most reward
        this.expandNode(this._frontier[i].getLast_SquareId(), this._frontier[i]);
      }
    }

    // decide what node has the highest reward
    var maxReward = -99;
    var next_frontier_id = -1;
    for(var i = 0; i < this._frontier.length; i++){
      if(this._frontier[i].getReward() > maxReward){
        maxReward = this._frontier[i].getReward();
        next_frontier_id = i; // Decide what frontier to choose
      }
    }

    // make it its first move if not done
    if(this._frontier[next_frontier_id].getReward() < 0) {
      this.Done();
      this._agent.setMove("");
    } else{
      move = this._frontier[next_frontier_id].getFirst_Direction();
      this._agent.setMove(move);
      this.reset();
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
  private getUpId(id) : number{ return id - 1; };
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
  private wall(prev_square_id : number, direction : string) : boolean{
    if(!this.outerWall(prev_square_id, direction)){

      var slot = this.getId(prev_square_id, direction);
      if(Environment._squares[slot].getType() == "wall"){
        return true;  // Inner wall collision
      }
    }else{
      return true;  // Outer wall collision
    }

    return false; // No wall
  }
}
