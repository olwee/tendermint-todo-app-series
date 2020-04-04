const grpc = require('grpc');
const messages = require('./gen/types_pb');
const services = require('./gen/types_grpc_pb');

const server = new grpc.Server();

server.addService(services.ABCIApplicationService, {
  echo: () => {},
  flush: () => {},
});

server.bind('127.0.0.1:26658', grpc.ServerCredentials.createInsecure());

server.start();
