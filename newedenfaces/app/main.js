/*
The main.js is the entry point for our React application. We use it in gulpfile.js where 
Browserify will traverse the entire tree of dependencies and generate the final bundle.js 
file. You will rarely have to touch this file after its initial setup.
*/

import React from 'react';
import Router from 'react-router';
import ReactDOM from 'react-dom';
import createBrowserHistory from 'history/lib/createBrowserHistory';
import routes from './routes';

let history = createBrowserHistory();

ReactDOM.render(
	<Router history={history}>
		{routes}
	</Router>, 
	document.getElementById('app')
);