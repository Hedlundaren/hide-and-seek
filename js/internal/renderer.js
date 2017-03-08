"use strict";
var Renderer = (function () {
    function Renderer() {
        this._container = null;
        this.onWindowResize = function (e) {
        };
        this._renderer = PIXI.autoDetectRenderer(540, 540, { backgroundColor: 0x222222 });
        this._container = document.getElementById('canvas');
        this._container.appendChild(this._renderer.view);
        window.addEventListener('resize', this.onWindowResize, false);
    }
    Renderer.prototype.setBackground = function (color) {
        this._renderer.backgroundColor = color;
    };
    Renderer.prototype.render = function () {
        this._renderer.render(Renderer._stage);
    };
    return Renderer;
}());
Renderer._stage = new PIXI.Container();
