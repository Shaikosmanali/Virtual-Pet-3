var dog, happyimg,normalimg,runright, database,  foodStock;
var feed,add;
var lastfed;
var foodobj,readState;
var call;
var front,stockImg;
var gardenimg,bedroomimg,washroomimg;

function preload(){
  normalimg=loadAnimation("dogImg.png");
  run=loadAnimation("img/runningLeft.png","dogImg1.png");
  stockImg=loadImage("img/FoodStock.png");
  gardenimg=loadImage("img/Garden.png");
  bedroomimg=loadImage("img/Bed Room.png");
  washroomimg=loadImage("img/Wash Room.png");
}

function setup() {
  createCanvas(800, 700);

  database = firebase.database();

  foodStock = database.ref('food');
  foodStock.on("value",readstock);
  foodobj = new Food();

  readState=database.ref('gameState');
  readState.on("value",function (data){
    gameState=data.val()
  })
 
  call=new Form();

  front=createSprite(500,400,0,0);
  front.addImage(stockImg);
  front.scale=0.12;
  front.visible=false;

  dog=createSprite(600,400,150,150);
  dog.addAnimation("run",run);
  dog.addAnimation("normal",normalimg);
  dog.scale=0.2;
  
  feed  = createButton("FEED THE DOG");
  feed.position(700,70);
  if(foodStock===0){
    feed.mousePressed(error);
  }else{
    feed.mousePressed(feeddog);
  }

  add  =  createButton("ADD FOOD");
  add.position(600,70);
  add.mousePressed(addfoods);
}


function draw() {  
  background(46, 139, 87);
  fill("red");
  foodobj.display();
  call.display();
  
  front.display();

  if(foodStock<=0){
    foodStock=0;
    dog.addImage(normalimg);
    front.visible=false;
  }
  
  fedtime=database.ref('feedtime');
  fedtime.on("value",function(data){
   lastfed=data.val();
  })
  textSize(16);
  stroke(0);

  currentTime=hour();
  if(currentTime==(lastfed+1)){
    update("Playing");
    foodobj.garden();
    text("STATUS :Stomach Full"+status,550,550);
 }else if(currentTime==(lastfed+2)){
  update("Sleeping");
    foodobj.bedroom();
    text("STATUS :Half filled Stomach"+status,550,550);
 }else if(currentTime>(lastfed+2) && currentTime<=(lastfed+3)){
  update("Bathing");
    foodobj.washroom();
    text("STATUS :Half filled Stomach"+status,550,550);
 }else if(currentTime===lastfed){
   update("Run");
   dog.changeAnimation("run",run); 
   text("STATUS :Stomach Full"+status,550,550);
 }else{
  update("Hungry")
  status==="Hungry";
  foodobj.display();
  text("STATUS :Hungry"+status,550,550);
 }
 
 if(gameState!="Hungry"){
  add.hide();
  feed.hide();
 }else if(gameState==="Hungry"){
   dog.addAnimation("normal",normalimg);
   add.show();
   feed.show();
  dog.changeAnimation("normal",normalimg);
  text("Your pet is hungry",300,300)
 }else if(gameState!="run"&&gameState==="Hungry"){
  dog.remove();
 }

 text("Food Remaing :"+foodStock,350,100);
  if(lastfed>=12){
    text("LAST FED TIME  : "+lastfed%12+"PM",50,100);
  }else if(lastfed===0){
    text("LAST FED TIME : 12AM",50,100)
  }else{
    text("LAST FED TIME :"+lastfed+"AM",50,100);
  }

  fill("red");
  text("STATUS :"+status,550,550);
  drawSprites();

}

function readstock(data){
  foodStock = data.val();
  foodobj.updatefoodstock(foodStock);
}
function addfoods(){
  
  foodStock++
  front.visible=false;
  dog.addImage(normalimg);
  database.ref('/').update({
    food:foodStock
  })

}

function feeddog(){
  
  foodobj.updatefoodstock(foodStock-1);
  front.visible=true;
  database.ref('/').update({
    food:foodobj.getfoodstock(),
    feedtime:hour()

  })
}

function update(state){
  database.ref('/').update({
    gameState:state
  })
}

function error(){
  text("NO FOOD LEFT FOR THE PET",400,400);
}