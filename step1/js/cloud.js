$(function() {

//Defining canvas area
var $canvasArea = $('#cloud');

//Our namespace
var Cloud = {};

Cloud.init = function(){

  // Main stage element
  this.stage = new Kinetic.Stage({
    container: 'cloud',
    width: $canvasArea.width(),
    height: $canvasArea.height()
  });

  // We create a new layer
  this.layer = new Kinetic.Layer();

  // We add it to the stage
  this.stage.add(this.layer);

  //We create a new text
  var text = new Kinetic.Text({
    x: 0,
    y: 0,
    text: "Hello from Kinetic !",
    fontSize: 18,
    fill: 'black'
  });

  //We add it to the stage
  this.layer.add(text);

  //We draw the stage
  this.stage.draw();
};

// We finally call our function
Cloud.init();
});

