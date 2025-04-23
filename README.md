# Voice-Controlled Presentation Viewer

A web-based application that allows users to upload and view presentation slides (in PDF format) with voice control support. The app features a clean, modern interface with full-screen capabilities and visual feedback for voice commands.

## Features

- **PDF Upload & Rendering**: Upload and view PDF files directly in the browser
- **Voice Command Navigation**:
  - Say "next" to move to the next slide
  - Say "previous" to go to the previous slide
  - Background noise is automatically filtered out
- **Presentation Controls**:
  - Keyboard navigation with arrow keys
  - On-screen navigation buttons
  - Full-screen mode toggle
- **Visual Feedback**:
  - Current slide indicator
  - Visual command feedback display
  - Voice recognition status indicator
- **Privacy Focused**:
  - All processing happens in the browser
  - No data is sent to external servers

## Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Edge, Safari)
- For voice recognition: a microphone and permission to use it

### Installation

1. Download or clone this repository
2. Open `index.html` in your web browser
   
For optimal performance, serve the files using a local web server:

```bash
# Using Python
python -m http.server

# Or using Node.js with http-server
npx http-server
```

Then open `http://localhost:8000` in your browser.

### Usage

1. Upload a PDF presentation file
2. Click "Start Presentation"
3. Allow microphone access when prompted
4. Use voice commands "next" and "previous" to navigate through slides
5. Alternatively, use on-screen buttons or keyboard arrow keys

## Project Structure

```
voice-controlled-presentation-viewer/
├── index.html               # Landing page + presentation viewer
├── css/
│   └── styles.css           # Styling for layout and UI
├── js/
│   └── script.js            # Core logic: PDF.js, Teachable Machine, voice handling
├── assets/
│   └── audio-model/         # Trained Teachable Machine audio model files
└── README.md                # Project description and instructions
```

## Technical Details

This project uses:
- **PDF.js**: Mozilla's PDF rendering library
- **TensorFlow.js**: For running the speech recognition model
- **Speech Commands**: A pre-trained model for voice recognition
  
For a production application, you would replace the default speech model with a custom Teachable Machine audio model trained for the specific commands.

## Customizing the Voice Model

To use a custom Teachable Machine model:

1. Visit [Teachable Machine](https://teachablemachine.withgoogle.com/)
2. Create a new audio project
3. Train the model with samples for "next", "previous", and "background"
4. Export the model as a TensorFlow.js model
5. Place the exported files in the `assets/audio-model/` directory
6. Update the model URL in the `loadSpeechModel()` function in `script.js`

## License

This project is released under the MIT License.