import React from 'react';
import NavFrontendSpinner from 'nav-frontend-spinner';
import { Textarea } from 'nav-frontend-skjema';
import { Hovedknapp } from 'nav-frontend-knapper';
import './Patient.less';

import moment from 'moment';
import 'moment/locale/nb';
import MomentUtils from '@date-io/moment';
import { MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers';
import FhirClientContext from '../FhirClientContext';

moment.locale('nb'); // Set calendar to be norwegian (bokmaal)

function PatientName({ name = [] }) {
  const entry = name.find((nameRecord) => nameRecord.use === 'official') || name[0];
  if (!entry) {
    return <h3>Navn: Navn ikke funnet</h3>;
  }
  return (
    <h3>
      Navn:
      {`${entry.given.join(' ')} ${entry.family}`}
    </h3>
  );
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
    <div className="wrapper">
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
    static contextType = FhirClientContext;

    constructor(props) {
      super(props);
      this.state = {
        loading: true,
        patient: null,
        value: '',
        startDate: null,
        endDate: null,
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

    handleChange = (event) => {
      this.setState({ value: event.target.value });
      console.log(event.target.value);
    }

    handleSubmit = (event) => {
      event.preventDefault();
      console.log('TODO: Send avgårde ting til backend');
    }

    // TODO: fiks datodifferanseutregning.
    dateDiff(from, to) {
      if (from == null || to == null) {
        return null;
      }
      return (Number(this.state.endDate.split(/[-]+/).pop()) - Number(this.state.startDate.split(/[-]+/).pop()));
    }

    /* eslint-disable react/jsx-props-no-spreading */
    render() {
      const { error, loading, patient } = this.state;
      if (loading) {
        return <NavFrontendSpinner />;
      }
      if (error) {
        return <p>{error.message}</p>;
      }

      return (
        <div>
          <h1> Erklæring om pleiepenger</h1>
          <PatientBanner {...patient} />
          <form onSubmit={this.handleSubmit}>
            <Textarea className="tekstfelt" value={this.state.value} onChange={this.handleChange} maxLength={0} />
            <div className="datovelgere">
              <MuiPickersUtilsProvider libInstance={moment} utils={MomentUtils} locale="nb">
                <KeyboardDatePicker
                  disableToolbar
                  variant="inline"
                  format="DD. MMMM yyyy"
                  id="startdate-picker"
                  label="Fra dato"
                  maxDate={this.state.endDate ? this.state.endDate : undefined}
                  maxDateMessage="Starten av perioden kan ikke være senere enn slutten av perioden"
                  invalidDateMessage="Ugyldig datoformat"
                  value={this.state.startDate}
                  onChange={(d) => this.setState({ startDate: d })}
                />
                <KeyboardDatePicker
                  disableToolbar
                  variant="inline"
                  format="DD. MMMM yyyy"
                  id="enddate-picker"
                  label="Til dato"
                  minDate={this.state.startDate ? this.state.startDate : undefined}
                  minDateMessage="Slutten av perioden kan ikke være tidligere enn starten av perioden"
                  invalidDateMessage="Ugyldig datoformat"
                  value={this.state.endDate}
                  onChange={(d) => this.setState({ endDate: d })}
                />
              </MuiPickersUtilsProvider>
              <br />
              <Hovedknapp className="knapp" htmlType="submit">Send</Hovedknapp>
              <Hovedknapp className="knapp" htmlType="submit">Lagre</Hovedknapp>
            </div>
          </form>

        </div>
      );
    }
}

// Diagnose
// <img alt="" style={"width:100px"}>{<NAVLogo/>}</img>
// Om vi ønsker å vise antall dager?
// <h3>{this.dateDiff(this.state.toDate-this.state.fromDate)} dager</h3>
