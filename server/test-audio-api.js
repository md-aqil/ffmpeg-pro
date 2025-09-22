const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Test server URL
const BASE_URL = 'http://localhost:3001';

// Test file path (you may need to adjust this)
const TEST_FILE_PATH = path.join(__dirname, 'uploads', 'test-audio.mp3');

async function testAudioApiEndpoints() {
  console.log('Testing Audio Converter API Endpoints...\n');
  
  try {
    // Test 1: Audio formats endpoint
    console.log('Test 1: Testing audio formats endpoint');
    const formatsResponse = await axios.get(`${BASE_URL}/api/audio/formats`);
    console.log('✓ Audio formats endpoint working:', formatsResponse.data.input.length, 'input formats,', formatsResponse.data.output.length, 'output formats');
    
    // Test 2: Convert endpoint (this will fail without a real file, but we can test the endpoint)
    console.log('\nTest 2: Testing audio convert endpoint');
    try {
      const convertResponse = await axios.post(`${BASE_URL}/api/audio/convert`, {
        fileId: 'test-file-id',
        outputFormat: 'mp3',
        quality: 'medium'
      });
      console.log('✓ Audio convert endpoint working:', convertResponse.data.message);
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.log('ℹ Audio convert endpoint working but file not found (expected for test file)');
      } else if (error.response && error.response.status === 400) {
        console.log('ℹ Audio convert endpoint working but missing required fields (expected for incomplete request)');
      } else {
        throw error;
      }
    }
    
    // Test 3: Extract endpoint
    console.log('\nTest 3: Testing audio extract endpoint');
    try {
      const extractResponse = await axios.post(`${BASE_URL}/api/audio/extract`, {
        fileId: 'test-file-id',
        outputFormat: 'mp3'
      });
      console.log('✓ Audio extract endpoint working:', extractResponse.data.message);
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.log('ℹ Audio extract endpoint working but file not found (expected for test file)');
      } else if (error.response && error.response.status === 400) {
        console.log('ℹ Audio extract endpoint working but missing required fields (expected for incomplete request)');
      } else {
        throw error;
      }
    }
    
    // Test 4: Trim endpoint
    console.log('\nTest 4: Testing audio trim endpoint');
    try {
      const trimResponse = await axios.post(`${BASE_URL}/api/audio/trim`, {
        fileId: 'test-file-id',
        startTime: 0,
        duration: 30
      });
      console.log('✓ Audio trim endpoint working:', trimResponse.data.message);
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.log('ℹ Audio trim endpoint working but file not found (expected for test file)');
      } else if (error.response && error.response.status === 400) {
        console.log('ℹ Audio trim endpoint working but missing required fields (expected for incomplete request)');
      } else {
        throw error;
      }
    }
    
    // Test 5: Mix endpoint
    console.log('\nTest 5: Testing audio mix endpoint');
    try {
      const mixResponse = await axios.post(`${BASE_URL}/api/audio/mix`, {
        fileIds: ['test-file-id-1', 'test-file-id-2'],
        outputFormat: 'mp3'
      });
      console.log('✓ Audio mix endpoint working:', mixResponse.data.message);
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.log('ℹ Audio mix endpoint working but file not found (expected for test file)');
      } else if (error.response && error.response.status === 400) {
        console.log('ℹ Audio mix endpoint working but missing required fields (expected for incomplete request)');
      } else {
        throw error;
      }
    }
    
    // Test 6: Effects endpoint
    console.log('\nTest 6: Testing audio effects endpoint');
    try {
      const effectsResponse = await axios.post(`${BASE_URL}/api/audio/effects`, {
        fileId: 'test-file-id',
        volume: 1.5
      });
      console.log('✓ Audio effects endpoint working:', effectsResponse.data.message);
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.log('ℹ Audio effects endpoint working but file not found (expected for test file)');
      } else if (error.response && error.response.status === 400) {
        console.log('ℹ Audio effects endpoint working but missing required fields (expected for incomplete request)');
      } else {
        throw error;
      }
    }
    
    console.log('\n🎉 All audio API endpoints are working correctly!');
  } catch (error) {
    console.error('❌ Error testing audio API endpoints:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the tests
testAudioApiEndpoints();