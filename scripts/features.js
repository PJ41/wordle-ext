function autoCompleteFeature() {
  var buttons = document.querySelector("game-app")
  .shadowRoot.querySelector("game-keyboard")
  .shadowRoot.querySelectorAll("button");

  buttons.forEach((b) => {
    b.addEventListener('click', virtualKeyboardHandler, false);
  });

  document.addEventListener("keydown", realKeyboardHandler, true);
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

  if (rowIdx >= 1 && !gameApp.hardMode) {
    return;
  }

  var keyType = evt.target.getAttribute("data-key");

  switch (keyType) {
    case "↵":
      enterHandler(gameApp);
      break;
    case "←":
      backspaceHandler(gameApp);
      break;
    default:
      letterKeyHandler(gameApp, keyType);
      break;
  }
}

function enterHandler(gameApp) {
  oldIdx = gameApp.rowIndex;
  setTimeout(() => {
    newIdx = document.querySelector("game-app").rowIndex;
    if (newIdx > oldIdx) {
      displayCorrects(gameApp, newIdx)
    }
  }, 1 / Number.MAX_SAFE_INTEGER);
}

function backspaceHandler(gameApp) {
  var rowIdx = gameApp.rowIndex;

  if (rowIdx >= 1) {
    var solution = gameApp.solution;
    current = gameApp.boardState[rowIdx];

    var backspaces = [];
    while (current.length > 0 && current.slice(-1) === solution[current.length-1]) {
      backspaces.push("←");
      current = current.slice(0, -1);
    }

    if (backspaces.length > 0) {
      typeLetters(gameApp, backspaces);
    }
    displayCorrects(gameApp, rowIdx);
  }
}

function letterKeyHandler(gameApp, key) {
  var rowIdx = gameApp.rowIndex;

  if (rowIdx >= 1)
  {
    var solution = gameApp.solution;
    current = gameApp.boardState[rowIdx] + key;

    if (current.length > solution.length) {
      return;
    }

    typeLetters(gameApp, Array(current.length).fill("←"));

    var idx = 0;
    var unoMasCheck = false;
    var letters = [];
    while (current.length > 0 || unoMasCheck) {
      unoMasCheck = false;
      if (current.charAt(0)) {
        letters.push(current.charAt(0));
        current = current.slice(1);
      }
      else if (previousIsCorrect(gameApp, rowIdx, idx)) {
        letters.push(solution[idx]);
      }

      idx++
      if (!(idx >= solution.length) && previousIsCorrect(gameApp, rowIdx, idx)) {
        unoMasCheck = true
      }
    }

    typeLetters(gameApp, letters);
    displayCorrects(gameApp, rowIdx);
  }
}

function displayCorrects(gameApp, rowIdx) {
  if (gameApp.evaluations[rowIdx-1].forEach(e => e === "correct")) {
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

function previousIsCorrect(gameApp, rowIdx, idx) {
  return gameApp.evaluations[rowIdx-1][idx] === "correct";
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
  }, 500);
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
  }, 500);
}

autoCompleteFeature();
