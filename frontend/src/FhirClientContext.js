import React from 'react';

const context = {
  client: null,
  setClient(client) {
    context.client = client;
  },
};

const FhirClientContext = React.createContext(context);
export default FhirClientContext;
