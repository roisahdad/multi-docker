import React from 'react';
import logo from './logo.svg';
import './App.css';
//Import BrowserRouter allowing for navigation between "OtherPage.js" and "Fib.js"
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';
//Import the "OtherPage.js" and "Fib.js" components
import OtherPage from './OtherPage';
import Fib from './Fib';

function App() {
//Wrap existing write-up with a new "Router" component defining:
// place a link tab to the "/" route called "Home"
// place a link tag to "Other Page"
// routes to "Fib" and "Otherpage"
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <a
            className="App-link"
            href="https://reactjs.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn React
          </a>
          <Link to="/">Home</Link>
          <Link to="/otherpage">Other Page</Link>
        </header>
        <div>
          <Route exact path="/" component={Fib} />
          <Route path="/otherpage" component={OtherPage} />
        </div>
      </div>
    </Router>
  );
}

export default App;
