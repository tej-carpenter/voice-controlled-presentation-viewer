// Initialize PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';

// Global variables
let pdfDoc = null;
let pageNum = 1;
let totalPages = 0;
let canvas = document.getElementById('pdf-viewer');
let ctx = canvas.getContext('2d');
let scale = 1.5;
let speechModel = null;
let isRecognizing = false;
let currentFile = null;

// DOM Elements
const fileInput = document.getElementById('presentation-file');
const fileName = document.getElementById('file-name');
const startBtn = document.getElementById('start-btn');
const backBtn = document.getElementById('back-btn');
const prevBtn = document.getElementById('prev-slide');
const nextBtn = document.getElementById('next-slide');
const fullscreenBtn = document.getElementById('fullscreen-btn');
const landingContainer = document.getElementById('landing-container');
const viewerContainer = document.getElementById('viewer-container');
const currentSlideDisplay = document.getElementById('current-slide');
const totalSlidesDisplay = document.getElementById('total-slides');
const commandFeedback = document.getElementById('command-feedback');
const voiceFeedback = document.getElementById('voice-feedback');

// Event Listeners
document.addEventListener('DOMContentLoaded', initApp);

function initApp() {
    fileInput.addEventListener('change', handleFileSelection);
    startBtn.addEventListener('click', startPresentation);
    backBtn.addEventListener('click', exitPresentation);
    prevBtn.addEventListener('click', () => {
        if (pageNum > 1) {
            pageNum--;
            renderPage(pageNum);
            showCommandFeedback("◀️ Previous Slide");
        }
    });
    nextBtn.addEventListener('click', () => {
        if (pageNum < totalPages) {
            pageNum++;
            renderPage(pageNum);
            showCommandFeedback("Next Slide ▶️");
        }
    });
    fullscreenBtn.addEventListener('click', toggleFullscreen);
    
    // Load speech recognition model
    loadSpeechModel();
}

function handleFileSelection(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    currentFile = file;
    fileName.textContent = file.name;
    startBtn.disabled = false;
    
    // If it's a PDF, we can load it directly
    if (file.type === 'application/pdf') {
        const fileReader = new FileReader();
        fileReader.onload = function(event) {
            const typedArray = new Uint8Array(event.target.result);
            loadPdfDocument(typedArray);
        };
        fileReader.readAsArrayBuffer(file);
    } else if (file.name.endsWith('.ppt') || file.name.endsWith('.pptx')) {
        // For PPT/PPTX we'd need conversion, but for this demo we'll just show a message
        fileName.textContent = file.name + " (Note: PowerPoint files need conversion to PDF for best results)";
    }
}

function loadPdfDocument(data) {
    pdfjsLib.getDocument({ data }).promise.then(pdf => {
        pdfDoc = pdf;
        totalPages = pdf.numPages;
        totalSlidesDisplay.textContent = totalPages;
    }).catch(error => {
        console.error("Error loading PDF:", error);
        alert("Error loading PDF. Please try another file.");
    });
}

function startPresentation() {
    if (!currentFile) return;
    
    landingContainer.style.display = 'none';
    viewerContainer.style.display = 'flex';
    
    // If it's not a PDF, we'd handle conversion here
    // But for this demo, we'll just proceed with PDFs
    if (currentFile.type !== 'application/pdf') {
        alert("Please convert your presentation to PDF format for best results.");
        exitPresentation();
        return;
    }
    
    pageNum = 1;
    renderPage(pageNum);
    
    // Start voice recognition
    if (speechModel) {
        startVoiceRecognition();
    }
}

function exitPresentation() {
    viewerContainer.style.display = 'none';
    landingContainer.style.display = 'block';
    
    // Stop voice recognition
    if (isRecognizing) {
        stopVoiceRecognition();
    }
    
    // Exit fullscreen if needed
    if (document.fullscreenElement) {
        document.exitFullscreen();
    }
}

