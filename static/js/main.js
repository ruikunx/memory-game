document.addEventListener('DOMContentLoaded', function() {
  /**
   * Get layout settings:
   * 1. how many cards
   * 2. how many players
   */
  function getSettings() {
    var cardsNumber = document.querySelector('input[name="cardsNumber"]:checked').getAttribute('value');
    var playersNumber = document.querySelector('input[name="playersNumber"]:checked').getAttribute('value');

    return {
      cardsNumber: cardsNumber,
      playersNumber: playersNumber
    }
  }

  /**
   * Card figures on the face
   * "customFiguresCallback" is optional, can be invoked if wants to use other figures except alphabet
   */
  function generateFigures(cardsNumber, customFiguresCallback) {
    var uniqueFiguresNumber = cardsNumber / 2;

    if (typeof customFiguresCallback === 'function') {
      customFiguresCallback.call(null, uniqueFiguresNumber);
    }
    else {
      var figures = [];
      for (var i = 0; i < uniqueFiguresNumber; i++) {
        figures.push(String.fromCharCode(65 + i));
      }
      figures = figures.concat(figures);
      return figures;
    }
  }

  /**
   * The global state object shared by multiple functions
   */
  var state = {
    chosenCards: [], // Used to store the clicked cards for comparison in each round, the values are also arrays which are corresponding to players

    currentPlayerIndex: 0, // Which player is playing

    hiddenCardsNumber: 0, // Number of removed cards. If this number is equal to the number of total cards, the game is completed.

    totalCardsNumber: 0  // Number of total cards.
  };

  /**
   * If the current player does not successfully remove cards, switch to next player.
   */
  function switchPlayer() {
    var element = document.querySelector('.active[data-type="scoreItem"]');
    element.classList.remove('active');

    var scoreItems = document.querySelectorAll('[data-type="scoreItem"]');
    var siblingElement = element.nextSibling;
    while (siblingElement && siblingElement.nodeType !== 1) {
      siblingElement = siblingElement.nextSibling;
    }
    var nextElement = siblingElement ? siblingElement : scoreItems[0];
    nextElement.classList.add('active');

    state.currentPlayerIndex = Array.from(scoreItems).indexOf(nextElement);
  }

  /**
   * Render the UI including the card layout and player score board
   */
  function initialRender(settings, figures) {
    figures.sort(function() {
      return Math.random() - Math.random();  // Randomize the card figures on the face since initial figures are sorted
    });

    state.hiddenCardsNumber = 0;
    state.totalCardsNumber = settings.cardsNumber;

    var cardFragment = document.createDocumentFragment();
    var cardElement = document.querySelector('[data-type="card"]');
    for (var i = figures.length - 2; i >= 0; i--) {
      cardFragment.appendChild(cardElement.cloneNode(true));
    }
    document.querySelector('#cardBoard').appendChild(cardFragment);

    // Setup card width
    Array.from(document.querySelectorAll('[data-type="card"]')).forEach(function(element) {
      element.style.width = (100 / (settings.cardsNumber / 4) * .93) + '%';
    });

    // Assign the randomized figures to all the cards
    var cardElements = document.querySelectorAll('[data-type="card"]');
    for (var i = cardElements.length - 1; i >= 0; i--) {
      cardElements[i].querySelector('.front').innerHTML = cardElements[i].dataset.content = figures[i];
    }

    // Add extra score panel if the number of players is greater than one
    var scoreFragment = document.createDocumentFragment();
    var scoreItem = document.querySelector('[data-type="scoreItem"]');
    scoreItem.classList.remove('active');
    for (var i = 0; i < settings.playersNumber; i++) {
      state.chosenCards[i] = [];
      if (i > 0) {
        var clonedScoreItem = scoreItem.cloneNode(true);
        clonedScoreItem.querySelector('[data-type="playerName"]').innerHTML = 'Player ' + (i + 1);
        scoreFragment.appendChild(clonedScoreItem);
      }
    };
    document.querySelector('#scoreBoard').appendChild(scoreFragment);
    scoreItem.classList.add('active');
  }

  var card = {
    // Flip the card when clicking the card or the comparing result is false
    flip: function(element) {
      element.classList.toggle('flipped');
    },

    // Hide the card when the comparing result is true
    hide: function(element) {
      element.classList.add('hidden');
    }
  }

  function checkResult(element) {
    // The sub-array (also the value of state.chosenCards) to store the clicked cards in each round for current player
    var chosenCardsForThisPlayer = state.chosenCards[state.currentPlayerIndex];
    chosenCardsForThisPlayer.push(element);

    if (chosenCardsForThisPlayer.length === 2) {
      var result = chosenCardsForThisPlayer[0].dataset.content === chosenCardsForThisPlayer[1].dataset.content;
      // When stored clicked cards number is two, after 0.5s buffer time start to check the matching result.
      setTimeout(function() {
        chosenCardsForThisPlayer.forEach(function(element) {
          if (result) {
            card.hide(element);
            state.hiddenCardsNumber++;
          }
          else {
            card.flip(element);
          }
        });

        if (result) {
          updateScore();
        }
        else {
          switchPlayer();
        }

        chosenCardsForThisPlayer.splice(0, 2);

        if (state.hiddenCardsNumber === state.totalCardsNumber) {
          showSuccessMessage();
        }
      }, 500);
    }
  }

  /**
   * Each time the player successfully remove a pair of cards, this player will add two scores.
   */
  function updateScore() {
    var element = document.querySelector('.active [data-type="scoreNumber"]');
    element.innerHTML = parseInt(element.innerHTML, 10) + 2;
  }

  /**
   * Remove all cloned cards and score panels added by "initialRender" function
   * This is for new rendering when wants to start a new game
   */
  function resetLayout() {
    function removeExtraElements(nodeList) {
      Array.from(nodeList).forEach(function(element, index) {
        if (index > 0) {
          element.remove();
        }
      });
    }
    var cardElements = document.querySelectorAll('[data-type="card"]');
    cardElements[0].classList.remove('flipped', 'hidden');
    removeExtraElements(cardElements);

    var scoreItemElements = document.querySelectorAll('[data-type="scoreItem"]');
    scoreItemElements[0].querySelector('[data-type="scoreNumber"]').innerHTML = 0;
    removeExtraElements(scoreItemElements);
  }

  function showSuccessMessage() {
    alert("Well done!");
  }

  function init() {
    function start() {
      var settings = getSettings();
      var figures = generateFigures(settings.cardsNumber);
      initialRender(settings, figures);
    }

    start();

    // Bind click event to the parent node to listen the clicks on card elements
    document.querySelector('#cardBoard').addEventListener('click', function(event) {
      var targetElement = event.target;
      while (targetElement !== this) {
        if (targetElement.dataset.type === 'card' && !targetElement.classList.contains('hidden')) {
          if (state.chosenCards[state.currentPlayerIndex].length < 2 && !targetElement.classList.contains('flipped')) {
            card.flip(targetElement);
            checkResult(targetElement);
          }
          break;
        }
        else {
          targetElement = targetElement.parentNode;
        }
      }
    });

    document.querySelector('#restartBtn').addEventListener('click', function() {
      resetLayout();
      start();
    });
  }

  init();
});