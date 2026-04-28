// test/pipeline.test.js - Simple pipeline integration test
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const API_BASE = 'http://localhost:3001/api';

async function testPipeline() {
  console.log('🧪 Testing Image Pipeline...\n');

  try {
    // Step 1: Upload a test image
    console.log('1️⃣  Uploading test image...');
    const testImagePath = path.join(__dirname, '../client/public/test.png'); // Use existing test image

    if (!fs.existsSync(testImagePath)) {
      console.log('❌ Test image not found at', testImagePath);
      console.log('   Please place a test image at client/public/logo512.png');
      return;
    }

    const formData = new FormData();
    formData.append('file', fs.createReadStream(testImagePath));

    const uploadRes = await axios.post(`${API_BASE}/upload`, formData, {
      headers: formData.getHeaders()
    });

    const { fileId } = uploadRes.data;
    console.log(`   ✅ Uploaded. File ID: ${fileId}\n`);

    // Step 2: Test pipeline with multiple operations
    console.log('2️⃣  Running pipeline with: Resize + Rotate + Brightness...');

    const pipelineOperations = [
      { type: 'resize', width: 200, height: 200 },
      { type: 'rotate', angle: 90 },
      { type: 'brightness', value: 0.2 }
    ];

    const pipelineRes = await axios.post(`${API_BASE}/image/pipeline`, {
      fileId,
      fileName: 'test-image.png',
      operations: pipelineOperations,
      outputFormat: 'png',
      quality: 90
    });

    if (pipelineRes.data.success) {
      console.log(`   ✅ Pipeline succeeded! Output: ${pipelineRes.data.filename}\n`);

      // Step 3: Verify output file exists
      console.log('3️⃣  Verifying output file...');
      const outputPath = path.join(__dirname, `../server/converted/${pipelineRes.data.filename}`);
      if (fs.existsSync(outputPath)) {
        const stats = fs.statSync(outputPath);
        console.log(`   ✅ Output file exists. Size: ${(stats.size / 1024).toFixed(1)} KB\n`);
      } else {
        console.log('   ❌ Output file not found\n');
      }
    } else {
      console.log(`   ❌ Pipeline failed: ${pipelineRes.data.error}\n`);
    }

  } catch (error) {
    console.error('❌ Test failed with error:');
    console.error(error.response?.data || error.message);
  }
}

testPipeline();
