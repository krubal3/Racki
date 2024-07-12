var arrCards = new Array();
var arrDiscards = new Array();
var lastId = "";
var lastDrawDisabled = false;

function saveGame() {
  let game = {
    cards: arrCards,
    discards: arrDiscards,
    racks: [],
    currentDiscard: 0,
    currentPlayer: 0,
    drawDisabled: false
  };
  let btnDraw = document.getElementById("btnDraw");
  game.drawDisabled = btnDraw.disabled;
  let arrRacks = new Array();
  for (p = 1; p <= 4; p++) {
    let div = document.getElementById("div" + p);
    if (div.className == "highlight") {
      game.currentPlayer = p;
    }
    for (r = 50; r > 0; r = r - 5) {
      let td = document.getElementById("_" + p + "_" + r);
      let cardNumber = getCardNumber(td);
      let card = {
        player: p,
        row: r,
        cardNumber: cardNumber
      }
      arrRacks.push(card);
    }
  }
  game.racks = arrRacks;
  let td = document.getElementById("discard");
  let cardNumber = getCardNumber(td);
  game.currentDiscard = cardNumber;
  
  localStorage.setItem("game", JSON.stringify(game));
}

function restoreGame() {
  let game = JSON.parse(localStorage.getItem("game"));
  if (game) {
    let btnDraw = document.getElementById("btnDraw");
    btnDraw.disabled = game.drawDisabled;
    arrCards = game.cards;
    arrDiscards = game.discards;
    for (p = 1; p <= 4; p++) {
      let div = document.getElementById("div" + p);
      div.className = "";
      if (game.currentPlayer == p) {
        div.className = "highlight";
      }
      for (r = 50; r > 0; r = r - 5) {
        let td = document.getElementById("_" + p + "_" + r);
        let cardNumber = game.racks.find((card) => card.player == p 
          && card.row == r).cardNumber;
        let divCard = createCard(cardNumber);
        td.innerHTML = "";
        td.appendChild(divCard);
      }
    }
    let td = document.getElementById("discard");
    let divCard = createCard(game.currentDiscard);
    td.innerHTML = "";
    td.appendChild(divCard);
  }
}

function swapCard(cardId) {
  let tdFrom = document.getElementById(cardId);
  let tdTo = document.getElementById("discard");
  let fromCard = tdFrom.innerHTML;
  tdFrom.innerHTML = tdTo.innerHTML;
  tdTo.innerHTML = fromCard;
}

function undo() {
  let td = document.getElementById(lastId);
  if (td) {
    let currentPlayer = td.id.split("_")[1];
    for (p = 1; p <= 4; p++) {
      let div = document.getElementById("div" + p);
      div.className = "";
      if (p == currentPlayer) {
        div.className = "highlight";
      }
    }
    swapCard(lastId, "discard");
  }
  let btnDraw = document.getElementById("btnDraw");
  btnDraw.disabled = lastDrawDisabled;
  lastDrawDisabled = false;
  lastId = "";
  let btnUndo = document.getElementById("btnUndo");
  btnUndo.disabled = true;
  saveGame();
}

function tdClick(td) {
  let p = td.id.split("_")[1];
  let div = document.getElementById("div" + p);
  if (div.className != "highlight") {
    alert("not this player's turn");
  }
  else {
    lastId = td.id;
    swapCard(td.id);
    div.className = "";
    p = parseInt(p, 10) + 1;
    if (p > 4) {
      p = 1;
    }
    div = document.getElementById("div" + p);
    div.className = "highlight";
    let btnDraw = document.getElementById("btnDraw");
    lastDrawDisabled = btnDraw.disabled;
    btnDraw.disabled = false;
    let btnUndo = document.getElementById("btnUndo");
    btnUndo.disabled = false;
    saveGame();
  }
}

function skip() {
  let currentPlayer = 1;
  for (p = 1; p <= 4; p++) {
    let div = document.getElementById("div" + p);
    if (div.className == "highlight") {
      currentPlayer = p;
    }
    div.className = "";
  }
  currentPlayer = currentPlayer + 1;
  if (currentPlayer > 4) {
      currentPlayer = 1;
  }
  let div = document.getElementById("div" + currentPlayer);
  div.className = "highlight";
  lastId = "";
  let btnUndo = document.getElementById("btnUndo");
  btnUndo.disabled = true;
  let btnDraw = document.getElementById("btnDraw");
  btnDraw.disabled = false;
  saveGame();
}

function createCard(cardNumber){
  let div = document.createElement("div");
  div.className = "card";
  let spanNum = document.createElement("span");
  spanNum.className = "cardNumber";
  spanNum.innerHTML = cardNumber;
  spanNum.style.position = "relative";
  spanNum.style.left = (cardNumber * 3) + "px";
  div.appendChild(spanNum);
  return div;
}

function getCardNumber(td) {
  let span = td.getElementsByClassName("cardNumber")[0]
  return span.innerHTML;
}

function drawCard() {
  let td = document.getElementById("discard");
  let discardNum = getCardNumber(td);
  let newCardNum = arrCards.shift();
  arrDiscards.push(discardNum);
  td.innerHTML = "";
  let divNewCard = createCard(newCardNum);
  td.appendChild(divNewCard);
  lastId = "";
  let btnUndo = document.getElementById("btnUndo");
  btnUndo.disabled = true;
  let btnDraw = document.getElementById("btnDraw");
  btnDraw.disabled = true;
  saveGame();
}

function shuffleCards() {
  arrCards = new Array();
  arrDiscards = new Array();
  for (c = 1; c <= 60; c++) {
    arrCards.push(c);
  }
  let currI = arrCards.length;
  while (currI > 0) {
    let randomI = Math.floor(Math.random() * currI);
    currI = currI - 1;
    [arrCards[currI], arrCards[randomI]] = [arrCards[randomI], arrCards[currI]];
  }
}

function dealCards() {

  for (r = 50; r > 0; r = r - 5) {
    for (p = 1; p <= 4; p++) {
      let c = arrCards.shift();
      let td = document.getElementById("_" + p + "_" + r);
      let div = createCard(c);
      td.appendChild(div);
    }
  }
  let c = arrCards.shift();
  let td = document.getElementById("discard");
  let div = createCard(c);
  td.innerHTML = "";
  td.appendChild(div);
  document.getElementById("div1").className = "highlight";
}


function loadRacks(isNewGame = false) {

  for (p = 1; p <= 4; p++) {
    let div = document.getElementById("div" + p);
    div.className = "";
    let table = document.getElementById("tbl" + p);
    table.innerHTML = "";
    let thead = table.createTHead();

    for (r = 50; r > 0; r = r - 5) {
      let row = thead.insertRow();
      let th = document.createElement("th");
      let text = document.createTextNode(r);
      th.appendChild(text);
      row.appendChild(th);
      
      let td = document.createElement("td");
      td.setAttribute("onclick", "tdClick(this);");
      td.id = "_" + p + "_" + r;

      row.appendChild(td);

    }

  }
  
  shuffleCards();
  dealCards();
  if (!isNewGame) {
    restoreGame();
  }
  else {
    let btnDraw = document.getElementById("btnDraw");
    btnDraw.disabled = false;
    lastId = "";
    let btnUndo = document.getElementById("btnUndo");
    btnUndo.disabled = true;
  }
}

addEventListener('load', loadRacks());