declare var PIXI:any;

"use strict";

class Renderer{
  private _renderer : any;
  private _container : any = null;

  static _stage = new PIXI.Container();
  constructor(){
    this._renderer = PIXI.autoDetectRenderer(window.innerWidth, window.innerHeight,{backgroundColor : 0x222222});
    this._container = document.getElementById('canvas');
    this._container.appendChild(this._renderer.view);
    window.addEventListener( 'resize', this.onWindowResize, false );
  }

  public setBackground(color) : void{
    this._renderer.backgroundColor = color;
  }

  onWindowResize = (e) => {
    this._renderer.resize( window.innerWidth, window.innerHeight );
  }

  render() : void{
    this._renderer.render(Renderer._stage);
  }

}
