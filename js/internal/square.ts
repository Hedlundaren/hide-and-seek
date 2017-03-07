/// <reference path="renderer.ts"/>


class Square{

  public _position : any;
  public _id : number;
  public _center : any;
  private _type : string;
  private _utility : number;
  private _envSize : number;
  private _empty : boolean;
  private _graphics : any;

  constructor(pos, id, type, size, radius){
    this._position = pos;
    this._id = id;
    this._center = this._position.add($V([size/2,size/2]));
    this._type = type;
    this._empty = true;
    this._utility = 0.0;
    this._envSize = Math.sqrt(Environment._squares.length);
    this._graphics = new PIXI.Graphics();
    this._graphics.beginFill(0xffffff);
    this._graphics.lineStyle(1, 0xdddddd);
    this._graphics.drawRoundedRect(pos.elements[0], pos.elements[1], size, size, radius);
    Renderer._stage.addChild(this._graphics);
  }

  public update(deltaTime){
    if(this._graphics.alpha < 1 && this._empty)
      this._graphics.alpha += 0.05;

      if(this._graphics.alpha > 1 && this._empty)
        this._graphics.alpha -= 0.05;
  }

  public getId(){
    return this._id;
  }

  public getType(){
    return this._type;
  }

  public getUtility(){
    return this._utility;
  }
  public addUtility(U : number){
    return this._utility += U;
  }
  public setUtility(U : number){
    return this._utility = U;
  }

  public getReward() : number{
    switch(this._type){
      case "neutral" :
        return -0.04;
      case "green" :
        return 1.0;
      case "red" :
        return -1.0;
      default:
        return 0.0;
    }
  }

  public getLeftId() : number{ return this._id - this._envSize; };
  public getUpId() : number{ return this._id - 1; };
  public getRightId() : number{ return this._id + this._envSize; };
  public getDownId() : number{ return this._id + 1; };

  // public getLeftSquare() : Square{ return Environment._squares[this.getLeftId()];};
  // public getUpSquare() : Square{ return Environment._squares[this.getUpId()]; };
  // public getRightSquare() : Square{ return Environment._squares[this.getRightId()]; };
  // public getDownSquare() : Square{return Environment._squares[this.getLeftId()]; };

  public hitWall(){
    this._graphics.alpha = 0.1;
  }

  public enterSquare(){
    this._empty = false;
    this._graphics.alpha = 1.05;
  }

  public leaveSquare(){
    this._empty = true;
  }

  public setColor(type : string, theme : string) : void{
    if(theme == "night"){
      switch (type) {
        case "neutral":
        this._graphics.tint = 0xaaaaaa;
          break;
        case "start":
          this._graphics.tint = 0xcccccc;
          break;
        case "green":
          this._graphics.tint = 0x77bb77;
          break;
        case "red":

          this._graphics.tint = 0xbb7777;
          break
        case "wall":
          this._graphics.tint = 0x666666;
          break;
        case "wallhit":
          this._graphics.tint = 0xdd5555;
          break;

        default:
          this._graphics.tint = 16777215;
      }
    }
    else if(theme == "day"){
      switch (type) {
        case "neutral":
        this._graphics.tint = 16777215;
          break;
        case "start":
          this._graphics.tint = 0xdddddd;
          break;
        case "green":
          this._graphics.tint = 0x99dd99;
          break;
        case "red":
          this._graphics.tint = 0xdd9999;
          break
        case "black":
          this._graphics.tint = 16777225;
          break;
        case "blue":
          this._graphics.tint = 16777215;
          break;
        case "wall":
          this._graphics.tint = 0xaaaaaa;
          break;
        case "wallhit":
          this._graphics.tint = 0xff9999;
          break;

        default:
          this._graphics.tint = 16777215;

      }
    }
  }

  public setType(type : string, theme : string){
    this._type = type;
    this.setColor(type, theme);

  }
}
