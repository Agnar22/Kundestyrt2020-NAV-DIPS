import React from 'react';
import FhirClientProvider from './FhirClientProvider';
import Patient from './Patient';

/* All components wrapped inside FhirClientProvider has access
 to the fhir client through the context */
export default function Home() {
  return (
    <FhirClientProvider>
      <Patient />
    </FhirClientProvider>
  );
}
