let wordsDatabase = [
    { english: "Hello", chinese_pinyin: "Nǐ hǎo", chinese_characters: "你好" },
    { english: "Goodbye", chinese_pinyin: "Zàijiàn", chinese_characters: "再见" },
    { english: "Thank you", chinese_pinyin: "Xièxiè", chinese_characters: "谢谢" },
    { english: "Yes", chinese_pinyin: "Shì", chinese_characters: "是" },
    { english: "No", chinese_pinyin: "Bù", chinese_characters: "不" }
];

let selectedWords = [];
let matchedPairs = [];
let score = 0;
let time = 0;
let timerInterval;

const englishColumn = document.getElementById('english-column');
const chinesePinyinColumn = document.getElementById('chinese-pinyin-column');
const chineseCharactersColumn = document.getElementById('chinese-characters-column');
const timerDisplay = document.getElementById('timer');
const scoreDisplay = document.getElementById('score');
const restartBtn = document.getElementById('restart-btn');
const addWordBtn = document.getElementById('add-word-btn');
const downloadBtn = document.getElementById('download-btn');
const uploadWordsButton = document.getElementById('uploadWordsButton');
const uploadWordsInput = document.getElementById('uploadWordsInput');

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function getRandomWords() {
    const shuffledDatabase = [...wordsDatabase];
    shuffleArray(shuffledDatabase);
    return shuffledDatabase.slice(0, 5);
}

function shuffleWordsForColumns(randomWords) {
    const englishWords = randomWords.map(word => word.english);
    const chinesePinyinWords = randomWords.map(word => word.chinese_pinyin);
    const chineseCharactersWords = randomWords.map(word => word.chinese_characters);

    shuffleArray(englishWords);
    shuffleArray(chinesePinyinWords);
    shuffleArray(chineseCharactersWords);

    return { englishWords, chinesePinyinWords, chineseCharactersWords };
}

function createWordElement(word, column) {
    const wordElement = document.createElement('div');
    wordElement.classList.add('word');
    wordElement.textContent = word;
    wordElement.addEventListener('click', () => selectWord(wordElement, column));
    return wordElement;
}

function selectWord(wordElement, column) {
    // Enforce selection order: English -> Chinese (Pinyin) -> Chinese Characters
    if (selectedWords.length === 0 && column !== 'english') {
        alert("Please select a word from the English column first.");
        return;
    }
    if (selectedWords.length === 1 && column !== 'chinese_pinyin') {
        alert("Please select a word from the Chinese (Pinyin) column next.");
        return;
    }
    if (selectedWords.length === 2 && column !== 'chinese_characters') {
        alert("Please select a word from the Chinese Characters column last.");
        return;
    }

    // Only allow selection if the word is not already selected or correct
    if (!wordElement.classList.contains('selected')) {
        wordElement.classList.add('selected');
        selectedWords.push({ word: wordElement.textContent, column, element: wordElement });

        if (selectedWords.length === 3) {
            checkMatch();
        }
    }
}

function checkMatch() {
    const [english, chinese_pinyin, chinese_characters] = selectedWords;

    const match = wordsDatabase.find(word =>
        word.english === english.word &&
        word.chinese_pinyin === chinese_pinyin.word &&
        word.chinese_characters === chinese_characters.word
    );

    if (match) {
        // Correct match
        selectedWords.forEach(selected => {
            selected.element.classList.add('correct');
        });
        score += 10;
        matchedPairs.push(...selectedWords.map(selected => selected.word));
    } else {
        // Incorrect match
        selectedWords.forEach(selected => {
            selected.element.classList.add('incorrect');
        });
        score -= 5;

        // Store references to the selected word elements
        const incorrectElements = selectedWords.map(selected => selected.element);

        // Revert incorrect matches to their original color after 3 seconds
        setTimeout(() => {
            incorrectElements.forEach(element => {
                element.classList.remove('selected', 'incorrect');
            });
        }, 1000); // 1 seconds delay
    }
 
    selectedWords = []; // Reset selected words
    // Update score display
    scoreDisplay.textContent = score;

    // Check if all words are matched
    if (matchedPairs.length === 15) { // 5 words * 3 columns
        clearInterval(timerInterval);
        alert(`Game Over! Your final score is ${score}`);
    }
}

function startTimer() {
    timerInterval = setInterval(() => {
        time++;
        timerDisplay.textContent = time;
    }, 1000);
}

function restartGame() {
    clearInterval(timerInterval);
    time = 0;
    score = 0;
    matchedPairs = [];
    timerDisplay.textContent = time;
    scoreDisplay.textContent = score;
    englishColumn.innerHTML = '';
    chinesePinyinColumn.innerHTML = '';
    chineseCharactersColumn.innerHTML = '';
    initializeGame();
}

function addNewWord() {
    const english = prompt("Enter the English word:");
    if (!english) return;

    const chinese_pinyin = prompt("Enter the Chinese (Pinyin):");
    if (!chinese_pinyin) return;

    const chinese_characters = prompt("Enter the Chinese Characters:");
    if (!chinese_characters) return;

    wordsDatabase.push({ english, chinese_pinyin, chinese_characters });
    alert("New word added to the database!");
}

function downloadWords() {
    const dataStr = JSON.stringify(wordsDatabase, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'words_database.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function uploadWords(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                wordsDatabase = JSON.parse(e.target.result);
                alert("Words database updated!");
                restartGame();
            } catch (error) {
                console.error("Error parsing JSON file:", error);
                alert("Invalid JSON file. Please upload a valid JSON file.");
            }
        };
        reader.readAsText(file);
    }
}

function initializeGame() {
    // Get 5 random words from the database
    const randomWords = getRandomWords();
    // Shuffle the words for each column
    const { englishWords, chinesePinyinWords, chineseCharactersWords } = shuffleWordsForColumns(randomWords);

    // Clear the columns
    englishColumn.innerHTML = '';
    chinesePinyinColumn.innerHTML = '';
    chineseCharactersColumn.innerHTML = '';

    // Populate the columns with shuffled words
    englishWords.forEach(word => {
        englishColumn.appendChild(createWordElement(word, 'english'));
    });
    chinesePinyinWords.forEach(word => {
        chinesePinyinColumn.appendChild(createWordElement(word, 'chinese_pinyin'));
    });
    chineseCharactersWords.forEach(word => {
        chineseCharactersColumn.appendChild(createWordElement(word, 'chinese_characters'));
    });

    startTimer();
}

// Event listeners
restartBtn.addEventListener('click', restartGame);
addWordBtn.addEventListener('click', addNewWord);
downloadBtn.addEventListener('click', downloadWords);
uploadWordsButton.addEventListener('click', () => uploadWordsInput.click());
uploadWordsInput.addEventListener('change', uploadWords);

initializeGame();