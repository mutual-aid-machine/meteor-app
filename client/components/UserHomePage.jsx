import React, {useEffect, useState} from 'react';
import {useParams} from 'react-router';
import {getProfile} from './people-calls';

export const UserHomePage = ({
	newRegistry = false
}) => {
	const {username} = useParams();
	const [profile, setProfile] = useState({});
	const [error, setError] = useState('');
	const [name, setName] = useState('');

	useEffect(() => {
		getProfile(username)
			.then(profile => {
				setProfile(profile);
				setName(profile.name || username);
			})
			.catch(e => {
				setError(error.message);
				setName(username);
			});
	}, [username]);

	const message = newRegistry ? (
		<h1>
			Hi {profile.name}, thanks for signing up! We'll forward your info to your nearest zone captain.
		</h1>
	) : (
		<h1>
			Welcome back, {name}.
		</h1>
	);

	return (
		<div>
			{message}
		</div>
	);
};
