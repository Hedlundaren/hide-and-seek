window.onload = function(){
	var renderer = PIXI.autoDetectRenderer(800, 600,{backgroundColor : 0x1099bb});
	var container = document.getElementById('canvas');
	container.appendChild(renderer.view);


					// create the root of the scene graph
					var stage = new PIXI.Container();

					// create a texture from an image path
					var texture = PIXI.Texture.fromImage('textures/blue_sprite.png');

					// create a new Sprite using the texture
					var bunny = new PIXI.Sprite(texture);

					// center the sprite's anchor point
					bunny.anchor.x = 0.5;
					bunny.anchor.y = 0.5;


					// move the sprite to the center of the screen
					bunny.position.x = 200;
					bunny.position.y = 150;

					stage.addChild(bunny);

					// start animating
					animate();
					function animate() {
						var time = Date.now() / 1000;
					    requestAnimationFrame(animate);

					    // just for fun, let's rotate mr rabbit a little
					    bunny.rotation += 0.1;

					    // render the container
					    renderer.render(stage);
					}

}
