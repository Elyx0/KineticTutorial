$(function() {


  var TEXT_COLOR = 'white';
  var BLOB_DEFAULT = {r:86,g:86,b:86};
  var BLOB_HOVER = {r:0,g:194,b:151};
  var BLOB_PADDING = 2;
  var BLOB_HOVER_TIME = 0.3;

  var MOVEAROUND_MIN_TIME = 0.5;
  var MOVEAROUND_MAX_TIME = 1;
  var MOVEAROUND_RADIUS = 5;
  var MOVEAROUND_EASING = Kinetic.Easings.EaseIn;

  var LINE_REFRESH_RATE = 50;

  tags = {
    "hello":{
      importance:8,
      related: ["cookies","great"],
      coords: {x:250,y:175}
    },
    "cookies":{
      importance:1,
      related: ["great"],
      coords: {x:50,y:30}
    },
    "great":{
      importance:3,
      related: ["cookies"],
      coords: {x:400,y:200}
    }
  };

//Defining canvas area
var $canvasArea = $('#cloud');

//Our namespace
Cloud = {};

Cloud.init = function(){

  // Main stage element
  this.stage = new Kinetic.Stage({
    container: 'cloud',
    width: $canvasArea.width(),
    height: $canvasArea.height()
  });

  // We create a new layer
  this.layer = new Kinetic.Layer();

  // We create the lines layer
  this.linesLayer = new Kinetic.Layer();

  // We add it to the stage
  this.stage.add(this.linesLayer);
  this.stage.add(this.layer);

  //We build the tags
  this.buildTags();

  //We draw the stage
  this.stage.draw();
};


//Adjusting offsets to be at the center
Cloud.adjustTextOffset =  function(item) {
  item.setOffset({
    x: item.getWidth() / 2,
    y: item.getHeight() / 2
  });
};

Cloud.buildTags = function () {
  for (var item in tags) {
    // We draw out items
    this.buildTag(tags[item],item);
    // We launch the tweening animation
    this.moveAround(tags[item]);
    this.addBindings(tags[item]);
  }
};


Cloud.addBindings =function(tag) {

  tag.group.on('mouseover',function(){
    document.body.style.cursor = 'pointer';
    Cloud.hoverColor(this,BLOB_HOVER);
    tag.tweenAround.pause(); //We pause our movingaround animation
    tag.linesIntervals = []; // We'll need to clear the interval stored here on mouseout
    for(var i=0,len=tag.related.length;i<len;i++) {
      Cloud.drawJunction(tag,tags[tag.related[i]]); // Building junction between 2 Tags
    }
  });

  tag.group.on('mouseout',function(){
    document.body.style.cursor = 'default';
    Cloud.hoverColor(this,BLOB_DEFAULT);
    for (var i=0,len=tag.linesIntervals.length;i<len;i++){
      clearInterval(tag.linesIntervals[i]); //We clear the Intervals
    }
    Cloud.linesLayer.removeChildren();
    Cloud.linesLayer.clear();

    tag.tweenAround.play(); // We replay the movingaround animation
  });
};

Cloud.drawJunction = function(tag1,tag2) {

var line = new Kinetic.Line({
  points: [tag1.group.getX(), tag1.group.getY(), tag2.group.getX(), tag2.group.getY()],
  stroke: 'rgba(0,0,0,0.2)',
  strokeWidth: 1,
  lineJoin: 'round'
});

this.linesLayer.add(line);
line.moveToBottom();
var interval = setInterval(function(){
    line.setPoints([tag1.group.getX(), tag1.group.getY(), tag2.group.getX(), tag2.group.getY()]);
    line.setDashArray([10,Math.ceil(Math.random()*5)]);
    Cloud.linesLayer.draw();
},LINE_REFRESH_RATE);

tag1.linesIntervals.push(interval); // We add it to the lineIntervals array to be cleared out after
};

Cloud.hoverColor = function(tagGroup,color) {
  var blob = tagGroup.children[0]; //Getting the blob from this group
  var tweenColor = new Kinetic.Tween({
    node: blob,
    duration: BLOB_HOVER_TIME,
      fillR: color.r, // We need to animate the RGB colors separately
      fillG: color.g,
      fillB: color.b
    });
  tweenColor.play();
};

Cloud.randomBetween = function(min,max){
  return (Math.random() * max) + min;
};

Cloud.moveAroundCoords = function(value){
  return value + Cloud.randomBetween(-MOVEAROUND_RADIUS,MOVEAROUND_RADIUS);
};

Cloud.moveAround = function(tag) {
  tag.tweenAround = new Kinetic.Tween({
    node: tag.group, //Moving the group of shapes linked to the tag
    duration: Cloud.randomBetween(MOVEAROUND_MIN_TIME,MOVEAROUND_MAX_TIME),
    easing: MOVEAROUND_EASING,
    x: Cloud.moveAroundCoords(tag.coords.x),
    y: Cloud.moveAroundCoords(tag.coords.y),
    onFinish: function() {
      Cloud.moveAround(tag); //Animate again
    }
  });
  tag.tweenAround.play();
};

Cloud.buildTag = function(tag,name){
  //Text coordinates are now 0,0 , the Kinetic.group will be in charge of the coordinates
  // so we can move both the text + the blob in one block.
  var simpleText = new Kinetic.Text({
    x: 0,
    y: 0,
    text: name.toUpperCase(),
    fontSize: 10*(1+tag.importance/6),
    name: name,
    fontFamily: 'cabinregular',
    padding: 10,
    fill: TEXT_COLOR
  });

  Cloud.adjustTextOffset(simpleText);

  var padding = BLOB_PADDING;

  //Building the blob shape around it with 4 points
  var blob = new Kinetic.Blob({
    points: [{
        x: (simpleText.getX()-simpleText.getWidth() /2)-padding, //Left
        y: simpleText.getY() //Middle
      },
      {
        x: simpleText.getX(), //Middle 
        y: (simpleText.getY()-simpleText.getHeight() /2)-padding*1.7 //Top Padding
      },
      // 2 points top done, moving to bottom.
      {
        x: (simpleText.getX()+simpleText.getWidth() /2)+padding, //Right
        y: simpleText.getY() //Middle
      },
      {
        x: simpleText.getX(), //Middle 
        y: (simpleText.getY()+simpleText.getHeight() /2)+padding*1.7 //Bottom Padding
      }],
      strokeEnabled: false,
      fillRGB: BLOB_DEFAULT,
      tension: 1,
      height: simpleText.getHeight() + padding*1.7*2,
      width: simpleText.getWidth() + padding*2
    });

  //Our group will be the size of our blob shape
  var group = new Kinetic.Group({
    x:tag.coords.x,
    y:tag.coords.y,
    height:blob.getHeight(),
    width:blob.getWidth()
  });

  //We add our blob & text to the group
  group.add(blob);
  group.add(simpleText);
  //We store the group object in the initial tags object for further use
  tag.group = group;
  this.layer.add(group);
};

WebFont.load({
  custom: { families: ['cabinregular'],
  urls: [ './styles.css' ] },
  active: function(){
        // We finally call our function
        Cloud.init();
      }
    });

});

