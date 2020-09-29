import React from "react";
import {FhirClientContext} from "../FhirClientContext";
//import CircularProgress from "@material-ui/core/CircularProgress";
//import TextField from '@material-ui/core/TextField';
import { TextareaControlled } from 'nav-frontend-skjema';


function FullForm (patient) {
    return(
    <div>
        <form  onSubmit={patient.handleSubmit}>
            <label>
                Notat:
                <TextareaControlled label="Textarea-label" maxLength={0}/>
            </label>
        </form>
    </div>
    );
}




export default class PatientForm extends React.Component {
    static contextType = FhirClientContext;
    constructor(props) {
        super(props);
        this.state = {
            patient: null,
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

    handleSubmit(event) {
        alert('An essay was submitted: ' + this.state.value);
        event.preventDefault();
    }


    render() {
        const patient = this.state.patient;
        return <FullForm {...patient}/>;
    }
}
