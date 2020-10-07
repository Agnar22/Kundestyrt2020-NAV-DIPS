import React from 'react';
import { BrowserRouter, Route } from 'react-router-dom';
import Launcher from './Launcher';
import Home from './Home';

export default function App() {
  return (
    <BrowserRouter>
      <Route path="/app" component={Home} exact />
      <Route path="/" component={Launcher} exact />
    </BrowserRouter>
  );
}
