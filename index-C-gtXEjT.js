// Audio context and analyzer setup
let audioContext;
let analyser;
let microphone;
let isRecording = false;
let animationFrameId;

// DOM elements
const startButton = document.getElementById('startButton');
const stopButton = document.getElementById('stopButton');
const frequencyCanvas = document.getElementById('frequencyCanvas');
const volumeBar = document.getElementById('volumeBar');
const volumeValue = document.getElementById('volumeValue');
const peakFrequencyElement = document.getElementById('peakFrequency');
const averageVolumeElement = document.getElementById('averageVolume');

// Canvas context
const frequencyCtx = frequencyCanvas.getContext('2d');

// Set canvas dimensions with device pixel ratio for sharper rendering
function setupCanvas() {
  const dpr = window.devicePixelRatio || 1;
  const rect = frequencyCanvas.getBoundingClientRect();
  
  frequencyCanvas.width = rect.width * dpr;
  frequencyCanvas.height = rect.height * dpr;
  
  frequencyCtx.scale(dpr, dpr);
  frequencyCtx.translate(0, frequencyCanvas.height / dpr);
  frequencyCtx.scale(1, -1); // Flip the y-axis to make bars grow upward
}

// Initialize the audio context
function initAudio() {
  audioContext = new (window.AudioContext || window.webkitAudioContext)();
  analyser = audioContext.createAnalyser();
  
  // Configure analyzer
  analyser.fftSize = 2048;
  analyser.smoothingTimeConstant = 0.85;
  
  setupCanvas();
}

// Start recording from microphone
async function startRecording() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
    
    microphone = audioContext.createMediaStreamSource(stream);
    microphone.connect(analyser);
    
    isRecording = true;
    startButton.disabled = true;
    stopButton.disabled = false;
    
    visualize();
  } catch (error) {
    console.error('Error accessing microphone:', error);
    alert('Error accessing microphone: ' + error.message);
  }
}

// Stop recording
function stopRecording() {
  if (microphone) {
    microphone.disconnect();
    microphone = null;
  }
  
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }
  
  isRecording = false;
  startButton.disabled = false;
  stopButton.disabled = true;
  
  // Reset visualizations
  resetVisualizations();
}

// Reset all visualizations
function resetVisualizations() {
  // Clear frequency canvas
  const width = frequencyCanvas.width / window.devicePixelRatio;
  const height = frequencyCanvas.height / window.devicePixelRatio;
  frequencyCtx.clearRect(0, 0, width, height);
  
  // Reset volume meter
  volumeBar.style.height = '0%';
  volumeValue.textContent = '0 dB';
  
  // Reset stats
  peakFrequencyElement.textContent = '0 Hz';
  averageVolumeElement.textContent = '0 dB';
}

// Main visualization function
function visualize() {
  if (!isRecording) return;
  
  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);
  
  // Get frequency data
  analyser.getByteFrequencyData(dataArray);
  
  // Draw frequency spectrum
  drawFrequencySpectrum(dataArray, bufferLength);
  
  // Update volume meter
  updateVolumeMeter(dataArray);
  
  // Update statistics
  updateStats(dataArray, bufferLength);
  
  // Continue animation loop
  animationFrameId = requestAnimationFrame(visualize);
}

// Draw frequency spectrum on canvas
function drawFrequencySpectrum(dataArray, bufferLength) {
  const width = frequencyCanvas.width / window.devicePixelRatio;
  const height = frequencyCanvas.height / window.devicePixelRatio;
  
  // Clear previous drawing
  frequencyCtx.clearRect(0, 0, width, height);
  
  // Calculate bar width based on canvas size and buffer length
  // We'll only display a portion of the frequency spectrum for better visualization
  const displayBars = Math.min(bufferLength / 4, width / 2);
  const barWidth = width / displayBars;
  
  // Draw each frequency bar
  for (let i = 0; i < displayBars; i++) {
    const barHeight = (dataArray[i] / 255) * height;
    
    // Create gradient for bars
    const gradient = frequencyCtx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#4a90e2');
    gradient.addColorStop(0.5, '#5cb85c');
    gradient.addColorStop(1, '#f0ad4e');
    
    frequencyCtx.fillStyle = gradient;
    frequencyCtx.fillRect(i * barWidth, 0, barWidth - 1, barHeight);
  }
}

// Update volume meter
function updateVolumeMeter(dataArray) {
  // Calculate average volume from frequency data
  const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
  
  // Convert to percentage for the volume bar
  const volumePercent = (average / 255) * 100;
  
  // Update volume bar height
  volumeBar.style.height = `${volumePercent}%`;
  
  // Calculate approximate dB value (simplified)
  // This is a rough approximation: 0-255 scale to dB scale
  const dbValue = average === 0 ? -100 : 20 * Math.log10(average / 255);
  const displayDb = dbValue < -60 ? '-∞' : dbValue.toFixed(1);
  
  // Update volume text
  volumeValue.textContent = `${displayDb} dB`;
  
  // Add visual feedback for loud sounds
  if (volumePercent > 80) {
    volumeBar.style.backgroundColor = '#dc3545'; // Red for loud sounds
  } else if (volumePercent > 60) {
    volumeBar.style.backgroundColor = '#f0ad4e'; // Yellow for medium sounds
  } else {
    volumeBar.style.backgroundColor = '#4a90e2'; // Blue for soft sounds
  }
}

// Update statistics
function updateStats(dataArray, bufferLength) {
  // Find peak frequency
  let peakIndex = 0;
  let peakValue = 0;
  
  for (let i = 0; i < bufferLength; i++) {
    if (dataArray[i] > peakValue) {
      peakValue = dataArray[i];
      peakIndex = i;
    }
  }
  
  // Convert index to frequency (Hz)
  // Formula: frequency = index * sampleRate / fftSize
  const peakFrequency = Math.round(peakIndex * audioContext.sampleRate / (analyser.fftSize));
  
  // Calculate average volume
  const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
  const dbValue = average === 0 ? -100 : 20 * Math.log10(average / 255);
  const displayDb = dbValue < -60 ? '-∞' : dbValue.toFixed(1);
  
  // Update display elements
  peakFrequencyElement.textContent = `${peakFrequency} Hz`;
  averageVolumeElement.textContent = `${displayDb} dB`;
}

// Event listeners
startButton.addEventListener('click', () => {
  // Initialize audio context on first click (to handle autoplay policy)
  if (!audioContext) {
    initAudio();
  } else if (audioContext.state === 'suspended') {
    audioContext.resume();
  }
  
  startRecording();
});

stopButton.addEventListener('click', stopRecording);

// Handle window resize
window.addEventListener('resize', () => {
  if (audioContext) {
    setupCanvas();
    if (isRecording) {
      // Redraw visualizations after resize
      visualize();
    }
  }
});

// Initialize canvas on page load
window.addEventListener('load', () => {
  setupCanvas();
});

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
  if (document.hidden && isRecording) {
    // Pause visualization when tab is not visible to save resources
    cancelAnimationFrame(animationFrameId);
  } else if (!document.hidden && isRecording) {
    // Resume visualization when tab becomes visible again
    visualize();
  }
});

// Handle errors
window.addEventListener('error', (event) => {
  console.error('Application error:', event.error);
  if (isRecording) {
    stopRecording();
  }
});