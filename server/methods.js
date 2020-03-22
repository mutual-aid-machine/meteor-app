import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { includes } from 'ramda';

const adminyRoles = [
	'zone-captain'
];

Meteor.methods({
	addPerson(options) {
		return {_id: Accounts.createUser(options)};
	},

	getProfile(requestedUsername) {
		const {_id, username: callerUsername, profile: {role}} = Meteor.user();

		const isAllowed = (
			callerUsername === requestedUsername ||
			includes(role, adminyRoles)
		);

		if (!isAllowed) { 
			throw new Meteor.Error('You don\'t have permission to view this document');
		};

		const {profile} = Meteor.users.findOne(
			{username: requestedUsername},
			{profile: 1}
		);

		if (!profile) {
			throw new Meteor.Error('User not found');
		}

		return profile;
	}
});
