import React, {useState} from "react";
import {Button, Form, Col} from "react-bootstrap";
import {useHistory, useParams} from "react-router";
import {head, equals, compose, includes, mergeRight, omit, prop} from "ramda";
import people from './people-calls';
import Geocoder from "react-mapbox-gl-geocoder";
import * as validator from 'email-validator';

export const handleChange = setter => e => setter(e.target.value);
const isIn = obj => k => Boolean(obj[k]);

const getCity = compose(
	prop('text'),
	head,
);

const Header = () => {
	const header = {
		fontSize: '1.15em',
	};

	return (
		<div>
			<h2>
				Help us help you:
			</h2>
			<p style={header}>
				We'll forward this information to your nearest <a href="/what-is-a-zone-captain">zone captain</a>,
				<br/>
				They'll get in touch with you to {isHelpy(role) ? 'help you help others' : 'get you the help you need'}.
				<br/>
				We recognize it's overly simplistic to group people into 'can help' and 'needs help'
				<br/>
				(Everyone has something to offer, and no one man is an island)
				<br/>
				But we've got to get this app started somehow.
			</p>
			<p>(password reset doesn't work yet so don't loose that password!)</p>
			<h2>{error}</h2>
		</div>
	);
};

export const roles = [
	{
		_id: 'to-help',
		needsHelp: false,
		selectable: true,
	}, {
		_id: 'zone-captain',
		needsHelp: false,
		selectable: false,
	}, {
		_id: 'for-help',
		needsHelp: true,
		selectable: true,
	},
];

const getId = prop('_id');
const isSelectable = prop('selectable');
const doesntNeedHelp = compose(
	equals(false),
	prop('needsHelp'),
);
const needsHelp = compose(
	equals(true),
	prop('needsHelp'),
);
const helpyRoles = roles.filter(doesntNeedHelp).map(getId);
const needsHelpy = roles.filter(needsHelp).map(getId);
const selectableRoles = roles.filter(isSelectable).map(getId);
const isHelpy = x => includes(x, helpyRoles);

const FormRow = ({
	label, value, setter, description, _id,
	type = 'text',
	required = false,
	options = [],
	rows = 3,
}) => {
	const {Row, Group, Label, Control} = Form;

	const option = r => (
		<option
			value={r}
			key={r}
		>
			{r}
		</option>
	);

	const controlF = p => (
		<Control
			required={required}
			value={value}
			onChange={handleChange(setter)}
			placeholder={description}
			{...p}
		/>
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
		controlF({as: type, rows})
	) : (
		controlF({type})
	);

	return (
		<Group
			key={_id}
			controlId={_id}
			as={Row}
		>
			<Label
				column
				sm={2}
			>{label}</Label>
			<Col
				sm={10}
			>
				{control}
			</Col>
		</Group>
	);
};

export const SignUpForm = () => {
	const {Group, Label} = Form;
	const {role: suppliedRole} = useParams();
	const history = useHistory();
	const mapAccess = {
		mapboxApiAccessToken: Meteor.settings.public.MAPBOX_TOKEN,
	};

	const [name, setName] = useState('');
	const [message, setMessage] = useState('');
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [email, setEmail] = useState('');
	const [phoneNumber, setPhoneNumber] = useState('');
	const [error, setError] = useState('');
	const [role, setRole] = useState(suppliedRole);
	const [viewport] = useState({});
	const [geometry, setGeometry] = useState({});
	const [geographyContext, setGeographyContext] = useState([]);
	//Sub-units?
	const [address, setAddress] = useState('');
	const [validated, setValidated] = useState(false);

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
			type: 'email',
			label: 'E-mail *',
			value: email,
			setter: setEmail,
			description: 'Would you like to be emailed? If so, where?',
			required: true,
			validator: validator.validate.bind(validator),
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

	const handleSubmit = e => {
		e.preventDefault();
		setValidated(true);
		const allFields = fields.concat(extraFields);
		const requiredFields = allFields
			.filter(prop('required'))
			.map(prop('_id'));
		const values = Object.fromEntries(
			allFields.map(({_id, value}) => [_id, value])
		);

		const meta = {
			createdAt: new Date(),
		};

		if (
			requiredFields.every(isIn(values)) &&
			password === confirmPassword
		) {
			const omitBaseProps = omit([
				'username', 'email', 'password', 'confirmPassword'
			]);
			const mergeMetaData = mergeRight(meta);

			const {username, email, password} = values;
			const profile = omitBaseProps(mergeMetaData(values));
			const options = {username, email, password, profile};
			people.addPerson(options)
				.then(_ => people.login({username}, password))
				.then(_ => history.push(`/account-created/${username}/${role}`))
				.catch(err => {
					console.error(err);
					setError(err.message);
				});
		} else {
			setError("Please give us a name, a means of contact, and a location.");
		}
	};

	const handleSelect = (viewport, item) => {
		const {place_name, geometry, context} = item;
		setAddress(place_name);
		setGeometry(geometry);
		setGeographyContext(context);
	};

	return (
		<div>
			<Header />
			<Form 
				validated={validated}
				onSubmit={handleSubmit}
			>
				{
					/* TODO
					 * how can you help?
					 */
				}
				{fields.map(FormRow)}
				{/*captainDialog*/}
				<Group
					controlId='address'
				>
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
		</div>
	);
};
