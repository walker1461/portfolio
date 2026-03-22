let sounds = {};
let sequence = [];
let currentStep = 0;
let playing = false;
let bpm = 120;
let interval;
let gridRows = 8;
let gridCols = 16;
let drumNames = ["Kick", "Snare", "Hi-Hat", "Clap", "Cowbell", "Tom", "Open Hat", "Rim"];
let rowClasses = ["kick", "snare", "hihat", "clap", "cowbell", "tom", "openhat", "rim"];
let patternBank = {};
let activePattern = "pattern-1";

function preload() {
    sounds.kick = loadSound('./assets/Max_Kick.wav', () => console.log('Kick loaded'));
    sounds.snare = loadSound('./assets/Max_Snare.wav', () => console.log('Snare loaded'));
    sounds.hihat = loadSound('./assets/Max_ClosedHat.wav', () => console.log('Hi-Hat loaded'));
    sounds.clap = loadSound('./assets/Max_Clap.wav', () => console.log('Clap loaded'));
    sounds.cowbell = loadSound('./assets/Max_Cowbell.wav', () => console.log('Cowbell loaded'));
    sounds.tom = loadSound('./assets/Max_Tom.wav', () => console.log('Tom loaded'));
    sounds.openhat = loadSound('./assets/Max_OpenHat.wav', () => console.log('Open Hat loaded'));
    sounds.rim = loadSound('./assets/Max_Rim.wav', () => console.log('Rim loaded'));
}

function setup() {
    noCanvas();
    setupSequencer();
    setupControls();
    loadPatternBank();
    selectPattern(activePattern); // Start on pattern 1
}

function setupSequencer() {
    const sequencer = document.getElementById('sequencer');
    
    // Initialize the grid
    for (let row = 0; row < gridRows; row++) {
        const label = document.createElement('div');
        label.className = "row-label";
        label.textContent = drumNames[row];
        sequencer.appendChild(label);
        
        // Initialize each row
        sequence[row] = [];
        
        for (let col = 0; col < gridCols; col++) {
            const button = document.createElement('button');
            button.dataset.row = row;
            button.dataset.col = col;
            button.classList.add(rowClasses[row]);
            button.onclick = () => toggleStep(row, col);
            sequencer.appendChild(button);
            
            // All steps begin inactive
            sequence[row][col] = false;
        }
    }
}

function toggleStep(row, col) {
    // Ensure each row is initialized
    if (!sequence[row]) {
        sequence[row] = [];
    }

    // Toggle the step on/off
    sequence[row][col] = !sequence[row][col]; 
    
    // Get the button element
    const button = document.querySelector(`button[data-row="${row}"][data-col="${col}"]`);
    
    // Toggle the active class
    button.classList.toggle('active', sequence[row][col]);
}

function setupControls() {
    const playPauseButton = document.getElementById('play-pause');
    const clearPatternButton = document.getElementById('clear-pattern');
    const savePatternButton = document.getElementById('save-pattern');
    const bpmSlider = document.getElementById('bpm');
    const bpmValue = document.getElementById('bpm-value');

    playPauseButton.onclick = togglePlay;
    clearPatternButton.onclick = clearPattern;
    savePatternButton.onclick = savePattern;
    bpmSlider.oninput = function () {
        bpm = this.value;
        bpmValue.textContent = bpm;
        if (playing) {
            clearInterval(interval);
            startSequence();
        }
    };

    // Setup pattern slot buttons
    const patternSlots = document.querySelectorAll('.pattern-slot');
    patternSlots.forEach(slot => {
        slot.onclick = () => selectPattern(slot.id);
    });
}

function togglePlay() {
    playing = !playing;
    const playPauseButton = document.getElementById('play-pause');
    
    // Change button icon and text based on whether playing or not
    if (playing) {
        playPauseButton.innerHTML = '<i class="fas fa-stop"></i>';
        currentStep = 0; // Reset to the beginning when playing starts
        startSequence();
    } else {
        playPauseButton.innerHTML = '<i class="fas fa-play"></i>';
        clearInterval(interval); // Stop and reset the sequence
        resetStepHighlights();   // Clear any step highlights when stopping
    }
}

function startSequence() {
    const intervalDuration = (60 / bpm) * 1000 / 4; // Apply the bpm
    interval = setInterval(playStep, intervalDuration);
}

function playStep() {
    // Highlight the current step
    resetStepHighlights();
    document.querySelectorAll(`button[data-col="${currentStep}"]`).forEach(button => {
        button.classList.add('highlight');
    });

    // Loop over each row and check if the step is active
    sequence.forEach((row, rowIndex) => {
        if (row[currentStep]) {
            switch (rowIndex) {
                case 0: sounds.kick.play(); break;
                case 1: sounds.snare.play(); break;
                case 2: sounds.hihat.play(); break;
                case 3: sounds.clap.play(); break;
                case 4: sounds.cowbell.play(); break;
                case 5: sounds.tom.play(); break;
                case 6: sounds.openhat.play(); break;
                case 7: sounds.rim.play(); break;
            }
        }
    });

    currentStep = (currentStep + 1) % gridCols;
}

function resetStepHighlights() {
    // Remove highlights
    for (let col = 0; col < gridCols; col++) {
        document.querySelectorAll(`button[data-col="${col}"]`).forEach(button => {
            button.classList.remove('highlight');
        });
    }
}

// Clear the current pattern
function clearPattern() {
    for (let row = 0; row < gridRows; row++) {
        for (let col = 0; col < gridCols; col++) {
            sequence[row][col] = false;
            const button = document.querySelector(`button[data-row="${row}"][data-col="${col}"]`);
            button.classList.remove('active');
        }
    }
}

// Save the current pattern to the selected pattern slot
function savePattern() {
    if (activePattern) {
        patternBank[activePattern] = JSON.parse(JSON.stringify(sequence));
        savePatternBankToLocalStorage();
    } else {
        alert('Please select a pattern slot to save.');
    }
}

// Load the selected pattern slot
function selectPattern(patternId) {

    clearPattern();

    // Load the selected pattern
    if (patternBank[patternId]) {
        sequence = JSON.parse(JSON.stringify(patternBank[patternId]));
    }

    // Ensure all rows are initialized
    for (let row = 0; row < gridRows; row++) {
        if (!sequence[row]) {
            sequence[row] = [];
        }
        for (let col = 0; col < gridCols; col++) {
            if (typeof sequence[row][col] === 'undefined') {
                sequence[row][col] = false;
            }
        }
    }

    applyPatternToUI();

    // Highlight the active pattern
    document.querySelectorAll('.pattern-slot').forEach(slot => {
        slot.classList.remove('active');
    });
    document.getElementById(patternId).classList.add('active');
    activePattern = patternId;
}

// Apply the loaded pattern to the UI
function applyPatternToUI() {
    for (let row = 0; row < gridRows; row++) {
        if (!sequence[row]) {
            sequence[row] = [];
        }

        for (let col = 0; col < gridCols; col++) {
            if (typeof sequence[row][col] === 'undefined') {
                sequence[row][col] = false;
            }

            const button = document.querySelector(`button[data-row="${row}"][data-col="${col}"]`);
            button.classList.toggle('active', sequence[row][col]);
        }
    }
}

// Load the pattern bank from localStorage
function loadPatternBank() {
    const savedBank = JSON.parse(localStorage.getItem('patternBank'));
    if (savedBank) {
        patternBank = savedBank;
    }
}

// Save the pattern bank to localStorage
function savePatternBankToLocalStorage() {
    localStorage.setItem('patternBank', JSON.stringify(patternBank));
}
