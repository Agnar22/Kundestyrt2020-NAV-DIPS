import React from "react";
import { FhirClientContext } from "../FhirClientContext";
import CircularProgress from '@material-ui/core/CircularProgress';
import PatientForm from "./PatientForm";

function PatientName({ name = [] }) {
    let entry =
        name.find(nameRecord => nameRecord.use === "official") || name[0];
    if (!entry) {
        return <h1>Navn ikke funnet</h1>;
    }
    return <h1>{entry.given.join(" ") + " " + entry.family}</h1>;
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
        <div>
            <PatientName name={patient.name} />
            <PatientSocialSecurityNumber identifier={patient.identifier}/>
            <p>
                Fødselsdato: <b>{patient.birthDate}</b>
            </p>
            <form onSubmit={patient.handleSubmit}>
                <textarea  defaultValue={patient.value} onChange={patient.handleOnTextAreaChange}/>
                <button type="submit"> Send </button>
            </form>
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

    handleOnTextAreaChange(e) {
        this.setState({value:e.target.value})
        console.log("Logloglog")
    }

    handleSubmit(e){
        e.preventDefault()
        console.log("har trykket på submit")
    }

    render() {
        const { error, loading, patient } = this.state;
        if (loading) {
            return <CircularProgress />
        }
        if (error) {
            return <p>{error.message}</p>;
        }

        return(
        <div>
            <PatientBanner {...patient} handleTextAreaChange={e => this.handleOnTextAreaChange(e)} handleSubmit={e => this.handleSubmit(e)} value={this.state.value}/>
        </div>
        );
    }
}
