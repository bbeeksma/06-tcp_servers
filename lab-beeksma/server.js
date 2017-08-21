'use strict';

const uuidv4 = require('uuid/v4');
const net = require('net');
const PORT = process.env.PORT || 3000;
const server = net.createServer();
const EE = require('events');
const ee = new EE();

const clientPool = [];

function Client(socket){
  this.nickname = 'anon';
  this.id = uuidv4;
  this.socket = socket;
}

server.listen(PORT, function() {
  console.log(`Listening on ${PORT}`);
});

server.on('connection', (socket) => {
  let client = new Client(socket);
  clientPool.push(client);
  socket.on('data', function (data) {
    console.log(data);
    dataHandler(data,client);
  });
  socket.on('close', function () {
    closeSocket(client);
  });
  socket.on('error', function (err) {
    console.warn();(err);
  });
});

function dataHandler(data,client){
  let dataArray = data.toString().split(' ');
  if(data.toString()[0] === '@'){
    if(dataArray[0] === '@all'){
      ee.emit('@all', client, 'message');
    }
    else if(dataArray[0] === '@dm') {
      ee.emit('@dm', client, 'recipient', 'message');
    }
    else if(dataArray[0] === '@nickname') {
      ee.emit('@nickname', client, 'newNickname');
    }
    else {
      client.socket.write(`Sorry, that is not a valid command, try '@all <message>' to message all users, '@dm <nickname> <message>'  to message a specific user or '@nickname <newNickname>' to change your nickname`);
    }
  }
  else{
    ee.emit('@all', client, data.toString());
  }
}

function closeSocket(client){
  if(clientPool.indexOf(client) != -1){
    console.log(`Client ${client.nickname} has left.`);
    clientPool.splice(clientPool.indexOf(client), 1);
    console.log(clientPool.map(activeClient => activeClient.id));
  }
}
