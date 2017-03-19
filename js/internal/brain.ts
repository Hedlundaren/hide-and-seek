
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
  public _squares : Square[]; // The updated environment of this path

  constructor(){
    this._directions = []; // array of directions
    this._squareIds = []; // array of square ids
    this._reward = 0; // total reward of this path
    this._squares = [];
    this.resetSquares();
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
    this._squares = [];
    for(var i = 0; i < path._squares.length; i++){
      this._squares.push(path._squares[i]);
    }
  }

  private resetSquares(){
    this._squares = [];
    for(var i = 0; i < Environment._squares.length; i++){
      var newSquare : Square;
      newSquare = new Square($V([0,0]), Environment._squares[i].getId(), Environment._squares[i].getType, 0,0);
      newSquare.copy(Environment._squares[i]);
      this._squares.push(newSquare);
    }
  }

  public reset(){
    this._directions = [];
    this._squareIds = [];
    this._reward = 0;
    this.resetSquares();
  }
}

class Brain{

  private _type : string;
  private _agent : Agent;
  private _frontier : Path[];
  private _iterations : number;
  private _sloppy : boolean; // enables risk of slipping (10% to each side of intended move)
  private _done : boolean;
  private _avoid_red : boolean;

  constructor(agent, type){
    this._type = type;
    this._agent = agent;
    this._frontier = [];
    this._iterations = 0;
    this._sloppy = false;
    this._done = false;
    this._avoid_red = false;
    window.addEventListener( 'keydown', this.onKeyDown, false );
  }

