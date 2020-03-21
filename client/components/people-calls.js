import {Meteor} from 'meteor/meteor';

const people = {
	addPerson: ({username, email, password, profile}) => new Promise((resolve, reject) => {
		Meteor.call('addPerson', ({username, email, password, profile}), (error, result) => {
			if (error ) {
				reject(error);
			} else {
				resolve(result);
			}
		})
	}),
};

export default people;
