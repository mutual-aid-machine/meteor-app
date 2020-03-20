import React, {useState} from 'react';
import { Router, Route, Switch, useParams } from 'react-router';
import { createBrowserHistory } from 'history';
import { useTracker } from 'meteor/react-meteor-data';
import { People } from '/imports/api/collections.js'
import { Form, Button} from 'react-bootstrap';
import {AccountUiWrapper} from './SignUpStuff';
import {
	includes,
	prop,
	update,
	mergeRight
} from 'ramda';

export const handleChange = setter => e => setter(e.target.value);

export const SignInForm = ({
}) => (
	<AccountUiWrapper
	/>
);

export const SignUpForm = ({
}) => {
	// const updateContact = a => type => value => update(
	// 	a.findIndex(c => c.type === type), value, a
	// );
	// const contactTypes = ['email', 'phoneNumber'];
	// const [contact, setContact] = useState(
	// 	contactTypes.map(type => ({type}))
	// );
	// const setEmail = email => setContact(
	// 	updateContact(contact, 'email', email)
	// );
	// const setPhoneNumber = n => setContact(
	// 	updateContact(contact, 'phoneNumber', n)
	// );

	const {role: suppliedRole} = useParams();

	const [name, setName] = useState('');
	const [email, setEmail] = useState('');
	const [phoneNumber, setPhoneNumber] = useState('');
	const [address, setAddress] = useState('');
	const [error, setError] = useState('');
	const [role, setRole] = useState(suppliedRole);

	const fields = [
		{
			_id: 'name',
			label: 'Name',
			value: name,
			setter: setName,
			description: 'What would you like to be called?',
		},
		{
			_id: 'email',
			label: 'E-mail',
			value: email,
			setter: setEmail,
			description: 'Would you like to be emailed? If so, where?',
		},
		{
			_id: 'phoneNumber',
			label: 'Phone Number',
			value: phoneNumber,
			setter: setPhoneNumber,
			description: 'Text/Voice is the fastest way for us to get in touch.'
		},
		{
			_id: 'address',
			label: 'Address',
			value: address,
			setter: setAddress,
			description: 'we need to know where you\'re based out of to help connect you',
		},
	];

	const handleSubmit = e => {
		e.preventDefault();
		const values = Object.fromEntries(
			fields.map(({_id, value}) => [_id, value])
		);
		//TODO
		const meta = {
			createdAt: new Date(),
			testing: true,
		};
		if (
			values.name && 
			(values.email || values.phoneNumber) &&
			values.address
		) {
			//TODO success
			return People.insert(mergeRight(values, meta));
		} else {
			setError("please give us a name, a means of contact, and a location");
		}
	};

	const {Group, Label, Control, Text} = Form;

	const FormRow = ({
		label, value, setter, description, _id,
		type = 'text',
		required = false,
	}) => (
		<div
			key={_id}
		>
			<Label>{label}</Label>
			<Control
				required={required}
				value={value}
				onChange={handleChange(setter)}
				type={type}
				placeholder={description}
			/>
		</div>
	);

	const helpyRoles = ['to-help', 'zone-captain'];
	const inHelpyRoles = x => includes(x, helpyRoles);
	const captainDialog = inHelpyRoles(role) ? (
		<div>
			<Label>
				If you've got a lot of time on your hands, would you like to be a <a href="/what-is-a-zone-captain">Zone Captain</a>? 
				<br/>
				We'd forward your number to someone who could brief you on the responsibilities.
			</Label>
		</div>
	) : null;

	return (
		<Form onSubmit={handleSubmit} >
			<h2>{error}</h2>
			<Group>
				{fields.map(FormRow)}
				{captainDialog}
			</Group>
			<Button
				onClick={handleSubmit}
			>
				submit
			</Button>
		</Form>
	);
};

const browserHistory = createBrowserHistory();
const Menu = () => {
	return (
		<div>
			<h1>
				Welcome to Mutual Aid.
				<br/>
				Are you:
			</h1>
			<h2>
				<a href="/sign-up/to-help">
					Looking to Help?
				</a>
			</h2>
			<h2>
				<a href="/sign-up/for-help">
					Looking for Help?
				</a>
			</h2>
			<h2>
				<a href="/sign-in">
					Looking to sign in?
				</a>
			</h2>
			<h2>
				<a href="/help">
					Looking for an Explaination?
				</a>
			</h2>
		</div>
	);
};

//TODO
export const ZoneCaptainExplained = () => <div>i don't know either man</div>;
export const HelpZone = () => (
	<div>
		the lead dev is a cat named daxi. you can reach them here:
		<br/>
		<a href="mailto:aljedaxi@gmail.com">
			email
		</a>
		<br/>
		<a href="web.telegram.org/#/im?p=@aljedaxi">
			telegram
		</a>
		<br/>
		or you can see the source code <a href="https://github.com/Mutual-Aid-Machine/meteor-app"> here </a>
	</div>
);

export const HomePage = ({
}) => {
	return (
		<Router
			history={browserHistory}
		>
			<Switch>
				<Route exact path="/" component={Menu} />
				<Route exact path="/sign-in" component={SignInForm} />
				<Route exact path="/what-is-a-zone-captain" component={ZoneCaptainExplained} />
				<Route exact path="/help" component={HelpZone} />
				<Route exact 
					path="/sign-up/:role"
					component={SignUpForm}
				/>
			</Switch>
		</Router>
	);
};
