// PDF Viewer Variables
let pdfDoc = null;
let currentPage = 1;

// Load and render PDF using PDF.js
function displayPDF(file) {
    const fileReader = new FileReader();

    fileReader.onload = function () {
        const typedArray = new Uint8Array(this.result);

        pdfjsLib.getDocument(typedArray).promise.then(function (pdf) {
            pdfDoc = pdf;
            currentPage = 1;
            renderPage(currentPage);
        });
    };

    fileReader.readAsArrayBuffer(file);
}

function renderPage(num) {
    pdfDoc.getPage(num).then(function (page) {
        const canvas = document.getElementById('pdfViewer');
        const context = canvas.getContext('2d');
        const viewport = page.getViewport({ scale: 1.5 });

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        page.render({
            canvasContext: context,
            viewport: viewport,
        });

        updateSlideIndicator();
    });
}

function goToNextPage() {
    if (pdfDoc && currentPage < pdfDoc.numPages) {
        currentPage++;
        renderPage(currentPage);
    }
}

function goToPreviousPage() {
    if (pdfDoc && currentPage > 1) {
        currentPage--;
        renderPage(currentPage);
    }
}

function updateSlideIndicator() {
    const indicator = document.getElementById('slideIndicator');
    indicator.textContent = `Slide: ${currentPage} / ${pdfDoc.numPages}`;
}

// Voice Command Recognition
let model, recognizer;
const modelURL = "assets/audio-model/";

async function initVoiceRecognition() {
    recognizer = await tmSound.create(modelURL + "model.json", modelURL + "metadata.json");
    await recognizer.ensureModelLoaded();

    recognizer.listen(result => {
        const maxScore = Math.max(...result.scores);
        const index = result.scores.indexOf(maxScore);
        const label = recognizer.wordLabels()[index];

        console.log("Heard:", label);
        handleVoiceCommand(label);
    }, {
        overlapFactor: 0.5,
        probabilityThreshold: 0.85
    });
}

function handleVoiceCommand(command) {
    if (command === "next") {
        goToNextPage();
        showCommandIndicator("Next Slide ▶️");
    } else if (command === "previous") {
        goToPreviousPage();
        showCommandIndicator("Previous Slide ◀️");
    }
}

// Visual feedback for voice commands
function showCommandIndicator(text) {
    const indicator = document.getElementById("commandIndicator");
    indicator.textContent = text;
    indicator.style.opacity = 1;

    setTimeout(() => {
        indicator.style.opacity = 0;
    }, 1500);
}

// Fullscreen mode
function toggleFullScreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
    } else {
        document.exitFullscreen();
    }
}

// Start presentation handler
function startPresentation() {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];

    if (file) {
        const fileExtension = file.name.split('.').pop().toLowerCase();

        if (fileExtension === 'pdf') {
            displayPDF(file);
        } else if (['ppt', 'pptx'].includes(fileExtension)) {
            alert("PPT/PPTX support requires conversion to PDF before upload.");
        } else {
            alert('Unsupported file type');
        }
    }
}

window.onload = initVoiceRecognition;
