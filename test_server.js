require('dotenv').config();

async function testServer() {
  try {
    console.log('Testing server startup...');
    
    // Test database connection
    const database = require('./src/config/database');
    console.log('Database config loaded');
    
    await database.connect();
    console.log('Database connected');
    
    // Test logger
    const logger = require('./src/config/logger');
    console.log('Logger loaded');
    
    logger.info('Test log message');
    console.log('Logger working');
    
    // Test basic express app
    const express = require('express');
    const app = express();
    console.log('Express app created');
    
    app.get('/test', (req, res) => {
      res.json({ message: 'Test endpoint working' });
    });
    
    const server = app.listen(5001, () => {
      console.log('Test server running on port 5001');
      server.close();
      console.log('Test server closed');
    });
    
    console.log('All tests passed!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

testServer(); 