  onKeyDown = (e) => {
    switch(e.key){
      case "Control" :
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
    Sprite.setTexture("textures/" + type + ".png");
  }

  public getBrain() : string{
    return this._type;
  }

  private addFrontier(path : Path){
    this._frontier.push(path);
  }

  private setMove(move : string){
    if(this._sloppy){
      move = this.slipRisk(move);
    }
    this._agent.setMove(move);
  }

  private toggleSloppy(){
    this._sloppy = !this._sloppy;
  }

  public think(){
    switch(this.getBrain()){
      case "stupid" : this.thinkStupid(); break;
      case "simple" : this.thinkSimple(); break;
      case "forward" : this.thinkForward(250); this._avoid_red = false; break;
      case "careful" : this.thinkForward(250); this._avoid_red = true; break;
      case "value" : this.thinkValue(50); break;
      case "policy" : this.thinkPolicy(50); break;
    }
  }

  //=======================================//
  //====== PART 1 - VALUE ITERATION =======//
  /*=======================================//
  Following steps are used in this method:
    1. Initiate all states with U(s) = 0
    2. Update Utilities of all states according to Bellman Equation
    3. Repeat step 2 N_ITERATIONS times
    4. Move Agent
  =======================================*/
  private thinkValue(N_ITERATIONS : number){

    // 1. Initiate all states with U(s) = 0
    var N_STATES = Environment._squares.length;
    for(var square_id = 0; square_id < N_STATES; square_id++){
      Environment._squares[square_id].setUtility(0);
    }

    // 3. Repeat step 2 N_ITERATIONS times
    for(var i = 0; i < N_ITERATIONS; i++){
      // 2. Update all states N_ITERATIONS according to the Bellman Equation
      this.valueDetermination(Environment._squares);
      console.log("(" + i + ") : " + Environment._squares[this._agent._currentSquare].getUtility());
    }

    // 4. Move Agent
    // Get best policy depending on current position
    var best_move = this.getBestPolicy(Environment._squares, this._agent._currentSquare);
    this.displayAllUtilities();
    this.setMove(best_move);

  }

  //=======================================//
  //====== PART 1 - POLICY ITERATION =======//
  /*=======================================//
  Following steps are used in this method:
    1. Initiate policies and utilitiies to arbitrary values
    2. Update utilities assuming best policy was chosen
    3. Update best policy depending on surrounding utilities
    4. Repeat step 2 and 3 N_ITERATIONS times
    5. Move agent
  =======================================*/
  private thinkPolicy(N_ITERATIONS : number){

    // 1. Initiate policies and utilitiies to arbitrary values
    // Initiate utilities to 0
    // Policies are initiated in "square.ts" to "left"
    var N_STATES = Environment._squares.length;
    for(var square_id = 0; square_id < N_STATES; square_id++){
      Environment._squares[square_id].setUtility(0);
    }

    // ====== POLICY IMPROVEMENT ========
    // initiate policies to whatever is best
    // according to current utilities
    this.policyUpdate(Environment._squares, this._agent._currentSquare);

    // 4. Repeat step 2 and 3 N_ITERATIONS times
    for(var i = 0; i < N_ITERATIONS; i++){

      // ====== POLICY EVALUATION ========
      // 2. Update utilities assuming best policy was chosen
      this.policyEvaluation(Environment._squares);

      // ====== POLICY IMPROVEMENT ========
      // 3. Update best policy depending on surrounding utilities
      this.policyUpdate(Environment._squares, this._agent._currentSquare);
    }

    // 5. Move agent
    var best_move = Environment._squares[this._agent._currentSquare].getPolicy();
    this.setMove(best_move);

  }


  // Determine utilities based on environment
  private valueDetermination(squares : Square[]){

    var N_STATES = squares.length;
    // Update Utilities of all states
    // Initiate all states with U(s) = 0
    for(var square_id = 0; square_id < N_STATES; square_id++){
      // Calculate utility of current state
      // U = R + gamma * max (PU) - Bellman Equation
      var PU = []; // List of possible choices
      var PU_dir = []; // Directions corresponding to choices

      // 1. Current states reward
      var R = squares[square_id].getReward();
      // 2. Set discount factor (pre-defined)
      var gamma = 0.99;
      // 3. Get outcome of possible actions
      // 3.1 Turn left <-
      if(!this.wall(square_id, "left")){
        var PU_left = 0.8 * squares[this.getId(square_id, "left")].getUtility();
        if(!this.wall(square_id, "down"))
          PU_left  += 0.1 * (squares[this.getId(square_id, "down")].getUtility());
        if(!this.wall(square_id, "up"))
          PU_left += 0.1 * (squares[this.getId(square_id, "up")].getUtility());

        PU.push(PU_left);
        PU_dir.push("left");
      }
      // 3.2 Turn up ^
      if(!this.wall(square_id, "up")){
        var PU_up = 0.8 * squares[this.getId(square_id, "up")].getUtility();
        if(!this.wall(square_id, "left"))
          PU_up  += 0.1 * (squares[this.getId(square_id, "left")].getUtility());
        if(!this.wall(square_id, "right"))
          PU_up += 0.1 * (squares[this.getId(square_id, "right")].getUtility());

        PU.push(PU_up);
        PU_dir.push("up");
      }
      // 3.3 Turn right ->
      if(!this.wall(square_id, "right")){
        var PU_right = 0.8 * squares[this.getId(square_id, "right")].getUtility();
        if(!this.wall(square_id, "up"))
          PU_right +=  0.1 * (squares[this.getId(square_id, "up")].getUtility());
        if(!this.wall(square_id, "down"))
          PU_right +=  0.1 * (squares[this.getId(square_id, "down")].getUtility());
        PU.push(PU_right);
        PU_dir.push("right");
      }
      // 3.4 Turn down v
      if(!this.wall(square_id, "down")){
        var PU_down = 0.8 * squares[this.getId(square_id, "down")].getUtility();
        if(!this.wall(square_id, "right"))
          PU_down +=  0.1 * (squares[this.getId(square_id, "right")].getUtility());
        if(!this.wall(square_id, "left"))
          PU_down +=  0.1 * (squares[this.getId(square_id, "left")].getUtility());

        PU.push(PU_down);
        PU_dir.push("down");
      }

      var best_value = PU[0]; // Assuming there is at least one option for the agent
      var best_choice = 0;
      for(var choice = 1; choice < PU.length; choice++){
        if(best_value < PU[choice]){
          best_value = PU[choice]; // choose best value
          best_choice = choice; // and best choice
        }
      }

      // Update utility of state
      var U = R + gamma * best_value;
      squares[square_id].setUtility(U);
    } // END OF N_STATES
  }

  // Sets utilities of states depending on current optimal policy
  private policyEvaluation(squares : Square[]){

    var N_STATES = squares.length;
    // Update Utilities of all states
    // Initiate all states with U(s) = 0
    for(var square_id = 0; square_id < N_STATES; square_id++){

      // Current best policy:
      var direction = squares[square_id].getPolicy();
      // Calculate utility of current state
      // U = R + gamma * max (PU) - Bellman Equation
      var PU = []; // List of possible choices
      var PU_dir = []; // Directions corresponding to choices

      // 1. Current states reward
      var R = squares[square_id].getReward();
      // 2. Set discount factor (pre-defined)
      var gamma = 0.99;
      // 3. Get outcome of possible actions
      // 3.1 Turn left <-
      if(direction == "left" && !this.wall(square_id, "left")){
        var PU_left = 0.8 * squares[this.getId(square_id, "left")].getUtility();
        if(!this.wall(square_id, "down"))
          PU_left  += 0.1 * (squares[this.getId(square_id, "down")].getUtility());
        if(!this.wall(square_id, "up"))
          PU_left += 0.1 * (squares[this.getId(square_id, "up")].getUtility());

        PU.push(PU_left);
        PU_dir.push("left");
      }
      // 3.2 Turn up ^
      if(direction == "up" && !this.wall(square_id, "up")){
        var PU_up = 0.8 * squares[this.getId(square_id, "up")].getUtility();
        if(!this.wall(square_id, "left"))
          PU_up  += 0.1 * (squares[this.getId(square_id, "left")].getUtility());
        if(!this.wall(square_id, "right"))
          PU_up += 0.1 * (squares[this.getId(square_id, "right")].getUtility());

        PU.push(PU_up);
        PU_dir.push("up");
      }
      // 3.3 Turn right ->
      if(direction == "right" && !this.wall(square_id, "right")){
        var PU_right = 0.8 * squares[this.getId(square_id, "right")].getUtility();
        if(!this.wall(square_id, "up"))
          PU_right +=  0.1 * (squares[this.getId(square_id, "up")].getUtility());
        if(!this.wall(square_id, "down"))
          PU_right +=  0.1 * (squares[this.getId(square_id, "down")].getUtility());
        PU.push(PU_right);
        PU_dir.push("right");
      }
      // 3.4 Turn down v
      if(direction == "down" && !this.wall(square_id, "down")){
        var PU_down = 0.8 * squares[this.getId(square_id, "down")].getUtility();
        if(!this.wall(square_id, "right"))
          PU_down +=  0.1 * (squares[this.getId(square_id, "right")].getUtility());
        if(!this.wall(square_id, "left"))
          PU_down +=  0.1 * (squares[this.getId(square_id, "left")].getUtility());

        PU.push(PU_down);
        PU_dir.push("down");
      }

      var best_value = PU[0]; // Assuming there is at least one option for the agent
      var best_choice = 0;
      for(var choice = 1; choice < PU.length; choice++){
        if(best_value < PU[choice]){
          best_value = PU[choice]; // choose best value
          best_choice = choice; // and best choice
        }
      }

      // Update utility of state
      var U = R + gamma * best_value;
      Environment._squares[square_id].setUtility(U);
    } // END OF N_STATES
  }


  // policyUpdate determines what move is best depending on
  // surrounding utilities and the utility function
  private policyUpdate(squares : Square[], square_id: number){

    var N_STATES = squares.length;
    for(var square_id = 0; square_id < N_STATES; square_id++){


      var PU = []; // List of possible choices
      var PU_dir = []; // Directions corresponding to choices

      // 3.1 Turn left <-
      if(!this.wall(square_id, "left")){
        var PU_left = 0.8 * squares[this.getId(square_id, "left")].getUtility();
        if(!this.wall(square_id, "down"))
          PU_left  += 0.1 * (squares[this.getId(square_id, "down")].getUtility());
        if(!this.wall(square_id, "up"))
          PU_left += 0.1 * (squares[this.getId(square_id, "up")].getUtility());

        PU.push(PU_left);
        PU_dir.push("left");
      }
      // 3.2 Turn up ^
      if(!this.wall(square_id, "up")){
        var PU_up = 0.8 * squares[this.getId(square_id, "up")].getUtility();
        if(!this.wall(square_id, "left"))
          PU_up  += 0.1 * (squares[this.getId(square_id, "left")].getUtility());
        if(!this.wall(square_id, "right"))
          PU_up += 0.1 * (squares[this.getId(square_id, "right")].getUtility());

        PU.push(PU_up);
        PU_dir.push("up");
      }
      // 3.3 Turn right ->
      if(!this.wall(square_id, "right")){
        var PU_right = 0.8 * squares[this.getId(square_id, "right")].getUtility();
        if(!this.wall(square_id, "up"))
          PU_right +=  0.1 * (squares[this.getId(square_id, "up")].getUtility());
        if(!this.wall(square_id, "down"))
          PU_right +=  0.1 * (squares[this.getId(square_id, "down")].getUtility());
        PU.push(PU_right);
        PU_dir.push("right");
      }
      // 3.4 Turn down v
      if(!this.wall(square_id, "down")){
        var PU_down = 0.8 * squares[this.getId(square_id, "down")].getUtility();
        if(!this.wall(square_id, "right"))
          PU_down +=  0.1 * (squares[this.getId(square_id, "right")].getUtility());
        if(!this.wall(square_id, "left"))
          PU_down +=  0.1 * (squares[this.getId(square_id, "left")].getUtility());

        PU.push(PU_down);
        PU_dir.push("down");
      }

      var best_value = PU[0]; // Assuming there is at least one option for the agent
      var best_choice = 0;
      for(var choice = 1; choice < PU.length; choice++){
        if(best_value < PU[choice]){
          best_value = PU[choice]; // choose best value
          best_choice = choice; // and best choice
        }
      }

      squares[square_id].setPolicy(PU_dir[best_choice]);
    } // END OF N_STATES
  }

  // Returns best move depending on current id and surrounding utilities
  private getBestPolicy(squares : Square[], current_square_id : number) : string{

    // Now all iterations are done and we should
    // choose the direction with best/highest utility
    var Utilities = []; // List of possible choices
    var Dirs = []; // Directions corresponding to choices

    if(!this.wall(current_square_id, "left")){
      var Utility_left = squares[this.getId(current_square_id, "left")].getUtility();
      Utilities.push(Utility_left);
      Dirs.push("left")
    }
    if(!this.wall(current_square_id, "up")){
      var Utility_up = squares[this.getId(current_square_id, "up")].getUtility();
      Utilities.push(Utility_up);
      Dirs.push("up")
    }
    if(!this.wall(current_square_id, "right")){
      var Utility_right = squares[this.getId(current_square_id, "right")].getUtility();
      Utilities.push(Utility_right);
      Dirs.push("right")
    }
    if(!this.wall(current_square_id, "down")){
      var Utility_down = squares[this.getId(current_square_id, "down")].getUtility();
      Utilities.push(Utility_down);
      Dirs.push("down")
    }

    var best_value = Utilities[0]; // Assuming there is at least one option for the agent
    var best_choice = 0;
    for(var choice = 1; choice < Utilities.length; choice++){
      if(best_value < Utilities[choice]){ // choose best value and best choice
        best_value = Utilities[choice];
        best_choice = choice;
      }
    }

    return Dirs[best_choice];
  }





  private displayAllUtilities(){
    for(var j = 0; j < Environment._sideLength; j++){
      for(var i = 0; i < Environment._sideLength; i++){
        var id = j*Environment._sideLength + i;
        if(Environment._squares[id].getType() != "wall"){
          //console.log("(" + j + "," + i + ") : " + Environment._squares[id].getUtility() + "-> " + Environment._squares[id].getPolicy());
          console.log("(" + j + "," + i + ") : " + Environment._squares[id].getUtility() + "-> " + this.getBestPolicy(Environment._squares, id));
        }else{
          console.log("(" + j + "," + i + ") : wall");

        }
      }
    }
  }





  /*=======================================
    Here are my own solutions,
    based on node expansion
  //=====================================*/

  /*=======================================
    thinkForward expands every node that leads to a new final destination with better reward.
    Enables agent to find all green slots but is limited since it
    increases size of frontiers with a power of 4 each expansion.
  =======================================*/
  private tryAddDirection(direction, path, prev_square_id){
    var current_square_id = this.getId(prev_square_id, direction);

    // Checker becomes false if we should avoid red and next square is red
    var red_check = true;
    if(this._avoid_red && !this.wall(prev_square_id, direction) && path._squares[current_square_id].getType() == "red"){
      red_check = false;
    }
    this._iterations++;

    if(!this.wall(prev_square_id, direction) && red_check){


      // Here we actually expand the node and add it to our path
      // Create new path with old values
      var newPath = new Path();
      newPath.copy(path); // copy existing path into newPath

      // Add new values
      newPath.addDirection(direction);
      newPath.addSquareId(current_square_id);
      newPath.addReward(path._squares[current_square_id].getReward());

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
        if(this._agent.UPDATE_SQUARES)
          newPath._squares[current_square_id].setType("neutral");
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
      this.setMove(""); // Stop moving
    } else{
      move = this._frontier[next_frontier_id].getFirst_Direction();
      this.setMove(move);
      this.reset();
    }
  }

  /*=======================================
  thinkStupid randomizes move without
  concidering its circumstances.
  =======================================*/
  private thinkStupid() : void{
    var dirs = ["left", "up", "right", "down"];
    this.shuffle(dirs);
    this.setMove(dirs[0])
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

    this.setMove(move);
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
