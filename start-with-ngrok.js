#!/usr/bin/env node

const ngrok = require('ngrok');
const { spawn } = require('child_process');
const path = require('path');

const PORT = 3000;
const SERVER_SCRIPT = path.join(__dirname, 'server.py');

console.log('🚀 Starting development server with ngrok tunnel...\n');

// Start the Python server in ngrok mode
const serverProcess = spawn('uv', ['run', 'python', SERVER_SCRIPT, '--ngrok'], {
  stdio: 'pipe',
  cwd: __dirname,
  env: {
    ...process.env,
    MISE_ACTIVATE: '1',
    NGROK_MODE: '1'
  }
});

let serverStarted = false;

// Monitor server output
serverProcess.stdout.on('data', (data) => {
  const output = data.toString();
  process.stdout.write(output);

  // Check if server has started
  if (!serverStarted && (output.includes('Running on') || output.includes('Press Ctrl+C'))) {
    serverStarted = true;
    startNgrok();
  }
});

serverProcess.stderr.on('data', (data) => {
  process.stderr.write(data);
});

async function startNgrok() {
  try {
    console.log('\n🌐 Starting ngrok tunnel...');

    // Kill any existing ngrok processes first
    try {
      await ngrok.kill();
      console.log('🔄 Cleaned up existing ngrok sessions');
    } catch (e) {
      // Ignore errors during cleanup
    }

    const url = await ngrok.connect({
      addr: PORT,
      proto: 'http',
      // Basic auth for security (optional)
      // auth: 'user:password'
    });

    console.log('\n' + '='.repeat(60));
    console.log('✅ NGROK TUNNEL ACTIVE');
    console.log('='.repeat(60));
    console.log(`🔗 Public URL: ${url}`);
    console.log(`🏠 Local URL:  http://localhost:${PORT}`);
    console.log('='.repeat(60));
    console.log('\n📱 Access from anywhere using the Public URL above');
    console.log('🔐 Note: This tunnel will remain active while the server is running');
    console.log('\n💡 Press Ctrl+C to stop both server and tunnel\n');

  } catch (err) {
    console.error('\n❌ Failed to start ngrok tunnel:', err.message);

    if (err.message.includes('ERR_NGROK_108') || err.message.includes('simultaneous ngrok agent sessions')) {
      console.log('\n🔧 Another ngrok session is already running!');
      console.log('Solutions:');
      console.log('1. Check ngrok dashboard: https://dashboard.ngrok.com/agents');
      console.log('2. Kill existing sessions: npx ngrok kill');
      console.log('3. Or use the existing tunnel shown in the dashboard');
    } else if (err.message.includes('ERR_NGROK_3004') || err.message.includes('authentication failed')) {
      console.log('\n🔧 Authentication error:');
      console.log('1. Sign up at https://ngrok.com and get your auth token');
      console.log('2. Set auth token: npx ngrok authtoken <YOUR_TOKEN>');
    } else {
      console.log('\n🔧 General troubleshooting:');
      console.log('1. Check your internet connection');
      console.log('2. Verify ngrok installation: npm list ngrok');
      console.log('3. Try manual start: npx ngrok http 3000');
    }
    console.log('\n⚡ Server is still running on http://localhost:' + PORT);
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n\n🛑 Shutting down server and ngrok tunnel...');

  try {
    await ngrok.kill();
    console.log('✅ Ngrok tunnel closed');
  } catch (err) {
    console.log('⚠️  Error closing ngrok tunnel:', err.message);
  }

  serverProcess.kill('SIGTERM');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  try {
    await ngrok.kill();
  } catch (err) {
    // Ignore errors during shutdown
  }
  serverProcess.kill('SIGTERM');
  process.exit(0);
});

// Handle server process exit
serverProcess.on('exit', async (code) => {
  console.log(`\n📋 Server process exited with code ${code}`);
  try {
    await ngrok.kill();
  } catch (err) {
    // Ignore errors during cleanup
  }
  process.exit(code);
});

serverProcess.on('error', (err) => {
  console.error('❌ Failed to start server process:', err);
  process.exit(1);
});