import React from 'react';
import NavFrontendSpinner from 'nav-frontend-spinner';
import { Textarea, Input, Label } from 'nav-frontend-skjema';

import { Hovedknapp } from 'nav-frontend-knapper';
import './Patient.less';

import moment from 'moment';
import 'moment/locale/nb';
import MomentUtils from '@date-io/moment';
import { MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers';
import FhirClientContext from '../FhirClientContext';
import QuestionnaireResponseTemplate from '../QuestionnaireResponseTemplate.json';
// import { responsiveFontSizes } from '@material-ui/core';

moment.locale('nb'); // Set calendar to be norwegian (bokmaal)

function PatientName({ name = [] }) {
  const entry = name.find((nameRecord) => nameRecord.use === 'official') || name[0];
  if (!entry) {
    return <h3>Navn: Navn ikke funnet</h3>;
  }
  return (
    <div className="name-wrapper">
      <Label htmlFor="name">Navn:</Label>
      <Input id="name" disabled value={`${entry.given.join(' ')} ${entry.family}`} />
    </div>
  );
}

function PatientSocialSecurityNumber({ identifier = [] }) {
  const socialSecurityNumber = identifier.find((sb) => sb.system === 'http://hl7.org/fhir/sid/us-ssn').value;
  if (!socialSecurityNumber) {
    return <p>Fødelsnummer ikke funnet</p>;
  }
  return (
    <div className="birthnr-wrapper">
      <Label htmlFor="birthnr-input">Fødelsnummer:</Label>
      <Input id="birthnr-input" disabled value={socialSecurityNumber} />
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

    // Gets QuestionnaireResponseTemplate.json and fills out with current patients information,
    // before returning the form.
    getAndFillResponseForm = (status) => {
      const fullPatientName = `${this.state.patient.name[0].given
        .join(' ')} ${this.state.patient.name[0].family}`;
      const socialSecurityNumber = this.state.patient.identifier
        .find((sb) => sb.system === 'http://hl7.org/fhir/sid/us-ssn').value;

      const responseForm = QuestionnaireResponseTemplate;
      responseForm.subject.reference = `Patient/${this.state.patient.id}`;
      responseForm.subject.display = fullPatientName;
      responseForm.item[0].answer[0].valueString = fullPatientName;
      responseForm.item[1].answer[0].valueString = socialSecurityNumber;
      responseForm.item[2].answer[0].valueString = this.state.startDate._d;
      responseForm.item[3].answer[0].valueString = this.state.endDate._d;
      responseForm.item[4].answer[0].valueString = this.state.value;

      // Gets the fhirUser-ID of the practitioner and fills it in the form
      responseForm.author.reference = this.context.client.user.fhirUser;

      // Sets the status of the QuestionnaireResponse-form to the functions argument
      responseForm.status = status;

      return responseForm;
    }

    handleChange = (event) => {
      this.setState({ value: event.target.value });
    }

    // Function for saving a questionnaire response for current patient
    handleSave = (event) => {
      event.preventDefault();
      // ToDo: Make more functionality for saving form
      const filledResponse = this.getAndFillResponseForm('in-progress');
      console.log(filledResponse);
    }

    // Function for sending an questionnaire response for current patient
    handleSubmit = (event) => {
      event.preventDefault();

      const fhirclient = this.context.client;

      const headers = {
        'Content-Type': 'application/fhir+json',
        Accept: '*/*',
      };

      const options = {
        url: 'https://r3.smarthealthit.org/QuestionnaireResponse',
        body: JSON.stringify(this.getAndFillResponseForm('completed')),
        headers,
        method: 'POST',
      };

      fhirclient.request(options);
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
        <div className="form-wrapper">
          <h1> Erklæring om pleiepenger</h1>
          <div className="banner-wrapper">
            <PatientName name={patient.name} />
            <PatientSocialSecurityNumber identifier={patient.identifier} />
          </div>
          <form className="patientform" onSubmit={this.handleSubmit}>
            <Textarea className="tekstfelt" value={this.state.value} onChange={this.handleChange} maxLength={0} />
            <div className="datepicker-wrapper">
              <MuiPickersUtilsProvider libInstance={moment} utils={MomentUtils} locale="nb">
                <KeyboardDatePicker
                  className="datepicker"
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
                  className="datepicker"
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
            </div>
            <div className="button-wrapper">
              <Hovedknapp className="button" htmlType="submit">Send</Hovedknapp>
              <Hovedknapp className="button" onClick={this.handleSave}>Lagre</Hovedknapp>
            </div>
          </form>
        </div>
      );
    }
}
