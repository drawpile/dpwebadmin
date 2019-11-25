import React from 'react';
import {
	BrowserRouter as Router,
	Switch,
	Route,
	NavLink
} from "react-router-dom";

import StatusPage from './pages/status/';
import SettingsPage from './pages/settings/';
import ListServerPage from './pages/listservers/';
import SessionsPage from './pages/sessions/';
import UsersPage from './pages/users/';
import BanListPage from './pages/bans/';
import AccountsPage from './pages/accounts/';
import LogsPage from './pages/logs/';

import './App.css';

function App() {
	return <Router basename={process.env.REACT_APP_BASENAME}>
		<header id="header">
			<nav>
				<h1>Admin</h1>
				<ul>
					<li><NavLink exact to="/">Status</NavLink></li>
					<li><NavLink to="/settings/">Settings</NavLink></li>
					<li><NavLink to="/listservers/">List servers</NavLink></li>
					<li><NavLink to="/sessions/">Sessions</NavLink></li>
					<li><NavLink to="/users/">Users</NavLink></li>
					<li><NavLink to="/bans/">Bans</NavLink></li>
					<li><NavLink to="/accounts/">Accounts</NavLink></li>
					<li><NavLink to="/logs/">Logs</NavLink></li>
				</ul>
			</nav>
		</header>
		<section id="content">
			<Switch>
				<Route exact path="/"><StatusPage /></Route>
				<Route path="/settings/"><SettingsPage /></Route>
				<Route path="/listservers/"><ListServerPage /></Route>
				<Route path="/sessions/"><SessionsPage /></Route>
				<Route path="/users/"><UsersPage /></Route>
				<Route path="/bans/"><BanListPage /></Route>
				<Route path="/accounts/"><AccountsPage /></Route>
				<Route path="/logs/"><LogsPage /></Route>
			</Switch>
		</section>
	</Router>
}

export default App;
