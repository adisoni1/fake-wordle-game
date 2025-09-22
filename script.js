document.addEventListener('DOMContentLoaded', () => {
    // Obfuscated word: "DURITO" encoded in Base64
    const WORD_TO_GUESS_ENCODED = "RFVSSVRP";
    const WORD_TO_GUESS = atob(WORD_TO_GUESS_ENCODED);
    const WORD_LENGTH = 6;
    const INITIAL_GUESSES = 6;

    const board = document.getElementById('game-board');
    const clearButton = document.getElementById('clear-button');
    const container = document.querySelector('.container');
    const mobileInput = document.getElementById('mobile-input');

    let currentRowIndex = 0;
    let guesses = []; // To store submitted guesses for persistence
    let isGameWon = false;

    function createGrid() {
        board.innerHTML = '';
        for (let i = 0; i < INITIAL_GUESSES; i++) {
            for (let j = 0; j < WORD_LENGTH; j++) {
                const tile = document.createElement('div');
                tile.classList.add('tile');
                tile.id = `tile-${i}-${j}`;
                board.appendChild(tile);
            }
        }
    }

    function addNewRow() {
        for (let j = 0; j < WORD_LENGTH; j++) {
            const tile = document.createElement('div');
            tile.classList.add('tile');
            tile.id = `tile-${currentRowIndex}-${j}`;
            board.appendChild(tile);
        }
    }

    function submitGuess() {
        const currentGuess = mobileInput.value.toUpperCase();
        if (currentGuess.length < WORD_LENGTH) return;

        const guessResult = [];
        const correctLetters = WORD_TO_GUESS.split('');

        currentGuess.split('').forEach((letter, index) => {
            const tile = document.getElementById(`tile-${currentRowIndex}-${index}`);
            let state = 'incorrect';
            if (letter === correctLetters[index]) {
                state = 'correct';
            } else if (correctLetters.includes(letter)) {
                state = 'misplaced';
            }
            tile.classList.add(state);
            guessResult.push({ letter, state });
        });

        guesses.push(guessResult);
        saveGame();

        if (currentGuess === WORD_TO_GUESS) {
            isGameWon = true;
            setTimeout(() => alert('You win!'), 100);
            mobileInput.blur();
            return;
        }

        currentRowIndex++;
        mobileInput.value = '';

        const lastTileId = `tile-${currentRowIndex}-0`;
        if (!document.getElementById(lastTileId)) {
            addNewRow();
        }
    }

    function handleKeyDown(event) {
        if (isGameWon) return;
        if (event.key === 'Enter') {
            submitGuess();
        }
    }

    function handleInput(event) {
        if (isGameWon) return;
        if (event.target.value.length > WORD_LENGTH) {
            event.target.value = event.target.value.slice(0, WORD_LENGTH);
        }

        const text = event.target.value.toUpperCase();

        for (let j = 0; j < WORD_LENGTH; j++) {
            const tile = document.getElementById(`tile-${currentRowIndex}-${j}`);
            if (tile) tile.textContent = text[j] || '';
        }
    }

    function saveGame() {
        localStorage.setItem('wordle-guesses', JSON.stringify(guesses));
    }

    function loadGame() {
        const savedGuesses = JSON.parse(localStorage.getItem('wordle-guesses'));
        if (savedGuesses) {
            guesses = savedGuesses;
            let lastGuessCorrect = false;
            guesses.forEach((guess, rowIndex) => {
                let currentGuessStr = '';
                 while(rowIndex >= document.querySelectorAll('#game-board .tile').length / WORD_LENGTH) {
                    addNewRow();
                }
                guess.forEach((tileData, colIndex) => {
                    const tile = document.getElementById(`tile-${rowIndex}-${colIndex}`);
                    tile.textContent = tileData.letter;
                    tile.classList.add(tileData.state);
                    currentGuessStr += tileData.letter;
                });
                if(currentGuessStr === WORD_TO_GUESS){
                    lastGuessCorrect = true;
                }
            });

            if(lastGuessCorrect){
                isGameWon = true;
            }

            currentRowIndex = guesses.length;
            if (currentRowIndex > 0 && !isGameWon) {
                 while(currentRowIndex >= document.querySelectorAll('#game-board .tile').length / WORD_LENGTH) {
                    addNewRow();
                }
            }
        }
    }

    clearButton.addEventListener('click', (e) => {
        e.stopPropagation();
        if (isGameWon) return;
        mobileInput.value = '';
        mobileInput.dispatchEvent(new Event('input', { bubbles: true }));
    });

    container.addEventListener('click', () => {
        if (!isGameWon) {
            mobileInput.focus();
        }
    });

    mobileInput.addEventListener('keydown', handleKeyDown);
    mobileInput.addEventListener('input', handleInput);

    createGrid();
    loadGame();
});
