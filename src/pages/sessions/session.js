import React from 'react';
import Modal from 'react-modal';

import classNames from 'classnames';

import {
	InputGrid,
	Field,
	TextInput,
	IntegerInput,
	ReadOnly,
	CheckboxInput
} from '../../components/form.js';
import { ModalContent } from './modals.js';

import { formatFileSize,reformatSettings } from '../../api/format.js';
import { getSession, changeSession, changeUser } from '../../api/';


const MODAL_SMALL_STYLE = {
	content: {
		top: '20%',
		left: '50%',
		right: 'auto',
		bottom: 'auto',
		marginRight: '-50%',
		transform: 'translate(-50%, -50%)'
	}
}

const SessionInfo = ({session, openModal, vprops}) => {
	return <div>
		<InputGrid>
			<Field label="Title">
				<TextInput long {...vprops('title')} />
			</Field>
			<Field label="ID">
				<ReadOnly long value={session.id} />
			</Field>
			<Field label="Alias">
				<ReadOnly value={session.alias} />
			</Field>
			<Field label="Started by">
				<ReadOnly value={session.founder} />
			</Field>
			<Field label="Started at">
				<ReadOnly value={session.startTime} />
			</Field>
			<Field label="Size">
				<ReadOnly value={(session.size / (1024*1024)).toFixed(2) + " MB"} />
				/
				<ReadOnly value={(session.maxSize / (1024*1024)).toFixed(2) + " MB"} />
			</Field>
			<Field label="Autoreset threshold">
				<TextInput {...vprops('resetThreshold')} />
			</Field>
			<Field label="Users">
				<ReadOnly value={session.userCount} />
				/
				<IntegerInput {...vprops('maxUserCount')} />
			</Field>
			<Field>
				<CheckboxInput label=" 🚪 Closed to new users" {...vprops('closed')} />
				<CheckboxInput label=" 👥 Registered users only" {...vprops('authOnly')} />
				<CheckboxInput label=" 💾 Persists without users" {...vprops('persistent')} />
				<CheckboxInput label=" 🔞 Not suitable for minors (NSFM)" {...vprops('nsfm')} />
				<CheckboxInput label=" ⏰ Ignores idle timeout" {...vprops('idleOverride')} />
				<CheckboxInput label=" 🌐 Allow joining via WebSocket " {...vprops('allowWeb')} />
			</Field>
		</InputGrid>
		<p>
			<button onClick={e => openModal('setPassword')} className="button">{session.hasPassword ? "Change" : "Set"} password</button>
			<button onClick={e => openModal('setOpword')} className="button">{session.hasOpword ? "Change" : "Set"} opword</button>
			<button onClick={e => openModal('terminate')} className="danger button">Terminate</button>
		</p>
	</div>
}

const UserListBox = ({sessionId, users, openModal}) => {
	function changeUserOp(user) {
		changeUser(sessionId, user.id, {op: !user.op});
	}

	return <div className="content-box">
		<h3>Users</h3>
		<table className="table">
			<thead>
				<tr>
					<th>ID</th>
					<th>Name</th>
					<th>IP</th>
					<th>Flags</th>
					<th>Status</th>
					<th></th>
				</tr>
                </thead>
                <tbody>
					{users.map(u => <tr key={u.id} className={classNames({offline: !u.online})}>
						<td>{u.id}</td>
						<td>{u.name}</td>
						<td>{u.ip}</td>
						<td>{u.muted && "Muted"} {u.mod && "MOD"} {u.ghost && "GHOST"} {u.op && "Op"}</td>
						<td>{u.online ? "online" : "offline"}</td>
						<td>{u.online && <>
							{!u.mod && <button onClick={() => changeUserOp(u)} className="small button">{u.op ? "De-op" : "Op"}</button>}
							<button onClick={() => openModal('message', {userName: u.name, userId: u.id})} className="small button">Message</button>
							<button onClick={() => openModal('kick', {userName: u.name, userId: u.id})} className="small danger button">Kick</button>
							</>}
						</td>
					</tr>)}
                </tbody>
        </table>
		<p>
			<button onClick={() => openModal('message')} className="button">Message all</button>
		</p>
	</div>
}

const ListingsBox = ({listings}) => {
	return <div className="content-box">
		<h3>Listings</h3>
		<table className="table">
			<thead>
				<tr>
					<th>ID</th>
					<th>URL</th>
					<th>Code</th>
					<th>Type</th>
					<th></th>
				</tr>
                </thead>
                <tbody>
					{listings.map(l => <tr key={l.id}>
						<td>{l.id}</td>
						<td>{l.url}</td>
						<td>{l.roomcode}</td>
						<td>{l.private ? "Private" : "Public"}</td>
						<td>
							<button className="small danger button">Unlist</button>
						</td>
					</tr>)}
                </tbody>
        </table>
	</div>
}

export class SessionPage extends React.Component {
	state = {
		changed: {},
		modal: {
			active: null
		}
	}
	refreshTimer = null;
	debounceTimer = null;

	componentDidMount() {
		this.refreshList();
		this.timer = setInterval(this.refreshList, 10000);
	}

	componentWillUnmount() {
		clearInterval(this.timer);
		if(this.debounceTimer !== null) {
			clearTimeout(this.debounceTimer);
		}
	}

	refreshList = async () => {
		try {
			const session = await getSession(this.props.sessionId);
			this.setStateSession(session);
		} catch(e) {
			this.setState({error: e.toString()});
		}
	}

	setStateSession(session) {
		reformatSettings(session, {
			resetThreshold: formatFileSize,
		});

		this.setState({session, error: null});
	}

	updateSetting(key, value) {
		this.setState(d => ({
			session: {
				...d.session,
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
			this.updateSettings(this.state.session.id, this.state.changed);
			this.setState({changed: {}});
			this.debounceTimer = null;
		}, 1000);
	}

	async updateSettings(id, changed) {
		try {
			const session = await changeSession(id, changed);
			this.setStateSession(session);
		} catch(e) {
			this.setState({
				error: e.toString()
			});
		}
	}

	openModal = (dialog, opts={}) => {
		this.setState({
			modal: {
				...opts,
				active: dialog,
				sessionId: this.props.sessionId,
			}
		});
	}

	closeModal = () => {
		this.setState({
			modal: {
				active: null
			}
		});
	}

	render() {
		const { session, changed, error, modal } = this.state;
		const vprops = name => ({
			value: session[name],
			update: value => this.updateSetting(name, value),
			pending: changed[name] !== undefined
		});

		return <>
			<div className="content-box">
				<h2>Session</h2>
				{error && <p className="alert-box">{error}</p>}
				{session && <SessionInfo session={session} openModal={this.openModal} vprops={vprops} />}
			</div>
			{session &&
				<UserListBox sessionId={this.props.sessionId} users={session.users} openModal={this.openModal} />
			}
			{session &&
				<ListingsBox listings={session.listings} />
			}
			<Modal
				isOpen={modal.active !== null}
				onRequestClose={this.closeModal}
				style={MODAL_SMALL_STYLE}
			>
				<ModalContent modal={modal} closeFunc={this.closeModal} />
			</Modal>
		</>
	}
}

