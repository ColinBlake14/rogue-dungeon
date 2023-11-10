'use strict'

import { randomIntFromInterval, switchValues, fromObjToArr } from "./utils.js";

var Game = function () {
  this.gameObj = {
    fieldArr: [],
    status: 'game',
    speed: 1000,
  };

  var roomsArr = [];
  this.npcArr = [];
  
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
      arr[i][xPos].item = 'tile';
  
      if (wallNode.firstChild) {
        wallNode.removeChild(wallNode.firstChild);
      }
    }
  }
  
  this.initHallwayY = function (arr, yPos) {
    for (var i = 0; i < 40; ++i) {
      var wallNode = arr[yPos][i].node;
      arr[yPos][i].item = 'tile';
  
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
      hitDmg: 20,
      status: 'alive',
      moveDirection: 'none',
    }

    return npc;
  }

  this.initNPCs = function (fieldArr, npcArr) {
    for (var i = 0; i < 10; ++i) {
      var npc = this.createNPC(this.findEmptyPlace(fieldArr));
      npcArr.push(npc);
      var npcXPos = npc.pos[0];
      var npcYPos = npc.pos[1];
      var npcNode = document.createElement('div');
      npcNode.className = 'tileE';
      var npcHPNode = document.createElement('div');
      npcHPNode.className = 'health';
      npcHPNode.style.width = '100%';
      npcNode.append(npcHPNode);
      fieldArr[npcYPos][npcXPos].node.append(npcNode);
      fieldArr[npcYPos][npcXPos].item = 'npc';
    }
  }

  this.initPerson = function (fieldArr) {
    var person = {
      pos: this.findEmptyPlace(fieldArr),
      healht: 100,
      hitDmg: 25,
      status: 'alive',
    }

    var personXPos = person.pos[0];
    var personYPos = person.pos[1];
    var personNode = document.createElement('div');
    personNode.className = 'tileP';
    var personHPNode = document.createElement('div');
    personHPNode.className = 'health';
    personHPNode.style.width = '100%';
    personNode.append(personHPNode);
    fieldArr[personYPos][personXPos].node.append(personNode);
    fieldArr[personYPos][personXPos].item = 'person';

    return person;
  }

  this.createItem = function (fieldArr, clName) {
    var itemName = clName === 'tileHP' ? 'HP' : 'Sword';
    var itemPos = this.findEmptyPlace(fieldArr);
    var itemNode = document.createElement('div');
    itemNode.className = clName;
    fieldArr[itemPos[1]][itemPos[0]].node.append(itemNode);
    fieldArr[itemPos[1]][itemPos[0]].item = itemName;
  }

  this.initItems = function (fieldArr) {
    for (var i = 0; i < 2; ++i) {
      this.createItem(fieldArr, 'tileSW');
    }

    for (var i = 0; i < 10; ++i) {
      this.createItem(fieldArr, 'tileHP');
    }
  }

  this.moveItem = function (fieldArr, fromPosArr, toPosArr) {
    var nodeToMove = fieldArr[fromPosArr[1]][fromPosArr[0]].node.firstChild;

    if (nodeToMove) {
      var nodeItemToMove = fieldArr[fromPosArr[1]][fromPosArr[0]].item;
      fieldArr[fromPosArr[1]][fromPosArr[0]].node.removeChild(nodeToMove);
  
      fieldArr[toPosArr[1]][toPosArr[0]].node.append(nodeToMove);
      var nodeItemFrom = fieldArr[toPosArr[1]][toPosArr[0]].item;
      fieldArr[toPosArr[1]][toPosArr[0]].item = nodeItemToMove;
      fieldArr[fromPosArr[1]][fromPosArr[0]].item = nodeItemFrom;
    } else {
      console.log('node have no child', fieldArr[fromPosArr[1]][fromPosArr[0]].node);
    }
  }

  this.deleteItem = function (fieldArr, pos) {
    var nodeToDelete = fieldArr[pos[1]][pos[0]].node.firstChild;

    if (nodeToDelete) {
      fieldArr[pos[1]][pos[0]].node.removeChild(nodeToDelete);
      fieldArr[pos[1]][pos[0]].item = 'tile';
    }
  }

  this.randomizeDirection = function () {
    var num = randomIntFromInterval(0, 3);
    
    switch (num) {
      case 0:
        return 'up';
      case 1:
        return 'right';
      case 2:
        return 'down';
      case 3:
        return 'left';
    }
  }

  this.isItEmpty = function (fieldArr, pos, forWhom) {
    if (pos[1] > 23 || pos[1] < 0) {
      return false;
    }

    if (pos[0] > 39 || pos[0] < 0) {
      return false;
    }

    var posItem = fieldArr[pos[1]][pos[0]].item;

    if (posItem === 'tile') {
      return true;
    }

    if (forWhom === 'person' && (posItem === 'Sword' || posItem === 'HP')) {
      return true;
    }
    
    return false;
  }

  this.checkDirectionToMove = function (fieldArr, pos, dir, forWhom) {
    switch (dir) {
      case 'up':
        if (this.isItEmpty(fieldArr, [pos[0], pos[1] - 1], forWhom)) {
          return [pos[0], pos[1] - 1];
        }

        break;

      case 'right':
        if (this.isItEmpty(fieldArr, [pos[0] + 1, pos[1]], forWhom)) {
          return [pos[0] + 1, pos[1]];
        }

        break;
      
      case 'down':
        if (this.isItEmpty(fieldArr, [pos[0], pos[1] + 1], forWhom)) {
          return [pos[0], pos[1] + 1];
        }

        break;

      case 'left':
        if (this.isItEmpty(fieldArr, [pos[0] - 1, pos[1]], forWhom)) {
          return [pos[0] - 1, pos[1]];
        }

        break;
    }

    return false;
  }

  this.checkIsPossibleToMove = function (fieldArr, npcObj) {
    var npcPos = npcObj.pos;
    var cantMoveCount = 0;

    if (!this.checkDirectionToMove(fieldArr, npcPos, 'up', 'npc')) {
      cantMoveCount++;
    }

    if (!this.checkDirectionToMove(fieldArr, npcPos, 'right', 'npc')) {
      cantMoveCount++;
    }

    if (!this.checkDirectionToMove(fieldArr, npcPos, 'down', 'npc')) {
      cantMoveCount++;
    }

    if (!this.checkDirectionToMove(fieldArr, npcPos, 'left', 'npc')) {
      cantMoveCount++;
    }
    
    return cantMoveCount < 4 ? true : false;
  }

  this.checkIfHitAvaible = function (npcPos, person) {
    var posArr = [];
    posArr.push([npcPos[0], npcPos[1] - 1]);
    posArr.push([npcPos[0] + 1, npcPos[1]]);
    posArr.push([npcPos[0], npcPos[1]  + 1]);
    posArr.push([npcPos[0] - 1, npcPos[1]]);

    for (var i = 0; i < posArr.length; ++i) {
      if (posArr[i][0] === person.pos[0] && posArr[i][1] === person.pos[1]) {
        return true;
      }
    }

    return false;
  }

  this.initNpcMovement = function (gameObj, npcArr, person) {
    if (gameObj.status !== 'game') {
      return;
    }

    setInterval(() => {
      var aliveNpc = 0;

      npcArr.forEach((item) => {
        if (this.checkIsPossibleToMove(gameObj.fieldArr, item) && item.status === 'alive') {
          aliveNpc++;

          if (this.checkIfHitAvaible(item.pos, person)) {
            this.hitNpc(gameObj.fieldArr, item, person);

            if (person.healht <= 0) {
              this.gameOver('GAME OVER');              
            }
          } else {
            do {
              var moveDirection = this.randomizeDirection();
              var newPos = this.checkDirectionToMove(gameObj.fieldArr, item.pos, moveDirection, 'npc');
            } while (!newPos);
    
            this.moveItem(gameObj.fieldArr, item.pos, newPos);
            item.pos = newPos;
          }
        };
      })

      if (aliveNpc === 0) {
        this.gameOver('VICTORY');
      }
    }, gameObj.speed)
  }
  
  this.buttonPressedEvent = function (code, fieldArr, person, npcArr) {
    switch (code) {
      case 'KeyW':
        var newPos = this.checkDirectionToMove(fieldArr, person.pos, 'up', 'person');

        if (newPos) {
          var newPosItem = fieldArr[newPos[1]][newPos[0]].item;
  
          if (newPosItem === 'Sword' || newPosItem === 'HP') {
            this.takeItem(fieldArr, newPos, person);
          }

          this.moveItem(fieldArr, person.pos, newPos);
          person.pos = newPos;
        }

        break;

      case 'KeyD':
        var newPos = this.checkDirectionToMove(fieldArr, person.pos, 'right', 'person');

        if (newPos) {
          var newPosItem = fieldArr[newPos[1]][newPos[0]].item;
  
          if (newPosItem === 'Sword' || newPosItem === 'HP') {
            this.takeItem(fieldArr, newPos, person);
          }

          this.moveItem(fieldArr, person.pos, newPos);
          person.pos = newPos;
        }

        break;

      case 'KeyS':
        var newPos = this.checkDirectionToMove(fieldArr, person.pos, 'down', 'person');

        if (newPos) {
          var newPosItem = fieldArr[newPos[1]][newPos[0]].item;
  
          if (newPosItem === 'Sword' || newPosItem === 'HP') {
            this.takeItem(fieldArr, newPos, person);
          }

          this.moveItem(fieldArr, person.pos, newPos);
          person.pos = newPos;
        }

        break;

      case 'KeyA':
        var newPos = this.checkDirectionToMove(fieldArr, person.pos, 'left', 'person');

        if (newPos) {
          var newPosItem = fieldArr[newPos[1]][newPos[0]].item;
  
          if (newPosItem === 'Sword' || newPosItem === 'HP') {
            this.takeItem(fieldArr, newPos, person);
          }

          this.moveItem(fieldArr, person.pos, newPos);
          person.pos = newPos;
        }

        break;

      case 'Space':
        var topPos = [person.pos[0], person.pos[1] - 1];
        var rightPos = [person.pos[0] + 1, person.pos[1]];
        var botPos = [person.pos[0], person.pos[1]  + 1];
        var leftPos = [person.pos[0] - 1, person.pos[1]];

        npcArr.forEach((npc) => {
          if (npc.pos[0] === topPos[0] && npc.pos[1] === topPos[1]) {
            this.hitNpc(fieldArr, person, npc)
          }

          if (npc.pos[0] === rightPos[0] && npc.pos[1] === rightPos[1]) {
            this.hitNpc(fieldArr, person, npc)
          }

          if (npc.pos[0] === botPos[0] && npc.pos[1] === botPos[1]) {
            this.hitNpc(fieldArr, person, npc)
          }

          if (npc.pos[0] === leftPos[0] && npc.pos[1] === leftPos[1]) {
            this.hitNpc(fieldArr, person, npc)
          }
        })

        break;
    }
  }

  this.initPersonMovement = function (fieldArr, person, npcArr) {
    var keyCodeSet = new Set(['Space', 'KeyW', 'KeyD', 'KeyS', 'KeyA']);

    document.addEventListener('keydown', (function(event) {
      if (keyCodeSet.has(event.code)) {
        this.buttonPressedEvent(event.code, fieldArr, person, npcArr);
      }
    }).bind(this));
  }

  this.hitNpc = function (fieldArr, person, npc) {
    var npcTileNode = fieldArr[npc.pos[1]][npc.pos[0]].node;
    var npcNode = npcTileNode.firstChild;

    if (npcNode) {
      var hpNode = npcNode.firstChild;
      npc.healht -= person.hitDmg;

      if (npc.healht <= 0) {
        this.deleteItem(fieldArr, npc.pos);
        npc.status = 'dead';
      } else {
        hpNode.style.width = `${npc.healht}%`;
      }
    }
  }

  this.takeItem = function (fieldArr, pos, person) {
    var itemTileNode = fieldArr[pos[1]][pos[0]].node;
    var itemName = fieldArr[pos[1]][pos[0]].item;
    var itemChildNode = itemTileNode.firstChild;

    if (itemChildNode) {
      itemTileNode.removeChild(itemChildNode);

      if (itemName === 'HP') {
        person.healht = (person.healht + 20) > 100 ? 100 : person.healht + 20;
        var personTileNode = fieldArr[person.pos[1]][person.pos[0]].node;
        var personNode = personTileNode.firstChild;
        var hpNode = personNode.firstChild;

        hpNode.style.width = `${person.healht}%`;
      } else if (itemName === 'Sword') {
        person.hitDmg += 15;
      }
    }
  }

  this.gameOver = function (text) {
    var fieldElem = document.getElementById('field');
    fieldElem.innerHTML = '';

    var label = document.createElement('h1');
    label.style.margin = 'auto';
    label.style.fontSize = '60px';
    label.innerText = text;
    fieldElem.append(label);
  }

  this.init = function () {
    this.initWalls(this.gameObj);
    this.initRooms(this.gameObj);
    this.initHallways(this.gameObj, roomsArr);
    this.initNPCs(this.gameObj.fieldArr, this.npcArr);
    this.person = this.initPerson(this.gameObj.fieldArr);
    this.initItems(this.gameObj.fieldArr);
    this.initNpcMovement(this.gameObj, this.npcArr, this.person);
    this.initPersonMovement(this.gameObj.fieldArr, this.person, this.npcArr);
  }
}

var game = new Game();
game.init();
