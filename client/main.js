import React from 'react';
import { Meteor } from 'meteor/meteor';
import { render } from 'react-dom';
import { App } from './App';
import { Accounts } from 'meteor/accounts-base';

Meteor.startup(() => {
	render(<App />, document.getElementById('render-target'));
});
