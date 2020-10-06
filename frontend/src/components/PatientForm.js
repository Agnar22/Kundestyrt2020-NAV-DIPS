import React from 'react';
// import TextField from '@material-ui/core/TextField';
import { Button } from '@material-ui/core';

const handleSubmit = (e) => {
  console.log(e);
  e.preventDefault();
};

/* eslint-disable react/no-this-in-sfc */
export default function PatientForm(patient) { // eslint-disable-line no-unused-vars
  return (
    <div>
      <form onSubmit={handleSubmit}>
        <h2>
          Notat:
        </h2>
        <textarea label="Fritekst" value={this.state.value} />
        <Button type="submit">Trykk på meg</Button>
      </form>
    </div>
  );
}
