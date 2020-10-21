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
import axios from 'axios';

moment.locale('nb'); // Set calendar to be norwegian (bokmaal)

const QUESTIONNAIRE_ID = 235192;

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
      responseID: null,
      error: null,
      sucessfullSave: false,
      sucessfullSend: false
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
    const fhirclient = this.context.client;
    fhirclient.request(`http://launch.smarthealthit.org/v/r3/fhir/QuestionnaireResponse/_search?questionnaire=${QUESTIONNAIRE_ID}&patient=${fhirclient.patient.id}&status=in-progress`)
      .then((result) => {
        if (result.total === 0) { return; }
        this.setState({ responseID: result.entry[0].resource.id });
        if (typeof (result.entry[0].resource.item[4].answer) !== 'undefined') {
          this.setState({value: result.entry[0].resource.item[4].answer[0].valueString});
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

  // Gets QuestionnaireResponseTemplate.json and fills out with current patients information,
  // before returning the form.
  convertToQuestionnaire = (status) => {
    const fullPatientName = `${this.state.patient.name[0].given
      .join(' ')} ${this.state.patient.name[0].family}`;
    const socialSecurityNumber = this.state.patient.identifier
      .find((sb) => sb.system === 'http://hl7.org/fhir/sid/us-ssn').value;

    const responseForm = QuestionnaireResponseTemplate;
    responseForm.subject.reference = `Patient/${this.state.patient.id}`;
    responseForm.subject.display = fullPatientName;
    responseForm.item[0].answer[0].valueString = fullPatientName;
    responseForm.item[1].answer[0].valueString = socialSecurityNumber;
    responseForm.item[2].answer[0].valueString = this.state.startDate ? this.state.startDate._d : '';
    responseForm.item[3].answer[0].valueString = this.state.endDate ? this.state.endDate._d : '';
    responseForm.item[4].answer[0].valueString = this.state.value;

    // Gets the fhirUser-ID of the practitioner and fills it in the form
    responseForm.author.reference = this.context.client.user.fhirUser;

    // Sets the status of the QuestionnaireResponse-form to the functions argument
    responseForm.status = status;
    return responseForm;
  }

  // Function for saving the information in our form to FHIR
  saveAndSendToFHIR = (status) => {
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

  // Function for saving patient information form to FHIR with status in progress
  handleSave = (event, status) => {
    event.preventDefault();
    this.saveAndSendToFHIR(status)
      .then((response) => {
        this.setState({ responseID: response.id });
        if (status === "in-progress"){
          this.setState({sucessfullSave: true});
        }
      }).catch((e) => {
        console.log('Error loading formData: ', e);
      });
  }

  // Function for saving patient information form to FHIR with status completed
  // and sending it to Kafka-stream
  handleSubmit = (event, status) => {
    this.handleSave(event, status);

    const token = this.context.client.state.tokenResponse.access_token;
    const ID = this.state.responseID;
    const config = {
      headers: {
        Authorization : "Bearer " + token,
      }
    }

    const axios = require('axios');
    axios.post('http://localhost:8081/send-application',  ID, config)
      .then((res) => {
        if (res.status === 200){
          this.setState({
            successfullSend : true
          });
        } else {
          console.log('Error sending information to backend, status code:', res.status);
        }
      });
  }

  handleChange = (event) => {
    this.setState({ value: event.target.value });
    //Removes popup
    this.setState({sucessfullSave: false, 
    sucessfullSend: false});
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

    var A;
    if(this.state.sucessfullSave){
      A = <AlertStripe type="suksess">
        Skjemaet ble lagret!
      </AlertStripe>
    }else if (this.state.sucessfullSend){
      A = <AlertStripe type="suksess">
        Skjemaet ble lagret og sendt!
      </AlertStripe>
    }

    return (
      <div className="form-wrapper">
        <h1> Erklæring om pleiepenger</h1>
        <div id="popup" aria-live="polite">
          {A}
        </div>
        <div className="banner-wrapper">
          <PatientName name={patient.name} />
          <PatientSocialSecurityNumber identifier={patient.identifier} />
        </div>
        <form className="patientform" onSubmit={(e) => this.handleSubmit(e, 'completed')}>
          <Textarea className="tekstfelt" value={this.state.value} onChange={this.handleChange} maxLength={0} disabled={this.state.sucessfullSend}/>
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
                onChange={(d) => this.setState({ startDate: d, sucessfullSave: false, 
                  sucessfullSend: false})}
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
                onChange={(d) => this.setState({ endDate: d, sucessfullSave: false, 
                  sucessfullSend: false})}
                disabled={this.state.sucessfullSend}
              />
            </MuiPickersUtilsProvider>
          </div>
          <div className="button-wrapper">
            <Hovedknapp className="button" onClick={(e) => this.handleSave(e, 'in-progress')}>Lagre</Hovedknapp>
            <Hovedknapp className="button" htmlType="submit" disabled={this.state.sucessfullSend}>Send</Hovedknapp>
          </div>
        </form>
      </div>
    );
  }
}
