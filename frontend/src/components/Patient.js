import React from "react";
import { FhirClientContext } from "../FhirClientContext";

function PatientName({ name = [] }) {
    let entry =
        name.find(nameRecord => nameRecord.use === "official") || name[0];
    if (!entry) {
        return <h1>No Name</h1>;
    }
    return <h1>{entry.given.join(" ") + " " + entry.family}</h1>;
}

function PatientSocialSecurityNumber({ identifier = [] }) {
    let socialSecurityNumber = 
        identifier.find(sb => sb.system === "http://hl7.org/fhir/sid/us-ssn").value;
    if (!socialSecurityNumber){
        return <p>No social sec nr</p>
    }
    return <p>Social security number: <b>{socialSecurityNumber}</b></p>
}

function PatientBanner(patient) {
    return (
        <div>
            <PatientName name={patient.name} />
            <PatientSocialSecurityNumber identifier={patient.identifier}/>
            <p>
                Date of birth: <b>{patient.birthDate}</b>
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
            error: null
        };
    }
    async componentDidMount() {
        const client = this.context.client;
        this._loader = await client.patient
            .read()
            .then(patient => {
                this.setState({ patient: patient, loading: false, error: null });
            })
            .catch(error => {
                this.setState({ error, loading: false });
            })  
    }

    render() {
        const { error, loading, patient } = this.state;
        if (loading) {
            return null;
        }
        if (error) {
            return error.message;
        }
        return <PatientBanner {...patient} />;
    }
}
