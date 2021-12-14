//This is a complete navigational example on the front end
// of the application
//Import statements for React and Link
import React from 'react';
import { Link } from 'react-router-dom';

//Export default a functional component
export default () => {
//Return a bit of JSX
//With some text on the page and a link back to main page
    return (
        <div>
            Im some other page!
            <Link to ="/">Go Back home</Link>
        </div>
    );
};