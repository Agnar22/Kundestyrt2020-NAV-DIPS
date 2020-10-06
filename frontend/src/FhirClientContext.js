import React from 'react';

const context = {
  client: null,
  setClient(client) {
    context.client = client;
  },
};

/* eslint-disable import/prefer-default-export */
export const FhirClientContext = React.createContext(context);
