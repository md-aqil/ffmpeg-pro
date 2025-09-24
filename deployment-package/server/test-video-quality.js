const path = require('path');
const { convertVideo } = require('./services/ffmpegService');

// Test file paths (update these to match your actual test files)
const testInputFile = path.join(__dirname, 'uploads', 'test-video.mp4');
const testOutputFormat = 'mp4';

// Test different quality presets
async function testQualityPresets() {
  const qualities = ['low', 'medium', 'high', 'ultra'];
  
  for (const quality of qualities) {
    try {
      console.log(`Testing ${quality} quality conversion...`);
      
      const outputPath = await convertVideo(
        testInputFile,
        testOutputFormat,
        quality
      );
      
      console.log(`${quality} quality conversion completed: ${outputPath}`);
    } catch (error) {
      console.error(`Error converting with ${quality} quality:`, error.message);
    }
  }
}

// Test custom dimensions
async function testCustomDimensions() {
  try {
    console.log('Testing custom dimensions conversion...');
    
    const outputPath = await convertVideo(
      testInputFile,
      testOutputFormat,
      'medium',
      1280, // width
      720   // height
    );
    
    console.log(`Custom dimensions conversion completed: ${outputPath}`);
  } catch (error) {
    console.error('Error converting with custom dimensions:', error.message);
  }
}

// Run tests
async function runTests() {
  console.log('Starting video quality tests...');
  
  // Test quality presets
  await testQualityPresets();
  
  // Test custom dimensions
  await testCustomDimensions();
  
  console.log('All tests completed.');
}

// Run the tests if this file is executed directly
if (require.main === module) {
  runTests();
}

module.exports = { testQualityPresets, testCustomDimensions };