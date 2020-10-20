import React from 'react';
import FhirClientProvider from './FhirClientProvider';
import Patient from './Patient';
// import Veilederpanel from 'nav-frontend-veilederpanel';
// import { ReactComponent as VeilederPortrett } from './veileder.svg';

/* All components wrapped inside FhirClientProvider has access
 to the fhir client through the context */
export default function Page() {
  return (
    <FhirClientProvider>
      {/* <Veilederpanel svg={<VeilederPortrett/>}>
          Dette er ett vedlegg til en pleiepengesøknad for noen.
        </Veilederpanel> */}
      <Patient />
    </FhirClientProvider>
  );
}
