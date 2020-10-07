import React from "react";
//import TextField from '@material-ui/core/TextField';
import {Button} from "@material-ui/core";


const handleSubmit = e => {
    console.log(e)
    e.preventDefault()
}

export default function PatientForm(patient){



    return(
        <div>
            <form onSubmit={handleSubmit}>
                <h2>
                    Notat:
                </h2>
                <textarea label="Fritekst" value={this.state.value}/>
                <Button type="submit">Trykk på meg</Button>
            </form>
        </div>
    );
};
