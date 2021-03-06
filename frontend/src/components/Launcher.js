import React from 'react';
import { oauth2 as SMART } from 'fhirclient';
import NavFrontendSpinner from 'nav-frontend-spinner';

export default class Launcher extends React.Component {
  /**
     * This is configured to make a Standalone Launch, just in case it
     * is loaded directly. An EHR can still launch it by passing `iss`
     * and `launch` url parameters
     */
  componentDidMount() {
    SMART.authorize({
      clientId: 'my-client-id',
      scope: 'launch launch/patient patient/*.write patient/read offline_access openid fhirUser',
      redirectUri: './app',
      iss:
                'https://launch.smarthealthit.org/v/r3/sim/'
                + 'eyJoIjoiMSIsImIiOiJmMDQ2MjkzNi1lYjRiLTRkYT'
                + 'EtYjQ1YS1mYmQ5NmViZjhjY2IiLCJlIjoic21hcnQt'
                + 'UHJhY3RpdGlvbmVyLTcxNjE0NTAyIn0/fhir',

    });
  }

  render() {
    return <NavFrontendSpinner />;
  }
}
