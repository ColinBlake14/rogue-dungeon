'use strict'

export function randomIntFromInterval(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

export function switchValues(obj, arg1, arg2) {
  var c = obj[arg1];
  obj[arg1] = obj[arg2];
  obj[arg2] = c;
}

export function fromObjToArr(obj) {
  var arr = [];

  for (var [pos, isHall] of Object.entries(obj)) {
    if (isHall) {
      arr.push(+pos);
    }
  }

  return arr;
}
