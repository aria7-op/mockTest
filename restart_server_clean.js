const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

async function restartServerClean() {
  console.log('🧹 CLEAN SERVER RESTART');
  console.log('=======================');
  console.log('');

  try {
    // 1. Kill any existing Node processes on port 5000
    console.log('1️⃣ Killing existing processes on port 5000...');
    try {
      await execAsync('lsof -ti:5000 | xargs kill -9');
      console.log('✅ Killed existing processes');
    } catch (error) {
      console.log('ℹ️  No existing processes found on port 5000');
    }

    // Wait a moment
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 2. Kill any Node processes that might be running
    console.log('');
    console.log('2️⃣ Checking for Node processes...');
    try {
      const { stdout } = await execAsync('ps aux | grep node | grep -v grep');
      if (stdout.trim()) {
        console.log('📋 Found Node processes:');
        console.log(stdout);
        
        // Kill Node processes related to this project
        try {
          await execAsync('pkill -f "node.*server.js"');
          await execAsync('pkill -f "nodemon"');
          console.log('✅ Killed Node processes');
        } catch (killError) {
          console.log('ℹ️  No specific Node processes to kill');
        }
      } else {
        console.log('ℹ️  No Node processes found');
      }
    } catch (error) {
      console.log('ℹ️  No Node processes found');
    }

    // Wait a moment
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 3. Check if port 5000 is free
    console.log('');
    console.log('3️⃣ Checking port 5000 availability...');
    try {
      await execAsync('lsof -i:5000');
      console.log('❌ Port 5000 is still in use');
      console.log('💡 You may need to manually kill processes or restart your terminal');
    } catch (error) {
      console.log('✅ Port 5000 is free');
    }

    console.log('');
    console.log('🚀 READY TO START SERVER');
    console.log('========================');
    console.log('Now run: npm start');
    console.log('');
    console.log('After server starts successfully, run:');
    console.log('node debug_websocket_connection.js');

  } catch (error) {
    console.error('❌ Error during cleanup:', error.message);
  }
}

restartServerClean();