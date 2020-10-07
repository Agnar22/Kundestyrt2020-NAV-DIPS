import React from "react";
import { FhirClientContext } from "../FhirClientContext";
import NavFrontendSpinner from 'nav-frontend-spinner';
import { Textarea, Input, Label } from 'nav-frontend-skjema';

import { Hovedknapp } from 'nav-frontend-knapper';
import "./Patient.less";

import moment from "moment";
import "moment/locale/nb";
import MomentUtils from "@date-io/moment";
import {MuiPickersUtilsProvider, KeyboardDatePicker} from "@material-ui/pickers";

moment.locale("nb"); // Set calendar to be norwegian (bokmaal)

function PatientName({ name = [] }) {
    let entry =
        name.find(nameRecord => nameRecord.use === "official") || name[0];
    if (!entry) {
        return <h3>Navn: Navn ikke funnet</h3>;
    }
    return(<div className="name-wrapper">
        <Label htmlFor="name">Navn:</Label>
        <Input id="name" disabled value={entry.given.join(" ") + " " + entry.family} />
    </div>);
}

function PatientSocialSecurityNumber({ identifier = [] }) {
    let socialSecurityNumber = 
        identifier.find(sb => sb.system === "http://hl7.org/fhir/sid/us-ssn").value;
    if (!socialSecurityNumber){
        return <p>Fødelsnummer ikke funnet</p>
    }
    return (<div className="birthnr-wrapper">
        <Label htmlFor="birthnr-input">Fødelsnummer:</Label>
        <Input id="birthnr-input" disabled value={socialSecurityNumber} />
    </div>
    )
}


export default class Patient extends React.Component {
    static contextType = FhirClientContext;
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            patient: null,
            value:"",
            startDate: null,
            endDate: null,
            error: null
        };
    }

    async componentDidMount() {
        const client = this.context.client;
        this._loader = await client.patient
            .read()
            .then(patient => {
                this.setState({ patient: patient, loading: false, error: false });
            })
            .catch(error => {
                this.setState({ error, loading: false });
            })  
    }

    handleChange = (event)  => {
        this.setState({value: event.target.value});
        console.log(event.target.value)
      }

    handleSubmit = (event) => {
        event.preventDefault();
        console.log("TODO: Send avgårde ting til backend")
    }
//TODO: fiks datodifferanseutregning.
    dateDiff(from, to){
        if (from == null || to == null ){
            return null
        }
        return (Number(this.state.endDate.split(/[-]+/).pop()) -  Number(this.state.startDate.split(/[-]+/).pop()));
    }

    render() {
        const { error, loading, patient } = this.state;
        if (loading) {
            return <NavFrontendSpinner />;
        }
        if (error) {
            return <p>{error.message}</p>;
        }


        return(
        <div className="form-wrapper">
            <h1> Erklæring om pleiepenger</h1>
            <div className="banner-wrapper">
                <PatientName name={patient.name} />
                <PatientSocialSecurityNumber identifier={patient.identifier}/>
            </div>
            <form className="patientform" onSubmit={this.handleSubmit}>
                <Textarea className="tekstfelt" value={this.state.value} onChange={this.handleChange} maxLength={0}/>
                <div className="datepicker-wrapper">
                    <MuiPickersUtilsProvider libInstance={moment} utils={MomentUtils} locale={"nb"}>
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
                            onChange={(d) => this.setState({startDate: d })}
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
                            onChange={(d) => this.setState({endDate: d })}
                        />
                    </MuiPickersUtilsProvider>
                </div>
                <div className="button-wrapper">
                    <Hovedknapp className="button" htmlType="submit">Send</Hovedknapp>
                    <Hovedknapp className="button" htmlType="submit">Lagre</Hovedknapp>
                </div>
            </form>

        </div>
        );
    }
}

//Diagnose
//<img alt="" style={"width:100px"}>{<NAVLogo/>}</img>
// Om vi ønsker å vise antall dager? <h3>{this.dateDiff(this.state.toDate-this.state.fromDate)} dager</h3>
