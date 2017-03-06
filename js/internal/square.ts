/// <reference path="renderer.ts"/>


class Square{

  public _position : any;
  public _center : any;
  private _type : string;
  private _utility : number;
  private _empty : boolean;
  private _graphics : any;

  constructor(pos, type, size, radius){
    this._position = pos;
    this._center = this._position.add($V([size/2,size/2]));
    this._type = type;
    this._utility = 0.0;
    this._empty = true;
    this._graphics = new PIXI.Graphics();
    this._graphics.beginFill(0xffffff);
    this._graphics.lineStyle(1, 0xdddddd);
    this._graphics.drawRoundedRect(pos.elements[0], pos.elements[1], size, size, radius);
    Renderer._stage.addChild(this._graphics);
  }

  public update(deltaTime){
    if(this._graphics.alpha < 1 && this._empty)
      this._graphics.alpha += 0.10;

      if(this._graphics.alpha > 1 && this._empty)
        this._graphics.alpha -= 0.10;
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

  public hitWall(){
    this._graphics.alpha = 0.1;
  }

  public enterSquare(){
    this._empty = false;
    this._graphics.alpha = 1.03;
  }

  public leaveSquare(){
    this._empty = true;
  }

  public setColor(type : string, theme : string) : void{
    console.log(this._graphics);
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
          this._graphics.tint = 0xaa3333;
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
          this._graphics.tint = 999999999;
          break;
        case "green":
          this._graphics.tint = 57000000400;
          break;
        case "red":
          this._graphics.tint = 16177114;
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
          this._graphics.tint = 16777215;
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
