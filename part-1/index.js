const abciServer = require('abci');

const server = abciServer({});

server.listen(26658);
