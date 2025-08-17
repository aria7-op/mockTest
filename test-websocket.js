const WebSocket = require('ws');

const wss = new WebSocket.Server({ 
    port: 5053, 
    host: '192.168.0.105' 
});

console.log('WebSocket server running on port 5053');

wss.on('connection', function connection(ws, req) {
    console.log('New WebSocket connection from:', req.socket.remoteAddress);
    
    ws.on('message', function message(data) {
        console.log('Received:', data.toString());
        ws.send(`Echo: ${data}`);
    });
    
    ws.on('close', function() {
        console.log('Client disconnected');
    });
    
    // Send welcome message
    ws.send('Welcome to WebSocket Server!');
});

console.log('WebSocket server ready for testing load balancer'); 