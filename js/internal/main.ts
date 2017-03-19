/// <reference path="environment.ts"/>
/// <reference path="renderer.ts"/>

"use strict";

class Main{

  private _renderer : Renderer;
  private _environment : Environment;

  constructor(side : number, start : number){
    this._environment = new Environment(side, start);
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

    if(Environment._theme == "night")
      Environment._theme = "day";
    else if(Environment._theme == "day")
      Environment._theme = "night";

    for(var i = 0; i < Environment._squares.length; i++){
      Environment._squares[i].setType(Environment._squares[i].getType());
    }
    Environment._background.setType(Environment._background.getType());
    Environment._backdrop1.setType(Environment._backdrop1.getType());
    Environment._backdrop2.setType(Environment._backdrop2.getType());

    if(Environment._theme == "night"){ // NIGHT
      $("#HUD").css("opacity", "0.7");
      $("#all-holder").css("background", "RGBA(80,70,80,0.25)");
      $("body").css("background", "RGBA(20, 20, 20,1.0)");
      this._renderer.setBackground("0x222222");

    }else{
      this._renderer.setBackground("0xFFFFFF");
      $("#HUD").css("opacity", "1.0");
      $("#all-holder").css("background", "RGBA(255,255,255,1.0)");
      $("body").css("background", "RGBA(200, 200, 200,1.0)");

    }
  }

}


window.onload = () => {
    var main = new Main(6, 15);
    main.start();
};
