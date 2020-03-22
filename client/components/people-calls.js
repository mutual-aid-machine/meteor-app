import {Meteor} from 'meteor/meteor';

const promiseCallback = (resolve, reject) => (error, result) => (
	error ? reject(error) : resolve(result)
);

const people = {
	addPerson: ({username, email, password, profile}) => new Promise((resolve, reject) => {
		return Meteor.call('addPerson', ({username, email, password, profile}), promiseCallback(error, result));
	}),

	login: ({username, email}, password) => new Promise((resolve, reject) => (
		username
			? Meteor.loginWithPassword({username}, password, promiseCallback(resolve, reject))
			: Meteor.loginWithPassword({email}, password, promiseCallback(resolve, reject))
	))
};

export default people;
