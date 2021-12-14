//Import statements for React and Axios
import React, { Component } from 'react';
//Using the axios module to make request to backend Express server
import axios from 'axios';

//Create a new class which will extend the component base class and 
// initilize default state properties for an array, an empty object, and an
// empty string
class Fib extends Component {
    state = {
        seenIndexes: [],
        values: {},
        index: ''
    };

//The instant this component is rendered on the screeen we will atttempt to fetch
// some data from the backend api. 
//Define "componentDidMount" lifecycle method that will call 2 helper methods
    componentDidMount() {
        this.fetchValues();
        this.fetchIndex();
    }
//Define the "fetchvalues" helper method to get all the different values stored on
// our api
    async fetchValues() {
        const values = await axios.get('/api/values/current');
        this.setState({values: values.data});
    }
//Define the "fetchIndex" helper method to get a list of indexes that have been
// submitted to the application  
    async fetchIndex() {
        const seenIndexes = await axios.get('/api/values/all');
        this.setState({
            seenIndexes: seenIndexes.data
        });
    }
//Define "handleSubmit" bound async function
    handleSubmit = async (event) => {
//Prevent the form from submitting itself
        event.preventDefault();
//Make an Axios post request
        await axios.post('/api/values', {
//Send an object with the key value of "index" with the value being whatever
// the user just entered in the input
            index: this.state.index
        });
//After successfully submitting this to the backend (worker?), clear out the 
// value of the input
        this.setState({ index: ''});
    };

//Define "renderSeenIndexes" helper method that looks at the value of "seenIndexes" from 
// the "fetchIndex" helper
    renderSeenIndexes() {
//Map over a list of all of the "seenIndexes" objects from the "fetchIndex" helper module
// to an arrary of objects that have a number property.  That number propery must be printed
// to the screen.
//This will statement will iterate over every object in the "seenIndexes" array
// and pull out and return the numbers delineated by a comma
        return this.state.seenIndexes.map(({ number }) => number).join(', ');
    }
//Define "renderValues". This data is stored in the Redis as an object containing key/value pairs.
    renderValues() {
//Create a new array called "entries"
        const entries = [];
//Iterate over all of the values in the state values object (defined earlier)
        for (let key in this.state.values) {
//For every "key" where the "key" represents the index of the Fibanachi number we will push
// a new entry in the "entries" array      
            entries.push(
                <div key={key}>
                    For index {key} I calculated {this.state.values[key]}
                </div>
            );
        }
//Return the list of created entries
        return entries;
    }

    render() {
        return (
//
            <div>
                <form onSubmit={this.handleSubmit}>
                    <label>Enter your index:</label>
                    <input
//Create event handlers to monitor whenever text is input and the "Submit" button is selected
// using the value property "state.index" string (defined earlier)
                        value={this.state.index}
                        onChange={event => this.setState({ index: event.target.value })}
                    />
                    <button>Submit</button>
                </form>

                <h3>Indexes I have seen:</h3>
                {this.renderSeenIndexes()}

                <h3>Calculated values:</h3>
                {this.renderValues()}
            </div>
        )
    }
}
//Export the "Fib" class component created on line 9
export default Fib;
