import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';

Meteor.methods({
	addPerson(options) {
		return {_id: Accounts.createUser(options)};
	},
});