function renderPage(num) {
    if (!pdfDoc) return;
    
    pdfDoc.getPage(num).then(page => {
        const viewport = page.getViewport({ scale });
        
        // Adjust canvas size to match PDF page
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        // Render PDF page into canvas context
        const renderContext = {
            canvasContext: ctx,
            viewport: viewport
        };
        
        page.render(renderContext);
        
        // Update page info
        currentSlideDisplay.textContent = num;
        
        // Apply a slight zoom animation
        canvas.style.transform = 'scale(0.98)';
        setTimeout(() => {
            canvas.style.transform = 'scale(1)';
        }, 100);
    });
}

function toggleFullscreen() {
    if (!document.fullscreenElement) {
        viewerContainer.requestFullscreen().catch(err => {
            console.error(`Error attempting to enable fullscreen: ${err.message}`);
        });
        viewerContainer.classList.add('fullscreen');
    } else {
        document.exitFullscreen();
        viewerContainer.classList.remove('fullscreen');
    }
}

function showCommandFeedback(message) {
    commandFeedback.textContent = message;
    commandFeedback.classList.add('show');
    
    // Hide after 2 seconds
    setTimeout(() => {
        commandFeedback.classList.remove('show');
    }, 2000);
}

// Voice Recognition Functions
async function loadSpeechModel() {
    try {
        // Use absolute path instead of relative
        const URL = window.location.origin + '/assets/audio-model/';
        
        // Create recognizer using your custom model
        const recognizer = await speechCommands.create(
            "BROWSER_FFT",
            undefined,
            URL + 'model.json', 
            URL + 'metadata.json'
        );
        
        await recognizer.ensureModelLoaded();
        speechModel = recognizer;
        
        console.log("Custom speech recognition model loaded");
    } catch (error) {
        console.error("Error loading speech recognition model:", error);
    }
}

async function startVoiceRecognition() {
    if (!speechModel || isRecognizing) return;
    
    isRecognizing = true;
    voiceFeedback.textContent = "Listening...";
    
    // Listen for commands
    speechModel.listen(result => {
        // Get the most likely class
        const scores = result.scores;
        const maxScore = Math.max(...scores);
        const maxScoreIndex = scores.indexOf(maxScore);
        
        // Get the class label from your model
        const commands = speechModel.wordLabels();
        const recognized = commands[maxScoreIndex];
        
        // Check confidence and execute command
        if (maxScore > 0.75) {
            // Use your exact class names from Teachable Machine
            if (recognized === 'next') {
                if (pageNum < totalPages) {
                    pageNum++;
                    renderPage(pageNum);
                    showCommandFeedback("Next Slide ▶️");
                }
            } else if (recognized === 'previous') {
                if (pageNum > 1) {
                    pageNum--;
                    renderPage(pageNum);
                    showCommandFeedback("◀️ Previous Slide");
                }
            }
            // 'background' class is implicitly ignored
            
            // Show feedback
            voiceFeedback.textContent = "Recognized: " + recognized;
            setTimeout(() => {
                voiceFeedback.textContent = "Listening...";
            }, 2000);
        }
    }, {
        includeSpectrogram: false,
        probabilityThreshold: 0.75 // Adjust threshold if needed
    });
}

function stopVoiceRecognition() {
    if (!speechModel || !isRecognizing) return;
    
    speechModel.stopListening();
    isRecognizing = false;
    voiceFeedback.textContent = "Voice control off";
}

// Handle keyboard navigation
document.addEventListener('keydown', (e) => {
    if (viewerContainer.style.display === 'none') return;
    
    if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
        if (pageNum < totalPages) {
            pageNum++;
            renderPage(pageNum);
            showCommandFeedback("Next Slide ▶️");
        }
    } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        if (pageNum > 1) {
            pageNum--;
            renderPage(pageNum);
            showCommandFeedback("◀️ Previous Slide");
        }
    } else if (e.key === 'Escape') {
        exitPresentation();
    } else if (e.key === 'f') {
        toggleFullscreen();
    }
});