import React from 'react';
import CircularProgress from '@material-ui/core/CircularProgress';
import FhirClientContext from '../FhirClientContext';

function PatientName({ name = [] }) {
  const entry = name.find((nameRecord) => nameRecord.use === 'official') || name[0];
  if (!entry) {
    return <h1>Navn ikke funnet</h1>;
  }
  return <h1>{`${entry.given.join(' ')} ${entry.family}`}</h1>;
}

function PatientSocialSecurityNumber({ identifier = [] }) {
  const socialSecurityNumber = identifier.find((sb) => sb.system === 'http://hl7.org/fhir/sid/us-ssn').value;
  if (!socialSecurityNumber) {
    return <p>Fødelsnummer ikke funnet</p>;
  }
  return (
    <p>
      Fødselsnummer:
      <b>{socialSecurityNumber}</b>
    </p>
  );
}

function PatientBanner(patient) {
  return (
    <div>
      <PatientName name={patient.name} />
      <PatientSocialSecurityNumber identifier={patient.identifier} />
      <p>
        Fødselsdato:
        {' '}
        <b>{patient.birthDate}</b>
      </p>
    </div>
  );
}

export default class Patient extends React.Component {
    static contextType = { FhirClientContext };

    constructor(props) {
      super(props);
      this.state = {
        loading: true,
        patient: null,
        error: null,
      };
    }

    async componentDidMount() {
      const { client } = this.context;
      this._loader = await client.patient
        .read()
        .then((patient) => {
          this.setState({ patient, loading: false, error: false });
        })
        .catch((error) => {
          this.setState({ error, loading: false });
        });
    }

    render() {
      const { error, loading, patient } = this.state;
      if (loading) {
        return <CircularProgress />;
      }
      if (error) {
        return <p>{error.message}</p>;
      }
      /* eslint-disable react/jsx-props-no-spreading */
      return <PatientBanner {...patient} />;
    }
}
