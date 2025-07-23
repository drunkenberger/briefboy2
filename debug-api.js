#!/usr/bin/env node

// Simple diagnostic tool for OpenAI API connection
require('dotenv').config();

const https = require('https');
const util = require('util');

console.log('🔍 BriefBoy API Diagnostics');
console.log('='.repeat(50));

// Check environment variables
console.log('\n📋 Environment Variables:');
console.log(`EXPO_PUBLIC_OPENAI_API_KEY exists: ${!!process.env.EXPO_PUBLIC_OPENAI_API_KEY}`);
// API Key details are hidden for security reasons

// Check if it looks like a valid OpenAI key format
const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
if (!apiKey) {
  console.log('❌ No API key found!');
  process.exit(1);
}

// Basic format validation (details hidden for security)
const isValidFormat = apiKey && apiKey.startsWith('sk-') && apiKey.length > 40;
console.log(`API Key format valid: ${isValidFormat}`);

// Test API connection
console.log('\n🚀 Testing API Connection...');

const testData = JSON.stringify({
  model: 'gpt-4o-mini',
  messages: [
    { role: 'system', content: 'You are a helpful assistant. Respond only with JSON.' },
    { role: 'user', content: 'Return: {"status": "working", "timestamp": "' + new Date().toISOString() + '"}' }
  ],
  max_tokens: 50,
  temperature: 0.1,
  response_format: { type: "json_object" }
});

const options = {
  hostname: 'api.openai.com',
  port: 443,
  path: '/v1/chat/completions',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`,
    'Content-Length': Buffer.byteLength(testData)
  }
};

const req = https.request(options, (res) => {
  console.log(`📡 Status Code: ${res.statusCode}`);
  console.log(`📋 Headers:`, res.headers);
  
  let body = '';
  res.on('data', (chunk) => {
    body += chunk;
  });
  
  res.on('end', () => {
    console.log('\n📄 Raw Response:');
    console.log(body);
    
    if (res.statusCode === 200) {
      try {
        const parsed = JSON.parse(body);
        console.log('\n✅ SUCCESS: API connection working!');
        console.log('📊 Response data:', parsed);
        
        // Test the exact same call structure as the app
        console.log('\n🔬 Testing Whisper API...');
        testWhisperAPI();
      } catch (e) {
        console.log('⚠️  JSON parse error:', e.message);
      }
    } else {
      console.log('❌ FAILED: API returned error status');
      if (res.statusCode === 401) {
        console.log('🔑 Authentication failed - API key might be invalid or expired');
      } else if (res.statusCode === 429) {
        console.log('⏰ Rate limit exceeded');
      } else if (res.statusCode === 403) {
        console.log('🚫 Forbidden - check API key permissions');
      }
    }
  });
});

req.on('error', (error) => {
  console.log('❌ REQUEST ERROR:', error.message);
  console.log('🌐 Check your internet connection');
});

req.write(testData);
req.end();

function testWhisperAPI() {
  // Create a minimal FormData-like test for Whisper
  const boundary = '----formdata-node-' + Math.random();
  const formData = [
    `--${boundary}`,
    'Content-Disposition: form-data; name="model"',
    '',
    'whisper-1',
    `--${boundary}`,
    'Content-Disposition: form-data; name="file"; filename="test.txt"',
    'Content-Type: text/plain',
    '',
    'This is a test file for API validation',
    `--${boundary}--`
  ].join('\r\n');

  const whisperOptions = {
    hostname: 'api.openai.com',
    port: 443,
    path: '/v1/audio/transcriptions',
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
      'Content-Length': Buffer.byteLength(formData)
    }
  };

  console.log('🎤 Testing Whisper endpoint (should fail gracefully)...');
  
  const whisperReq = https.request(whisperOptions, (res) => {
    console.log(`🎤 Whisper Status: ${res.statusCode}`);
    
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => {
      if (res.statusCode === 400) {
        console.log('✅ Whisper API accessible (400 expected for invalid audio)');
      } else if (res.statusCode === 401) {
        console.log('❌ Whisper API authentication failed');
      } else {
        console.log('🎤 Whisper response:', body.substring(0, 200));
      }
    });
  });

  whisperReq.on('error', (error) => {
    console.log('❌ Whisper test error:', error.message);
  });

  whisperReq.write(formData);
  whisperReq.end();
}