import React, {useState} from 'react';
import { Router, Route, Switch, useParams, useHistory,
	Redirect } from 'react-router';
import { createBrowserHistory } from 'history';
import { useTracker } from 'meteor/react-meteor-data';
import { Accounts } from 'meteor/accounts-base';
import { People } from '/imports/api/collections.js'
import { Form, Button} from 'react-bootstrap';
import {AccountUiWrapper} from './SignUpStuff';
import Geocoder from 'react-mapbox-gl-geocoder';
import { validate } from 'email-validator';
import {
	compose,
	omit,
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

const FormRow = ({
	label, value, setter, description, _id,
	type = 'text',
	required = false,
	options = [],
	rows = 3,
}) => {
	const {Group, Label, Control, Text} = Form;
	const option = r => (
		<option 
			value={r}
			key={r}
		>
			{r}
		</option>
	);

	const control = type === 'select' ? (
		<Control
			required={required}
			value={value}
			onChange={handleChange(setter)}
			as={type}
			placeholder={description}
		>
			{options.map(option)}
		</Control>
	) : type === 'textarea' ? (
		<Control
			required={required}
			value={value}
			onChange={handleChange(setter)}
			as={type}
			rows={rows}
			placeholder={description}
		/>
	) : (
		<Control
			required={required}
			value={value}
			onChange={handleChange(setter)}
			type={type}
			placeholder={description}
		/>
	);

	return (
		<div
			key={_id}
		>
			<Label>{label}</Label>
			{control}
		</div>
	);
};

export const SignUpForm = () => {
	const {Group, Label, Control, Text} = Form;
	const {role: suppliedRole} = useParams();
	const history = useHistory();
	const mapAccess = {
		mapboxApiAccessToken: Meteor.settings.public.MAPBOX_TOKEN,
	};
	const header = {
		fontSize: '1.15em',
	};

	const roles = ['to-help', 'zone-captain', 'for-help'];
	const helpyRoles = ['to-help', 'zone-captain'];
	const needsHelpy = ['for-help'];
	const selectableRoles = ['to-help', 'for-help'];
	const isHelpy = x => includes(x, helpyRoles);

	const [name, setName] = useState('');
	const [message, setMessage] = useState('');
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [email, setEmail] = useState('');
	const [phoneNumber, setPhoneNumber] = useState('');
	const [error, setError] = useState('');
	const [role, setRole] = useState(suppliedRole);
	const [viewport, setViewport] = useState({});
	const [geometry, setGeometry] = useState({});
	const [geographyContext, setGeographyContext] = useState([]);
	//Sub-units?
	const [address, setAddress] = useState('');

	const fields = [
		{ 
			_id: 'role',
			label: 'Role *',
			setter: setRole,
			value: role,
			type: 'select',
			options: selectableRoles,
			required: true,
		},
		{
			_id: 'username',
			label: 'Username *',
			value: username,
			setter: setUsername,
			description: 'How would you like to log in?',
			required: true,
		},
		{
			_id: 'email',
			label: 'E-mail *',
			value: email,
			setter: setEmail,
			description: 'Would you like to be emailed? If so, where?',
			required: true,
		},
		{
			_id: 'password',
			type: 'password',
			label: 'Password *',
			value: password,
			setter: setPassword,
			description: 'password for the system',
			required: true,
		},
		{
			_id: 'confirmPassword',
			type: 'password',
			label: 'Confirm Password *',
			value: confirmPassword,
			setter: setConfirmPassword,
			description: 'we can send you an email if you forget.',
			required: true,
		},
		{
			_id: 'name',
			label: 'Name',
			value: name,
			setter: setName,
			description: 'What would you like to be called?',
		},
		{
			_id: 'phoneNumber',
			label: 'Phone Number',
			value: phoneNumber,
			setter: setPhoneNumber,
			description: 'Text/Voice is the fastest way for us to get in touch.'
		},
		{
			_id: 'message',
			label: 'Message for your zone captain',
			value: message,
			setter: setMessage,
			description: 'Anything else you might want to say.',
			type: 'textarea',
		},
	];
	const extraFields = [
		{ 
			_id: 'address',
			value: address,
			required: true,
		},
		{ 
			_id: 'geometry',
			value: geometry,
			required: true,
		},
		{ 
			_id: 'geographyContext',
			value: geographyContext,
			required: true,
		},
	];

	const isIn = obj => k => Boolean(obj[k]);

	const handleSubmit = e => {
		e.preventDefault();
		const allFields = fields.concat(extraFields);
		const requiredFields = allFields
			.filter(prop('required'))
			.map(prop('_id'));
		const values = Object.fromEntries(
			allFields.map(({_id, value}) => [_id, value])
		);

		const meta = {
			createdAt: new Date(),
			testing: true,
		};

		if (
			requiredFields.every(isIn(values)) &&
			password === confirmPassword
		) {
			const omitBaseProps = omit(['username', 'email', 'password']);
			const mergeMetaData = mergeRight(meta);

			const setErrorMessage = compose(
				setError,
				prop('message'),
			);
			const {username, email, password} = values;
			const profile = omitBaseProps(mergeMetaData(values));
			const options = { username, email, password, profile };
			Meteor.call('addPerson', options, (error, result) => {
				if (error) {
					setError(error.message);
					return;
				} 
				history.push(`/account-created/${role}`);
			})
		} else {
			setError("Please give us a name, a means of contact, and a location.");
		}
	};

	const handleSelect = (viewport, item) => {
		const {text, geometry, context} = item;
		setAddress(text);
		setGeometry(geometry);
		setGeographyContext(context);
	};

	const captainDialog = isHelpy(role) ? (
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
			<h2>
				Help us help you:
			</h2>
				<p style={header}>
				We'll forward this information to your nearest <a href="/what-is-a-zone-captain">zone captain</a>,
				<br />
				They'll get in touch with you to {isHelpy(role) ? 'help you help others' : 'get you the help you need'}.
				<br />
				We recognize it's overly simplistic to group people into 'can help' and 'needs help'
				<br />
				(Everyone has something to offer, and no one man is an island)
				<br />
				But we've got to get this app started somehow.
				</p>
			<h2>{error}</h2>
			<Group>
				{
					/* TODO
					 * how can you help?
					 */
				}
				{fields.map(FormRow)}
				{/*captainDialog*/}
				<Label>
					Address or Postal Code *
				</Label>
				<Geocoder
					{...mapAccess}
					onSelected={handleSelect}
					viewport={viewport}
					hideOnSelect={false}
					updateInputOnSelect={true}
				/>
			</Group>
			<Button
				onClick={handleSubmit}
			>
				submit
			</Button>
		</Form>
	);
};

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

export const Success = props => {
	const {role} = useParams();
	const user = Meteor.user();
	console.log('user', user);
	return (
		<div>
			{role}
		</div>
	);
};

const browserHistory = createBrowserHistory();
export const RouteyAppyThing = ({
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
					path="/account-created/:role" 
					component={Success}
				/>
				<Route exact 
					path="/sign-up/:role"
					component={SignUpForm}
				/>
			</Switch>
		</Router>
	);
};

export const HomePage = RouteyAppyThing;
