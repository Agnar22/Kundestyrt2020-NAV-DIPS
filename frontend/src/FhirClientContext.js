import React from 'react';

const context = {
  client: null,
  setClient(client) {
    context.client = client;
  },
};

export default React.createContext(context);
