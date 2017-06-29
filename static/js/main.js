document.addEventListener('DOMContentLoaded', function() {
  /**
   * Generate card DOM elements and card frontface content(alphabet letters).
   * Randomize all letters and then assign them to all cards.
   * Define card behavior: flip when click or nonmatching, hide when matching, reset when restart the game
   */
  var card = {
    content: (function() {
      var alphabet = [];
      for (var i = 0; i < 26; i++) {
        alphabet.push(String.fromCharCode(65 + i));
      }
      alphabet = alphabet.concat(alphabet);
      return alphabet;
    })(),

    generate: function() {
      var fragment = document.createDocumentFragment();
      for (var j = this.content.length - 2; j >= 0; j--) {
        fragment.appendChild(document.querySelector('[data-type="card"]').cloneNode(true));
      }
      document.querySelector('main').appendChild(fragment);
    },

    randomize: function() {
      var alphabet = Array.from(this.content);
      alphabet.sort(function() {
        return Math.random() - Math.random();
      });
      var cardElements = document.querySelectorAll('[data-type="card"]');
      for (var k = cardElements.length - 1; k >= 0; k--) {
        var alphabetIndex = Math.ceil(k * Math.random());
        cardElements[k].dataset.content = alphabet[alphabetIndex];
        alphabet.splice(alphabetIndex, 1);
        cardElements[k].querySelector('.front').innerHTML = cardElements[k].dataset.content;
      }
    },

    flip: function(element) {
      element.classList.toggle('flipped');
    },

    hide: function(element) {
      element.classList.add('hidden');
    },

    reset: function() {
      var cardElements = document.querySelectorAll('[data-type="card"]');
      Array.from(cardElements).forEach(function(element) {
        element.classList.remove('flipped', 'hidden');
      });
    }
  }

  /**
   * Store clicked cards DOM element in one property.
   * Store hidden cards number to compare with total card numbers, when both numbers are equal, the game is completed.
   * When stored clicked cards number is two, after 0.5s buffer time start to check the matching result.
   * If matching result is true, hide both cards, update hidden cards number; if matching result is false, flip both cards back.
   * Update score. The score is how many rounds of comparisons.
   */
  var processor = {
    chosenCards: [],

    hiddenCardsNumber: 0,

    save: function(element) {
      this.chosenCards.push(element);
    },

    check: function() {
      if (this.chosenCards.length === 2) {
        var result = this.chosenCards[0].dataset.content === this.chosenCards[1].dataset.content;
        setTimeout(function() {
          processor.chosenCards.forEach(function(element) {
            if (result) {
              card.hide(element);
              processor.hiddenCardsNumber++;
            }
            else {
              card.flip(element);
            }
          });
          processor.chosenCards = [];

          score.update();

          if (processor.hiddenCardsNumber === document.querySelectorAll('[data-type="card"]').length) {
            showSuccessMessage();
          }
        }, 500);
      }
    }
  }

  var score = (function() {
    var element = document.querySelector('#scoreNumber');

    function update() {
      element.innerHTML = parseInt(element.innerHTML, 10) + 1;
    }

    function reset() {
      element.innerHTML = 0;
    }

    return {
      update: update,
      reset: reset
    }
  })();

  function showSuccessMessage() {
    alert("Well done!")
  }

  function start() {
    score.reset();
    card.reset();
    card.randomize();
  }

  function init() {
    card.generate();
    start();

    var cardElements = document.querySelectorAll('[data-type="card"]');
    Array.from(cardElements).forEach(function(element) {
      element.addEventListener('click', function() {
        if (processor.chosenCards.length < 2 && !this.classList.contains('flipped')) {
          card.flip(this);
          processor.save(this);
          processor.check();
        }
      })
    });

    document.querySelector('#restartBtn').addEventListener('click', start);
  }

  init();
});