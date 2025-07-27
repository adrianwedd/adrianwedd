module.exports = {
  // Mock audio data for testing purposes
  // This could be base64 encoded audio, or paths to dummy audio files
  // For now, we'll use a simple placeholder.
  sampleAudio: 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAESsAAABAAgAZGF0YQAAAAA=', // A very short, silent WAV file
  
  // Example of how you might structure different music tracks
  musicTracks: {
    cyberpunk: {
      name: 'Cyberpunk Anthem',
      src: 'data:audio/mp3;base64,...' // Placeholder for actual audio data
    },
    ambient: {
      name: 'Ambient Flow',
      src: 'data:audio/mp3;base64,...'
    },
    synthwave: {
      name: 'Synthwave Dream',
      src: 'data:audio/mp3;base64,...'
    },
    mathematical: {
      name: 'Mathematical Harmony',
      src: 'data:audio/wav;base64,...' // Could be procedurally generated
    }
  },

  // Mock data for WebGL shaders if needed for testing visualizer
  shaders: {
    plasma: '// GLSL code for plasma shader',
    kaleidoscope: '// GLSL code for kaleidoscope shader'
  }
};
