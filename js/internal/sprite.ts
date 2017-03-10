class Sprite{
  private _texture : any;
  static _sprite : any;

  constructor(private texture: string){
    this._texture = PIXI.Texture.fromImage(texture);
    Sprite._sprite = new PIXI.Sprite(this._texture);
    Sprite._sprite.scale.x = .5;
    Sprite._sprite.scale.y = .5;
    Sprite._sprite.anchor.x = 0.5;
    Sprite._sprite.anchor.y = 0.5;
    Renderer._stage.addChild(Sprite._sprite);
  }

  static setTexture(path){
    var texture = PIXI.Texture.fromImage(path);
    this._sprite.setTexture(texture)
  }

  setPosition(x : number, y : number) : void{
    Sprite._sprite.position.x = x;
    Sprite._sprite.position.y = y;
  }
}
