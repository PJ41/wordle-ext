function autoCompleteFeature() {
  var gameApp = document.querySelector("game-app");
  var buttons = gameApp
  .shadowRoot.querySelector("game-keyboard")
  .shadowRoot.querySelectorAll("button");

  buttons.forEach((b) => {
    b.addEventListener('click', virtualKeyboardHandler, false);
  });

  document.addEventListener("keydown", realKeyboardHandler, true);

  var rowIdx = gameApp.rowIndex;
  if (rowIdx >= 1) {
    displayCorrects(gameApp, rowIdx);
  }
}

function realKeyboardHandler(evt) {
  evt.stopPropagation();

  var letter = evt.key.toLowerCase();
  switch (letter)
  {
    case "backspace":
    letter = "←";
    break;
    case "enter":
    letter = "↵";
    break;
    default:
    break;
  }

  try {
    document.querySelector("game-app")
    .shadowRoot.querySelector("game-keyboard")
    .shadowRoot.querySelector(`button[data-key=${letter}]`)?.click();
  } catch {}
}

function virtualKeyboardHandler(evt) {
  var gameApp = evt.path[10];

  if (!gameApp.hardMode) {
    return;
  }

  var keyType = evt.target.getAttribute("data-key");

  switch (keyType) {
    case "↵":
      enterHandler(gameApp);
      break;
    case "←":
      backspaceHandler(evt, gameApp);
      break;
    default:
      letterKeyHandler(gameApp, keyType);
      break;
  }
}

function enterHandler(gameApp) {
  setTimeout(() => {
    var rowIdx = gameApp.rowIndex;
      if (rowIdx >= 1) {
        displayCorrects(gameApp, rowIdx);
      }
  }, 1 / Number.MAX_SAFE_INTEGER);
}

function backspaceHandler(evt, gameApp) {
  var rowIdx = gameApp.rowIndex;

  if (rowIdx < 1) {
    return;
  }

  var solution = gameApp.solution;
  currentIdx = gameApp.boardState[rowIdx].length;

  var backspaces = [];
  var clear = false;
  while (currentIdx > 0) {
    currentIdx--;
    if (previousIsCorrect(gameApp, rowIdx, currentIdx)) {
      backspaces.push("←");
      if (currentIdx == 0) {
        clear = true;
      }
    }
    else {
      break;
    }
  }

  if (clear) {
    evt.stopPropagation();
    backspaces = [];
  }

  if (backspaces.length > 0) {
    typeLetters(gameApp, backspaces);
  }
  displayCorrects(gameApp, rowIdx);
}

function letterKeyHandler(gameApp, key) {
  var rowIdx = gameApp.rowIndex;

  if (rowIdx < 1) {
    return;
  }

  var solution = gameApp.solution;
  currentIdx = gameApp.boardState[rowIdx].length;

  var firstCheck = currentIdx === 0 && previousIsCorrect(gameApp, rowIdx, currentIdx);

  if (!firstCheck) {
    currentIdx++;
  }

  var letters = [];
  for (let i = currentIdx; i < solution.length; i++) {
    if (previousIsCorrect(gameApp, rowIdx, i)) {
      console.log("here: " + solution[i]);
      letters.push(solution[i]);
    }
    else {
      break;
    }
  }

  if (firstCheck) {
    letters.unshift("←")
    letters.push(key);
  }

  if (letters.length > 0) {
    typeLetters(gameApp, letters);
  }
  displayCorrects(gameApp, rowIdx);
}

function displayCorrects(gameApp, rowIdx) {
  if (gameApp.evaluations[rowIdx-1].toString() === "correct,correct,correct,correct,correct") {
    return;
  }

  var solution = gameApp.solution;
  var rowTiles = gameApp
  .shadowRoot.querySelectorAll("game-row")[rowIdx]
  .shadowRoot.querySelectorAll("game-tile");

  for (const [i, c] of Object.entries(solution)) {
    if (previousIsCorrect(gameApp, rowIdx, i)) {
      let rowTile = rowTiles[i];
      let tile = rowTile.shadowRoot.querySelector("div[class=tile]");
      setTileLetter(rowTile, c);
      setTileColor(tile);
    }
  };
}

function typeLetters(gameApp, letters) {
  letters.forEach((letter, i) => {
    setTimeout(() => {
      button = gameApp
      .shadowRoot.querySelector("game-keyboard")
      .shadowRoot.querySelector(`button[data-key=${letter}]`);
      button.removeEventListener("click", virtualKeyboardHandler);
      button.click()
      button.addEventListener("click", virtualKeyboardHandler, false);
    }, i / Number.MAX_SAFE_INTEGER);
  });
}

function setTileLetter(rowTile, letter) {
  rowTile.setAttribute("letter", letter);

  var observer = new MutationObserver((mutations) => {
    if (rowTile.getAttribute("letter") !== letter) {
      rowTile.setAttribute("letter", letter);
    }
  });

  observer.observe(rowTile, {attributes: true});

  setTimeout(() => {
    observer.disconnect();
  }, 1000);
}

function setTileColor(tile) {
  tile.setAttribute("data-state", "correct");

  var observer = new MutationObserver((mutations) => {
    if (tile.getAttribute("data-state") !== "correct") {
      tile.setAttribute("data-state", "correct");
    }
  });

  observer.observe(tile, {attributes: true});

  setTimeout(() => {
    observer.disconnect();
  }, 1000);
}

function previousIsCorrect(gameApp, rowIdx, idx) {
  return gameApp.evaluations[rowIdx-1][idx] === "correct";
}

autoCompleteFeature();
