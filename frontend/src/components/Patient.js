import React from "react";
import { FhirClientContext } from "../FhirClientContext";
import NavFrontendSpinner from 'nav-frontend-spinner';
import { Textarea } from 'nav-frontend-skjema';
import { Hovedknapp } from 'nav-frontend-knapper';
import "./Patient.less";
//import { Datovelger } from 'nav-datovelger';

import DateFnsUtils from '@date-io/date-fns';
import {MuiPickersUtilsProvider, KeyboardDatePicker} from "@material-ui/pickers";




function PatientName({ name = [] }) {
    let entry =
        name.find(nameRecord => nameRecord.use === "official") || name[0];
    if (!entry) {
        return <h3>Navn: Navn ikke funnet</h3>;
    }
    return <h3>Navn: {entry.given.join(" ") + " " + entry.family}</h3>;
}

function PatientSocialSecurityNumber({ identifier = [] }) {
    let socialSecurityNumber = 
        identifier.find(sb => sb.system === "http://hl7.org/fhir/sid/us-ssn").value;
    if (!socialSecurityNumber){
        return <p>Fødelsnummer ikke funnet</p>
    }
    return <p>Fødselsnummer: <b>{socialSecurityNumber}</b></p>
}

function PatientBanner(patient) {
    return (
        <div className="wrapper">
            <PatientName name={patient.name} />
            <PatientSocialSecurityNumber identifier={patient.identifier}/>
            <p>
                Fødselsdato: <b>{patient.birthDate}</b>
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
            value:"",
            fromDate: null,
            toDate: null,
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
        return (Number(this.state.toDate.split(/[-]+/).pop()) -  Number(this.state.fromDate.split(/[-]+/).pop()));
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
        <div>
            <h1> Erklæring om pleiepenger</h1>
            <PatientBanner {...patient} />
            <form onSubmit={this.handleSubmit}>
                <Textarea className="tekstfelt" value={this.state.value} onChange={this.handleChange} maxLength={0}/>
                <Hovedknapp className="knapp" htmlType="submit">Send</Hovedknapp>
                <Hovedknapp className="knapp" htmlType="submit">Lagre</Hovedknapp>
                <div className="datovelgere">
                    <h4>Fra dato:</h4>
                    <MuiPickersUtilsProvider utils={DateFnsUtils}>
                        <KeyboardDatePicker
                            disableToolbar
                            variant="inline"
                            format="dd/MM/yyyy"
                            id="from-date-picker"
                            label="Velg dato (dd/mm/yyyy)"
                            value={this.state.fromDate}
                            onChange={(d) => this.setState({fromDate: d })}
                            />
                    </MuiPickersUtilsProvider>
{/* Om vi ønsker å vise antall dager?
                    <h3>{this.dateDiff(this.state.toDate-this.state.fromDate)} dager</h3>
*/}
                </div>
            </form>

        </div>
        );
    }
}

//Diagnose
//<img alt="" style={"width:100px"}>{<NAVLogo/>}</img>