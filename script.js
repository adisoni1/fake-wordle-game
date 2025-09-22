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
    let currentColIndex = 0;
    let guesses = []; // To store submitted guesses for persistence
    let isGameWon = false;

    // Function to create the initial grid
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
        if (currentColIndex < WORD_LENGTH) return; // Don't submit incomplete words

        let guess = '';
        for (let j = 0; j < WORD_LENGTH; j++) {
            const tile = document.getElementById(`tile-${currentRowIndex}-${j}`);
            guess += tile.textContent;
        }

        guess = guess.toUpperCase();
        const guessResult = [];
        const correctLetters = WORD_TO_GUESS.split('');

        // Color the tiles based on the guess
        guess.split('').forEach((letter, index) => {
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

        if (guess === WORD_TO_GUESS) {
            isGameWon = true;
            setTimeout(() => alert('You win!'), 100);
            mobileInput.blur(); // Hide keyboard
            return;
        }

        currentRowIndex++;
        currentColIndex = 0;
        mobileInput.value = ''; // Clear input for next guess

        const lastTileId = `tile-${currentRowIndex}-0`;
        if (!document.getElementById(lastTileId)) {
            addNewRow();
        }
    }

    function handleKeyPress(key) {
        if (isGameWon) return;

        if (key === 'Enter') {
            submitGuess();
        } else if (key === 'Backspace') {
            if (currentColIndex > 0) {
                currentColIndex--;
                const tile = document.getElementById(`tile-${currentRowIndex}-${currentColIndex}`);
                tile.textContent = '';
                mobileInput.value = mobileInput.value.slice(0, -1);
            }
        } else if (/^[a-zA-Z]$/.test(key)) {
            if (currentColIndex < WORD_LENGTH) {
                const tile = document.getElementById(`tile-${currentRowIndex}-${currentColIndex}`);
                tile.textContent = key.toUpperCase();
                mobileInput.value += key.toUpperCase();
                currentColIndex++;
            }
        }
    }

    function handleMobileInput(event) {
        if (isGameWon) return;
        const text = event.target.value.toUpperCase();

        // Clear the current row first
        for (let j = 0; j < WORD_LENGTH; j++) {
            const tile = document.getElementById(`tile-${currentRowIndex}-${j}`);
            if(tile) tile.textContent = '';
        }
        // Repopulate with the new text
        for (let j = 0; j < text.length; j++) {
            const tile = document.getElementById(`tile-${currentRowIndex}-${j}`);
            if(tile) tile.textContent = text[j];
        }
        currentColIndex = text.length;
    }

    // --- Persistence ---
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
                // Ensure enough rows exist
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

    // --- Event Listeners ---
    clearButton.addEventListener('click', (e) => {
        e.stopPropagation(); // prevent container click event
        if (isGameWon) return;
        for (let j = 0; j < WORD_LENGTH; j++) {
            const tile = document.getElementById(`tile-${currentRowIndex}-${j}`);
            if (tile) tile.textContent = '';
        }
        currentColIndex = 0;
        mobileInput.value = '';
    });

    container.addEventListener('click', () => {
        if (!isGameWon) {
            mobileInput.focus();
        }
    });

    document.addEventListener('keydown', (e) => handleKeyPress(e.key));
    mobileInput.addEventListener('input', handleMobileInput);

    // Initialize the game
    createGrid();
    loadGame();
});
