import React from 'react';
import {Route, Router, Switch, useParams} from 'react-router';
import {createBrowserHistory} from 'history';
import {AccountUiWrapper} from './SignUpStuff';
import {SignUpForm} from "./SignUp";
import {UserHomePage} from './UserHomePage.jsx';

export const SignInForm = ({
}) => (
	<AccountUiWrapper
	/>
);

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

	return (
		<div>
			{role}
		</div>
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
					Looking for an Explanation?
				</a>
			</h2>
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
					component={() => (
						<UserHomePage
							newRegistry={true}
						/>
					)}
				/>
				<Route exact 
					path="/sign-up/:role"
					component={SignUpForm}
				/>
				<Route exact 
					path="/~/:username"
					component={UserHomePage}
				/>
			</Switch>
		</Router>
	);
};

export const HomePage = RouteyAppyThing;
