/// <reference path="environment.ts"/>
/// <reference path="renderer.ts"/>

"use strict";

class Main{

  private _renderer : Renderer;
  private _environment : Environment;
  private _theme : string;

  constructor(){
    this._theme = "night";
    this._environment = new Environment("night");
    this._renderer = new Renderer();
    window.addEventListener( 'mousedown', this.onMouseDown, false );
    window.addEventListener( 'keydown', this.onKeyDown, false );

  }

  onMouseDown = (e) => {

    switch (e.target.value) {
      case "Theme":
      this.toggleTheme();
      break;
    }
  }

  onKeyDown = (e) => {
    if (e) {
      switch (e.keyCode) {
        case 84:
          this.toggleTheme();
          break;
        }
      }
    }

  start(): void{
    this.update();
  }

  update(): void{
    var time = Date.now() / 1000;
    var deltaTime = 0.3;
    this._renderer.render();
    this._environment.update(deltaTime);
    requestAnimationFrame(() => this.update());
  }

  private toggleTheme(){

    if(this._theme == "night")
      this._theme = "day";
    else if(this._theme == "day")
      this._theme = "night";

    if(this._theme == "night"){ // NIGHT
      this._renderer.setBackground("0x222222");
      $("#HUD").css("opacity", "0.7");
      for(var i = 0; i < Environment._squares.length; i++){
            Environment._squares[i].setType(Environment._squares[i].getType(), this._theme);
      }
      Environment._background.setType(Environment._background.getType(), this._theme);


    }else{
      this._renderer.setBackground("0xFFFFFF");
      $("#HUD").css("opacity", "1.0");
      for(var i = 0; i < Environment._squares.length; i++){
            Environment._squares[i].setType(Environment._squares[i].getType(), this._theme);
      }
      Environment._background.setType(Environment._background.getType(), this._theme);

    }

  }

}


window.onload = () => {
    var main = new Main();
    main.start();
};
