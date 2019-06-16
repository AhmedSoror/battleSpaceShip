window.onload = init;

function init() {
  var fireButton = document.getElementById("fireButton");
  fireButton.onclick = handleFireButton;
  var guessInput = document.getElementById("guessInput");
  guessInput.onkeypress = handleKeyPress;
  model.setPlayerName(prompt("Please enter your name "));
  var numShips = inputNumShips();
  model.setNumShips (numShips * 1);
  model.placeShips();
  addCellHandlers();
  console.log(model.ships);
};

function inputNumShips() {
  var numShips;
  var msg = "Please enter number of ships";
  while (true) {
    numShips = prompt(msg, "1-13");
    if (!isNaN(numShips) && numShips < 14 && numShips > 0)
      break;
    msg = "Please enter a valid number of ships";
  }
  return numShips;
}

function handleFireButton() {
  var guessInput = document.getElementById("guessInput");
  var guess = guessInput.value;
  controller.processGuess(guess);
  guessInput.value = "";

};

function handleKeyPress(e) {
  var fireButton = document.getElementById("fireButton");
  var code = (e.keyCode ? e.keyCode : e.which);
  if (code == 13) { //Enter keycode
    fireButton.click();
    return false;
  }
};

function addCellHandlers() {
  for (var i = 0; i < 7; i++) {
    for (var j = 0; j < 7; j++) {
      var id = i + "" + j;
      var cell = document.getElementById(id);
      // var guess=reversParse(id);
      cell.setAttribute("onclick", "handleCellClick(" + id + ")");
    }
  }
}

function handleCellClick(id) {
  if (id < 9)
    id = "0" + id;
  var guess = reversParse(id);
  controller.processGuess(guess);
}

function parseGuess(guess) {
  if (guess == null || guess.length !== 2) {
    alert("Oops, please enter a letter and a number on the board.");
  } else {
    var alphapet = ["A", "B", "C", "D", "E", "F", "G"];
    var row = alphapet.indexOf(guess.charAt(0));
    var column = guess.charAt(1);
    if (isNaN(row) || isNaN(column)) {
      alert("Oops, that isn't on the board.");
    } else {
      if (row < 0 || row >= model.boardSize || column < 0 || column >= model.boardSize) {
        alert("Oops, that's off the board!");
      } else {
        return (row + column);
      }
    }
  }
  return null;
};

function reversParse(locationIn) {
  var location = "" + locationIn;
  var letter = location[0];
  var character = String.fromCharCode(letter.charCodeAt(0) + 17);
  //console.log(character);
  return (character + location[1]);

}

var view = {

  displayMessage: function(msg) {
    var messageArea = document.getElementById("messageArea");
    messageArea.innerHTML = messageArea.innerHTML + "<br/>" + msg;
  },

  displayHit: function(position) {
    var cell = document.getElementById(position);
    cell.setAttribute("class", "hit");
  },

  displayMiss: function(position) {
    var cell = document.getElementById(position);
    cell.setAttribute("class", "miss");
  }
};

var model = {
  playerName: "",
  boardSize: 7,
  numShips: 0,
  shipsSunk: 0,
  shipLength: 3,
  ships: [],
  setPlayerName: function(name) {
    this.playerName = name;
  },
  setNumShips: function(numShips) {
    this.numShips = numShips;
  },
  setShipLength: function(shipLength) {
    this.shipLength = shipLength;
  },
  isSunk: function(ship) {
    for (var i = 0; i < this.shipLength; i++) {
      if (ship.hits[i] !== "hit")
        return false;
    }
    return true;
  },

  fire: function(guess) {

    for (var i = 0; i < this.ships.length; i++) {
      var ship = this.ships[i];
      var index = ship.locations.indexOf(guess);
      if (index >= 0) {
        if (ship.hits[index] === "hit") // Repeated guess
          return true;

        ship.hits[index] = "hit";
        view.displayHit(guess);
        view.displayMessage("HIT!");
        if (this.isSunk(ship)) {
          this.shipsSunk++;
          view.displayMessage("You sank my ship");
        }
        return true;
      }
    }
    view.displayMessage(reversParse(guess) + "   Miss");
    view.displayMiss(guess);
    return false;
  },
  placeShips: function() {
    var ships = [];
    var locations = [];
    var shipsCreated = 0;
    while (shipsCreated < this.numShips) {
      var shipLocation = this.shipLocation();
      var validLocation = this.isVaildLocation(shipLocation, locations);
      if (validLocation) {
        locations.concat(shipLocation);
        var ship = {
          locations: shipLocation,
          hits: new Array(this.shipLength).fill("")
        };
        ships.push(ship);
        shipsCreated++;
      }
    }
    this.ships = ships;
    // return ships;
  },
  shipLocation: function() {
    var vertical = Math.floor(Math.random() * 2);
    var r0 = Math.floor(Math.random() * 7);
    var c0 = Math.floor(Math.random() * 5);
    var a0 = r0 + '' + c0;
    var shipLocation = [];
    if (vertical) {
      for (var i = 0; i < this.shipLength; i++) {
        var a = (c0 + i) + '' + r0;
        shipLocation.push(a);
      }
    } else {
      for (var i = 0; i < this.shipLength; i++) {
        var a = r0 + '' + (c0 + i);
        shipLocation.push(a);
      }
    }
    return shipLocation;
  },
  isVaildLocation: function(shipLocation, allLocations) {

    for (var i = 0; i < this.shipLength; i++) {
      var position = shipLocation[i];
      var index = allLocations.indexOf(position);
      if (index >= 0) {
        return false;
      }
    }
    return true;
  }
};

var controller = {
  guesses: 0,
  processGuess: function(guess) {
    this.guesses++;
    var location = parseGuess(guess);
    if (location) {
      model.fire(location);
      if (this.winner()) {
        view.displayMessage("You sank all my battleships, in " + this.guesses + " guesses");
        setTimeout(function() {
          alert("holllaaaaaaaaa\n" + model.playerName + " has won ");
        }, 400);
      } else {
        if (this.gameOver())
          alert("Game Over\n " + model.playerName+", Welcome to the loosers group");
      }
    }
  },
  winner: function() {
    return model.shipsSunk === model.numShips;
  },
  gameOver: function() {
    return (!this.winner() && this.guesses === 40);

  }
};
