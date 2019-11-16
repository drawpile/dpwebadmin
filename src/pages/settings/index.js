import React from 'react';

import {
	InputGrid,
	Caption,
	Field,
	TextInput,
	CheckboxInput
} from '../../components/form.js';

import * as API from '../../api';
import { formatTime, formatFileSize, formatDays, reformatSettings } from '../../api/format.js';

export default class extends React.Component {
	state = {
		settings: null,
		changed: {},
		fetching: false,
		error: null
	}

	debounceTimer = null;

	updateSetting(key, value) {
		this.setState(d => ({
			settings: {
				...d.settings,
				[key]: value
			},
			changed: {
				...d.changed,
				[key]: value
			}
		}));

		if(this.debounceTimer !== null) {
			clearTimeout(this.debounceTimer);
		}

		this.debounceTimer = setTimeout(() => {
			this.refreshSettings(this.state.changed);
			this.setState({changed: {}});
			this.debounceTimer = null;
		}, 1000);
	}

	async refreshSettings(update=null) {
		try {
			this.setState({fetching: true});

			let settings;
			if(update) {
				settings = await API.setServerSettings(update);
			} else {
				settings = await API.getServerSettings();
			}

			reformatSettings(settings, {
				idleTimeLimit: formatTime,
				clientTimeout: formatTime,
				logpurgedays: formatDays,
				sessionSizeLimit: formatFileSize,
				autoResetThreshold: formatFileSize
			});

			this.setState({
				settings,
				fetching: false,
				error: null
			});
		} catch(e) {
			this.setState({
				fetching: false,
				error: e.toString()
			});
		}

	}
	componentDidMount() {
		this.refreshSettings();
	}

	componentWillUnmount() {
		if(this.debounceTimer !== null) {
			console.log("Clearing timer");
			clearTimeout(this.debounceTimer);
		}
	}

	render() {
		const settings = this.state.settings;

		let inputGrid = null;
		if(settings !== null) {
			const changed = this.state.changed;
			const vprops = name => ({
				value: settings[name],
				update: value => this.updateSetting(name, value),
				pending: changed[name] !== undefined
			});

			inputGrid = <InputGrid>
				<Caption>Server</Caption>

				<Field label="Server title">
					<TextInput long {...vprops('serverTitle')} />
				</Field>
				<Field label="Connection timeout">
					<TextInput {...vprops('clientTimeout')} />
				</Field>
				<Field label="Log retention">
					<TextInput {...vprops('logpurgedays')} />
				</Field>
				<Field>
					<CheckboxInput label="Allow unauthenticated users" {...vprops('allowGuests')} />
					<CheckboxInput label="Allow anyone to host" {...vprops('allowGuestsHosts')} />
				</Field>

				<Caption>Session</Caption>
				<Field label="Welcome message">
					<TextInput long {...vprops('welcomeMessage')} />
				</Field>
				<Field label="Size limit">
					<TextInput {...vprops('sessionSizeLimit')} />
				</Field>
				<Field label="Default autoreset threshold">
					<TextInput {...vprops('autoResetThreshold')} />
				</Field>
				<Field label="Max simultaneous">
					<TextInput {...vprops('sessionCountLimit')} />
				</Field>
				<Field label="Idle time limit">
					<TextInput {...vprops('idleTimeLimit')} />
				</Field>
				<Field>
					<CheckboxInput label="Allow sessions to persist without users" {...vprops('persistence')} />
					<CheckboxInput label="Archive terminated sessions" {...vprops('archive')} />
					<CheckboxInput label="Do not include user list in session announcements" {...vprops('privateUserList')} />
					<CheckboxInput label="Allow custom avatars" {...vprops('customAvatars')} />
				</Field>

				<Caption>External authentication</Caption>
				<Field>
					<CheckboxInput label="Enable" {...vprops('extauth')} />
				</Field>
				<Field label="Validation key">
					<TextInput long {...vprops('extauthkey')} />
				</Field>
				<Field label="User group">
					<TextInput {...vprops('extauthgroup')} />
				</Field>
				<Field>
					<CheckboxInput label="Permit guest logins when ext-auth server is unreachable" {...vprops('extauthfallback')} />
					<CheckboxInput label="Allow ext-auth moderators" {...vprops('extauthmod')} />
					<CheckboxInput label="Use ext-auth avatars" {...vprops('extAuthAvatars')} />
				</Field>
			</InputGrid>;
		}

		return <div className="content-box">
			<h2>Settings</h2>
			{this.state.error && <p className="alert-box">{this.state.error}</p>}
			{inputGrid}
		</div>;
	}
}

