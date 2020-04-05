import events from 'events';

const ServerConnection = (serverHandler) => (evtHandler) => {
  evtHandler.on('data', (rawData) => {
    console.log(rawData);
  }); 
};

export default ServerConnection;
