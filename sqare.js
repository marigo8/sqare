var background = document.getElementById("background");
var entities = document.getElementById("entities");

var b = background.getContext('2d');
var e = entities.getContext('2d');
var width = background.width, height = background.height;
var cellSize = 128;
var coorWidth = width/cellSize, coorHeight = height/cellSize;
var map = [];

for(var h = 0; h < coorHeight; h++){
  map.push([]);
  for(var w = 0; w < coorWidth; w++){
    map[h].push(0);
  }
}

var blue = "#014c76";
var lightBlue = "#0191e4";
var lighterBlue = "#cdecfe";
var darkBlue = "#013553";

var yellow = "#ff0";
var green = "#0f0";

var left = [-1,0],
up = [0,-1],
right = [1,0],
down = [0,1];

var entityList = [];

// FUNCTIONS
function entity(color,maxBattery,batteryColor){
  this.color = color;
  this.x = 0;
  this.y = 0;
  if(maxBattery){
    this.maxBattery = maxBattery;
    this.battery = maxBattery;
    this.batteryColor = batteryColor;
  }
  this.id = entityList.length;
  entityList.push(this);
}

function coor2cell(num){
  return num*cellSize;
}

function isNotBlank(x,y){
  if(map[x][y] == 1){
    return true;
  }
}
function randCoor(){
  var x, y;
  do{
    x = Math.floor(Math.random()*coorWidth);
    y = Math.floor(Math.random()*coorHeight);
  }while(isNotBlank(x,y));
  return [x,y];
}

function print(id,data){
  document.querySelector("#"+id+" span").innerHTML = data;
}

function drawBattery(ent){
  var x = coor2cell(ent.x);
  var y = coor2cell(ent.y);
  e.fillStyle = ent.batteryColor;
  e.fillText(ent.battery,x+cellSize/2,y+cellSize/2,cellSize);
}
function drawEntity(ent){
  var x = coor2cell(ent.x);
  var y = coor2cell(ent.y);
  e.fillStyle = ent.color;
  e.fillRect(x+cellSize/4,y+cellSize/4,cellSize/2,cellSize/2);
  if(ent.maxBattery){
    drawBattery(ent);
  }
  map[ent.x][ent.y]++;
}
function clearCell(x,y){
  x = coor2cell(x);
  y = coor2cell(y);
  e.clearRect(x,y,cellSize,cellSize);
}
function initEntity(ent,xy){
  ent.x = xy[0];
  ent.y = xy[1];
  drawEntity(ent);
}
function relocateEntity(ent){
  map[ent.x][ent.y]--;
  initEntity(ent,randCoor());
}
function refreshEntity(ent){
  drawEntity(ent);
  map[ent.x][ent.y]--;
}
function move(ent,directions){
  var newX = ent.x + directions[0];
  var newY = ent.y + directions[1];
  
  if(newX >= coorWidth || newX < 0){
    return false;
  }
  if(newY >= coorHeight || newY < 0){
    return false;
  }
  
  clearCell(ent.x,ent.y);
  map[ent.x][ent.y]--;
  ent.x = newX;
  ent.y = newY;
  if(ent.maxBattery){
    ent.battery--;
  }
  drawEntity(ent);
  var collisions = testCollision(ent);
  if(collisions){
    switch(ent){
      case player:
        for(var i = 0, n = collisions.length, collision; i < n; i++){
          collision = collisions[i];
          switch(collision){
            case coin:
              player.coins++;
              relocateEntity(coin);
              print("coins", player.coins);
              break;
            case extraBattery:
              player.battery += player.maxBattery/2;
              if(player.battery > player.maxBattery){
                player.battery = player.maxBattery;
              }
              relocateEntity(extraBattery);
              refreshEntity(ent);
              break;
          }
        }
    }
  }
  player.moves++;
  print("moves", player.moves);
  return true;
}
function testCollision(ent){
  var x = ent.x, y = ent.y;
  if(map[x][y] > 1){
    var array = [];
    for(var i = 0, n = entityList.length, thisEntity; i < n; i++){
      thisEntity = entityList[i];
      if(thisEntity.id != ent.id){
        if(thisEntity.x == x && thisEntity.y == y){
          array.push(thisEntity);
        }
      }
    }
    return array;
  }else{
    return false;
  }
}

function gameOver(){
  var coinsMultiplied = player.coins*1000;
  var movesMultiplied = player.moves*100/2;
  print("resultCoins", player.coins+" (+"+coinsMultiplied+")");
  print("resultMoves", player.moves+" (-"+movesMultiplied+")");
  player.total = coinsMultiplied - movesMultiplied;
  print("resultTotal", player.total);
  document.querySelector("#gameover").style.display = "block";
}

// SETUP

// font
e.font = "32px Helvetica";
e.textAlign = "center";
e.textBaseline = "middle";

// background
b.fillStyle = blue;
b.fillRect(0,0,width,height);

// grid
b.beginPath();
b.lineWidth = 4;
b.strokeStyle = darkBlue;
for(var i = 0; i <= width; i+=cellSize){
  b.moveTo(i,0);
  b.lineTo(i,width);
}
for(var j = 0; j <= height; j+=cellSize){
  b.moveTo(0,j);
  b.lineTo(height,j);
}
b.stroke();


// entities
var player = new entity(lightBlue, coorWidth+coorHeight, lighterBlue);
player.coins = 0;
player.moves = 0;
var coin = new entity(yellow);
var extraBattery = new entity(green);

initEntity(player,[0,0]);
initEntity(coin,randCoor());
initEntity(extraBattery,randCoor());

// EVENT LISTENERS
document.addEventListener("keydown",function(key){
  var direction;
  switch(key.keyCode){
    case 37:
    case 65:
    case 97:
      direction = left;
      break;
    case 38:
    case 87:
    case 119:
      direction = up;
      break;
    case 39:
    case 68:
    case 100:
      direction = right;
      break;
    case 40:
    case 83:
    case 115:
      direction = down;
      break;
  }
  if(player.battery > 0){
    if(direction){
      move(player,direction);
      if(player.battery == 0){
        gameOver();
      }
    }
  }
});
