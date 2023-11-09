'use strict'

import { randomIntFromInterval, switchValues, fromObjToArr } from "./utils.js";

var Game = function () {
  var gameObj = {
    fieldArr: [],
  };
  var roomsArr = [];
  var npcArr = [];
  
  this.initWalls = function (gameObj) {
    var fieldElem = document.getElementById('field');
    var fieldArr = new Array(24);
  
    for (var i = 0; i < 24; ++i) {
      fieldArr[i] = new Array(40);
    }
  
    for (var i = 0; i < 24; ++i) {
      for (var j = 0; j < 40; ++j) {
        var tile = document.createElement('div');
        tile.className = 'tile';
        var wall = document.createElement('div');
        wall.className = 'tileW';
        tile.append(wall);
        fieldElem.append(tile);
        fieldArr[i][j] = {
          node: tile,
          item: 'wall'
        };
      }
    }
  
    gameObj.fieldArr = fieldArr;
  }
  
  this.initRoom = function (arr, room) {
    for (var i = room.y1; i < room.y2; ++i) {
      for (var j = room.x1; j < room.x2; ++j) {
        var wallNode = arr[i][j].node;
  
        if (wallNode.firstChild) {
          wallNode.removeChild(wallNode.firstChild);
          arr[i][j].item = 'tile';
        }
      }
    }
  }
  
  this.checkExistRooms = function (arr, room) {
    var roomBounds = {};
    room.y1 > 0 ? roomBounds.y1 = room.y1 - 1 : roomBounds.y1 = room.y1;
    room.y2 < 23 ? roomBounds.y2 = room.y2 + 1 : roomBounds.y2 = room.y2;
    room.x1 > 0 ? roomBounds.x1 = room.x1 - 1 : roomBounds.x1 = room.x1;
    room.x2 < 39 ? roomBounds.x2 = room.x2 + 1 : roomBounds.x2 = room.x2;

    for (var i = roomBounds.y1; i < roomBounds.y2; ++i) {
      for (var j = roomBounds.x1; j < roomBounds.x2; ++j) {
        if (arr[i][j].item === 'tile') {
          return true;
        }
      }
    }

    return false;
  }

  this.initRooms = function (gameObj) {
    var roomsCount = randomIntFromInterval(5, 10);
  
    for (var i = 0; i < roomsCount; ++i) {
      var roomIsExist = true;

      while (roomIsExist) {
        var room = {
          width: randomIntFromInterval(3, 8),
          height: randomIntFromInterval(3, 8),
          x1: randomIntFromInterval(0, 39),
          y1: randomIntFromInterval(0, 23),
        }
    
        room.x2 = room.x1 + room.height > 39 ? room.x1 - room.height : room.x1 + room.height;
        room.y2 = room.y1 + room.width > 23 ? room.y1 - room.width : room.y1 + room.width;
  
        if (room.x1 > room.x2) {
          switchValues(room, 'x1', 'x2');
        }
      
        if (room.y1 > room.y2) {
          switchValues(room, 'y1', 'y2');
        }

        roomIsExist = this.checkExistRooms(gameObj.fieldArr, room);
      }
  
      roomsArr.push(room);
      this.initRoom(gameObj.fieldArr, room);
    }
  }
  
  this.initHallwayX = function (arr, xPos) {
    for (var i = 0; i < 24; ++i) {
      var wallNode = arr[i][xPos].node;
  
      if (wallNode.firstChild) {
        wallNode.removeChild(wallNode.firstChild);
      }
    }
  }
  
  this.initHallwayY = function (arr, yPos) {
    for (var i = 0; i < 40; ++i) {
      var wallNode = arr[yPos][i].node;
  
      if (wallNode.firstChild) {
        wallNode.removeChild(wallNode.firstChild);
      }
    }
  }
  
  this.initHallwayItems = function (limit) {
    var count = randomIntFromInterval(3, 5);
    var hallwayObj = {};
  
    for (var i = 0; i < count; ++i) {
      do {
        var xPos = randomIntFromInterval(0, limit);
        var xName = `${xPos}`;
      } while (hallwayObj[xName] !== undefined)
  
      hallwayObj[xName] = true;
      hallwayObj[`${xPos + 1}`] = false;
      hallwayObj[`${xPos - 1}`] = false;
    }

    return hallwayObj;
  }

  this.checkUreachableRoom = function (room, xHallArr, yHallArr) {
    for (var i = 0; i < xHallArr.length; ++i) {
      if ((xHallArr[i] >= room.x1) && (xHallArr[i] <= room.x2)) {
        return false;
      }
    }

    for (var i = 0; i < yHallArr.length; ++i) {
      if ((yHallArr[i] >= room.y1) && (yHallArr[i] <= room.y2)) {
        return false;
      }
    }

    return true;
  }
  
  this.checkUreachableRooms = function (roomsArr, xHallArr, yHallArr) {
    for (var i = 0; i < roomsArr.length; ++i) {
      if (this.checkUreachableRoom(roomsArr[i], xHallArr, yHallArr)) {
        return true;
      }
    }

    return false;
  }

  this.initHallways = function (gameObj, roomsArr) {
    do {
      var xHallObj = this.initHallwayItems(39);
      var xHallArr = fromObjToArr(xHallObj);
      
      var yHallObj = this.initHallwayItems(23);
      var yHallArr = fromObjToArr(yHallObj);

      var roomIsUnreacheble = this.checkUreachableRooms(roomsArr, xHallArr, yHallArr);
    } while (roomIsUnreacheble)

    xHallArr.forEach((item) => this.initHallwayX(gameObj.fieldArr, item));
    yHallArr.forEach((item) => this.initHallwayY(gameObj.fieldArr, item));
  }

  this.findEmptyPlace = function (fieldArr) {
    do {
      var xPos = randomIntFromInterval(0, 39);
      var yPos = randomIntFromInterval(0, 23);
    } while (fieldArr[yPos][xPos].item !== 'tile');

    return [xPos, yPos];
  }

  this.createNPC = function (posArr) {
    var npc = {
      pos: posArr,
      healht: 100,
      hitDmg: 10,
      status: 'alive'
    }

    return npc;
  }

  this.initNPCs = function (fieldArr, npcArr) {
    for (var i = 0; i < 10; ++i) {
      var npc = this.createNPC(this.findEmptyPlace(fieldArr));
      console.log(npc);
    }
  }

  this.init = function () {
    this.initWalls(gameObj);
    this.initRooms(gameObj);
    this.initHallways(gameObj, roomsArr);
    this.initNPCs(gameObj.fieldArr, npcArr);
  }
}

var game = new Game();
game.init();
