import React from 'react';
import './Patient.less';

import NavFrontendSpinner from 'nav-frontend-spinner';
import { Textarea, Input, Label } from 'nav-frontend-skjema';
import { Hovedknapp } from 'nav-frontend-knapper';

import { MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers';

import moment from 'moment';
import 'moment/locale/nb';
import MomentUtils from '@date-io/moment';
import AlertStripe from 'nav-frontend-alertstriper';
import QuestionnaireResponseTemplate from '../QuestionnaireResponseTemplate.json';
import FhirClientContext from '../FhirClientContext';

moment.locale('nb'); // Set calendar to be norwegian (bokmaal)

const axios = require('axios');

const QUESTIONNAIRE_ID = 235237;

function PatientName({ name = [] }) {
  /*
  Generates and wraps the patient's name
  */
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
  /*
  Generates and wraps the patient's socialsecuritynumber
  */
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
      freetext: '',
      startDate: null,
      endDate: null,
      responseID: null,
      error: null,
      sucessfullSave: false,
      sucessfullSend: false,
    };
  }

  async componentDidMount() {
    const { client } = this.context;
    this._loader = await client.patient
      .read()
      .then((patient) => {
        this.setState({ patient, loading: false, error: false });
        this.formData();
      })
      .catch((error) => {
        this.setState({ error, loading: false });
      });
  }

  formData = () => {
    /*
    Loads the patient and sets values for responseID
    If they exists, freetext, startDate and endDate are also loaded
     */
    const fhirclient = this.context.client;
    fhirclient.request(`http://launch.smarthealthit.org/v/r3/fhir/QuestionnaireResponse/_search?questionnaire=${QUESTIONNAIRE_ID}&patient=${fhirclient.patient.id}&status=in-progress`)
      .then((result) => {
        if (result.total === 0) { return; }
        this.setState({ responseID: result.entry[0].resource.id });
        if (typeof (result.entry[0].resource.item[4].answer) !== 'undefined') {
          this.setState({ freetext: result.entry[0].resource.item[4].answer[0].valueString });
        }
        if (typeof (result.entry[0].resource.item[2].answer) !== 'undefined') {
          this.setState({ startDate: result.entry[0].resource.item[2].answer[0].valueString });
        }

        if (typeof (result.entry[0].resource.item[3].answer) !== 'undefined') {
          this.setState({ endDate: result.entry[0].resource.item[3].answer[0].valueString });
        }
      }).catch((e) => {
        console.log('Error loading formData: ', e);
      });
  }

  convertToQuestionnaire = (status) => {
    /*
    Gets QuestionnaireResponseTemplate.json and fills out with current patient's information.

    Returns: responseform (QuestionnaireResponseTemplate)
    */
    const fullPatientName = `${this.state.patient.name[0].given
      .join(' ')} ${this.state.patient.name[0].family}`;
    const socialSecurityNumber = this.state.patient.identifier
      .find((sb) => sb.system === 'http://hl7.org/fhir/sid/us-ssn').value;

    // Fill out the quesionnaire
    const responseForm = QuestionnaireResponseTemplate;
    responseForm.subject.reference = `Patient/${this.state.patient.id}`;
    responseForm.subject.display = fullPatientName;
    responseForm.item[0].answer[0].valueString = fullPatientName;
    responseForm.item[1].answer[0].valueString = socialSecurityNumber;
    responseForm.item[2].answer[0].valueString = this.state.startDate ? this.state.startDate._d : '';
    responseForm.item[3].answer[0].valueString = this.state.endDate ? this.state.endDate._d : '';
    responseForm.item[4].answer[0].valueString = this.state.freetext;

    // Gets the fhirUser-ID of the practitioner and fills it in the form
    responseForm.author.reference = this.context.client.user.fhirUser;

    // Sets the status of the QuestionnaireResponse-form
    responseForm.status = status;
    return responseForm;
  }

  saveAndSendToFHIR = (status) => {
    /*
    Saves the responseform to FHIR

    Returns: request
    */
    const filledResponse = this.convertToQuestionnaire(status);

    const fhirclient = this.context.client;
    const headers = {
      'Content-Type': 'application/fhir+json',
      Accept: '*/*',
    };
    let options;

    // Patient has no existing QuestionnairyResponse and a new one is created
    if (this.state.responseID === null) {
      options = {
        url: 'http://launch.smarthealthit.org/v/r3/fhir/QuestionnaireResponse',
        body: JSON.stringify(filledResponse),
        headers,
        method: 'POST',
      };
    } else {
      // Patient has previously excisting QuestionnairyResponse
      filledResponse.id = this.state.responseID;
      options = {
        url: `http://launch.smarthealthit.org/v/r3/fhir/QuestionnaireResponse/${this.state.responseID}`,
        body: JSON.stringify(filledResponse),
        headers,
        method: 'PUT',
      };
    }
    return fhirclient.request(options);
  }

  handleSave = (event, status) => {
    /*
    Saves the responseform to FHIR, with status 'in progress'
    */
    event.preventDefault();
    this.saveAndSendToFHIR(status)
      .then((response) => {
        this.setState({ responseID: response.id });
        if (status === 'in-progress') {
          this.setState({ sucessfullSave: true });
        }
      }).catch((e) => {
        console.log('Error loading formData: ', e);
      });
  }

  handleSubmit = (event, status) => {
    /*
    Saves the responseform to FHIR, with status 'completed'
    Sends responseID and access-token to Kafka-stream
    */
    this.handleSave(event, status);

    const token = this.context.client.state.tokenResponse.access_token;
    const ID = this.state.responseID;
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    axios.post('http://localhost:8081/send-application', ID, config)
      .then((res) => {
        if (res.status === 200) {
          this.setState({
            sucessfullSend: true,
            sucessfullSave: false,
          });
        } else {
          console.log('Error sending information to backend, status code:', res.status);
        }
      });
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

    let A;
    if (this.state.sucessfullSave) {
      A = (
        <AlertStripe type="suksess">
          Skjemaet ble lagret!
        </AlertStripe>
      );
    }
    if (this.state.sucessfullSend) {
      A = (
        <AlertStripe type="suksess">
          Skjemaet ble lagret og sendt!
        </AlertStripe>
      );
    }

    return (
      <div className="form-wrapper">
        <h1> Erklæring om pleiepenger</h1>
        <div className="banner-wrapper">
          <PatientName name={patient.name} />
          <PatientSocialSecurityNumber identifier={patient.identifier} />
        </div>
        <form className="patientform" onSubmit={(e) => this.handleSubmit(e, 'completed')}>
          <Textarea
            className="tekstfelt"
            value={this.state.freetext}
            onChange={(event) => {
              this.setState({
                freetext: event.target.value,
                sucessfullSave: false,
                sucessfullSend: false,
              });
            }}
            maxLength={0}
            disabled={this.state.sucessfullSend}
          />
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
                onChange={(d) => this.setState({
                  startDate: d,
                  sucessfullSave: false,
                  sucessfullSend: false,
                })}
                disabled={this.state.sucessfullSend}
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
                onChange={(d) => this.setState({
                  endDate: d,
                  sucessfullSave: false,
                  sucessfullSend: false,
                })}
                disabled={this.state.sucessfullSend}
              />
            </MuiPickersUtilsProvider>
          </div>
          <div id="popup" aria-live="polite">
            {A}
          </div>
          <br />
          <div className="button-wrapper">
            <Hovedknapp className="button" onClick={(e) => this.handleSave(e, 'in-progress')}>Lagre</Hovedknapp>
            <Hovedknapp className="button" htmlType="submit" disabled={this.state.sucessfullSend}>Send</Hovedknapp>
          </div>
        </form>
      </div>
    );
  }
}
