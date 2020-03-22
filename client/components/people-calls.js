import {Meteor} from 'meteor/meteor';

const promiseCallback = (resolve, reject) => (error, result) => (
	error ? reject(error) : resolve(result)
);

export const addPerson = ({username, email, password, profile}) => new Promise((resolve, reject) => {
	return Meteor.call('addPerson', ({username, email, password, profile}), promiseCallback(resolve, reject));
});

export const login = ({username, email}, password) => new Promise((resolve, reject) => (
	username
		? Meteor.loginWithPassword({username}, password, promiseCallback(resolve, reject))
		: Meteor.loginWithPassword({email}, password, promiseCallback(resolve, reject))
));

export const getProfile = username => new Promise((resolve, reject) => (
	Meteor.call('getProfile', username, promiseCallback(resolve, reject))
));

export default {
	addPerson, login, getProfile
};
