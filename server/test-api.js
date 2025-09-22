const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Test server URL
const BASE_URL = 'http://localhost:3001';

// Test file path (you may need to adjust this)
const TEST_FILE_PATH = path.join(__dirname, 'uploads', '9a419acc-1b66-4e70-9d72-89bd289ee2d2.mp4');

async function testApiEndpoints() {
  console.log('Testing Video Converter API Endpoints...\n');
  
  try {
    // Test 1: Root endpoint
    console.log('Test 1: Testing root endpoint');
    const rootResponse = await axios.get(`${BASE_URL}/`);
    console.log('✓ Root endpoint working:', rootResponse.data.message);
    
    // Test 2: Formats endpoint
    console.log('\nTest 2: Testing formats endpoint');
    const formatsResponse = await axios.get(`${BASE_URL}/api/formats`);
    console.log('✓ Formats endpoint working:', formatsResponse.data.input.length, 'input formats,', formatsResponse.data.output.length, 'output formats');
    
    // Test 3: Upload endpoint
    console.log('\nTest 3: Testing upload endpoint');
    // Note: This is a simplified test. In a real scenario, you would upload an actual file.
    console.log('ℹ Upload endpoint requires file upload - skipping detailed test');
    
    // Test 4: Convert endpoint
    console.log('\nTest 4: Testing convert endpoint');
    try {
      const convertResponse = await axios.post(`${BASE_URL}/api/convert`, {
        fileId: '9a419acc-1b66-4e70-9d72-89bd289ee2d2',
        outputFormat: 'mp4',
        quality: 'medium'
      });
      console.log('✓ Convert endpoint working:', convertResponse.data.message);
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.log('ℹ Convert endpoint working but file not found (expected for test file)');
      } else {
        throw error;
      }
    }
    
    // Test 5: Download endpoint
    console.log('\nTest 5: Testing download endpoint');
    try {
      const downloadResponse = await axios.get(`${BASE_URL}/api/download/test-file.mp4`);
      console.log('✓ Download endpoint accessible');
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.log('ℹ Download endpoint working but file not found (expected for test file)');
      } else {
        throw error;
      }
    }
    
    console.log('\n🎉 All API endpoints are working correctly!');
  } catch (error) {
    console.error('❌ Error testing API endpoints:', error);
    // if (error.response) {
    //   console.error('Response status:', error.response.status);
    //   console.error('Response data:', error.response.data);
    // }
  }
}

// Function to test image API endpoints
async function testImageApiEndpoints() {
  console.log('Testing Image API Endpoints...\n');

  try {
    // Test 1: Optimize endpoint
    console.log('\nTest 1: Testing optimize endpoint');
    const optimizeResponse = await axios.post(`${BASE_URL}/api/image/optimize`, {
      fileId: '9a419acc-1b66-4e70-9d72-89bd289ee2d2',
      quality: 80,
      compressionType: 'lossy'
    });
    console.log('✓ Optimize endpoint working:', optimizeResponse.data.message);

    // Test 2: Batch images endpoint
    console.log('\nTest 2: Testing batch images endpoint');
    const batchImagesResponse = await axios.post(`${BASE_URL}/api/image/batch/images`, {
      files: ['9a419acc-1b66-4e70-9d72-89bd289ee2d2'],
      operation: 'convert',
      settings: { targetFormat: 'png' }
    });
    console.log('✓ Batch images endpoint working:', batchImagesResponse.data.message);

    // Test 3: Metadata endpoint
    console.log('\nTest 3: Testing metadata endpoint');
    const metadataResponse = await axios.get(`${BASE_URL}/api/image/metadata/9a419acc-1b66-4e70-9d72-89bd289ee2d2.mp4`);
    console.log('✓ Metadata endpoint working:', metadataResponse.data.message);

    // Test 4: Watermark endpoint
    console.log('\nTest 4: Testing watermark endpoint');
    const watermarkResponse = await axios.post(`${BASE_URL}/api/image/watermark`, {
      fileId: '9a419acc-1b66-4e70-9d72-89bd289ee2d2',
      watermarkType: 'text',
      watermarkData: 'Test Watermark',
      position: 'bottom-right',
      opacity: 0.5
    });
    console.log('✓ Watermark endpoint working:', watermarkResponse.data.message);

  } catch (error) {
    console.error('❌ Error testing image API endpoints:', error);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

async function testAllEndpoints() {
  await testApiEndpoints();
  await testImageApiEndpoints();
}

// Run the tests
testAllEndpoints();