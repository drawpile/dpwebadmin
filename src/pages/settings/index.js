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
			const abuseReportAvailable = settings['abusereport'] !== undefined;
			const extAuthAvailable = settings['extauth'] !== undefined;

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
					<CheckboxInput label="Allow anyone to host" {...vprops('allowGuestHosts')} />
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

				<Caption>Abuse reporting</Caption>
				<Field>
					<CheckboxInput label="Enable" enabled={abuseReportAvailable} {...vprops('abusereport')} />
				</Field>
				<Field label="Auth token">
					<TextInput long enabled={abuseReportAvailable} {...vprops('reporttoken')} />
				</Field>

				<Caption>External authentication</Caption>
				<Field>
					<CheckboxInput label="Enable" enabled={extAuthAvailable} {...vprops('extauth')} />
				</Field>
				<Field label="Validation key">
					<TextInput long enabled={extAuthAvailable} {...vprops('extauthkey')} />
				</Field>
				<Field label="User group">
					<TextInput enabled={extAuthAvailable} {...vprops('extauthgroup')} />
				</Field>
				<Field>
					<CheckboxInput label="Permit guest logins when ext-auth server is unreachable" enabled={extAuthAvailable} {...vprops('extauthfallback')} />
					<CheckboxInput label="Allow ext-auth moderators" enabled={extAuthAvailable} {...vprops('extauthmod')} />
					<CheckboxInput label="Allow ext-auth hosts" enabled={extAuthAvailable} {...vprops('extauthhost')} />
					<CheckboxInput label="Use ext-auth avatars" enabled={extAuthAvailable} {...vprops('extAuthAvatars')} />
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

