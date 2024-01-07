import React from 'react';
import Modal from 'react-modal';
import {
  Link,
  useRouteMatch
} from "react-router-dom";

import { getSessions } from '../../api/';
import { ModalContent } from './modals.js';

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

const SessionTable = ({sessions}) => {
	const { path } = useRouteMatch();

	return <table className="table">
		<thead>
			<tr>
				<th>Title</th>
				<th>ID</th>
				<th>Alias</th>
				<th>Users</th>
				<th>Options</th>
				<th>Size</th>
				<th>Uptime</th>
			</tr>
		</thead>
		<tbody>
			{sessions.map(s => <tr key={s.id}>
				<td><Link to={`${path}${s.id}`}>{s.title || "(untitled)"}</Link></td>
				<td><Link to={`${path}${s.id}`}><abbr title={s.id}>{s.id.substr(0, 8)}...</abbr></Link></td>
				<td><Link to={`${path}${s.id}`}>{s.alias}</Link></td>
				<td>{s.userCount} / {s.maxUserCount}</td>
				<td>
					{s.hasPassword && <span title="Password">🔒</span>}
					{s.closed && <span title="Closed to new users">🚪</span>}
					{s.authOnly && <span title="Registered users only">👥</span>}
					{s.persistent && <span title="Persists without users">💾</span>}
					{s.nsfm && <span title="Not suitable for minors (NSFM)">🔞</span>}
					{s.idleOverride && <span title="Ignores idle timeout">⏰</span>}
					{s.allowWeb && <span title="Allow joining via WebSocket">🌐</span>}
				</td>
				<td>{(s.size / (1024 *1024)).toFixed(2)} MB</td>
				<td>{s.startTime}</td>
			</tr>)}
		</tbody>
	</table>
}

export class SessionListPage extends React.Component {
	state = {
		modal: {
			active: null,
		},
	};
	timer = null;

	componentDidMount() {
		this.refreshList();
		this.timer = setInterval(this.refreshList, 10000);
	}

	componentWillUnmount() {
		clearInterval(this.timer);
	}

	refreshList = async () => {
		try {
				const sessions = await getSessions();
				this.setState({sessions, error: null});
		} catch(e) {
				this.setState({error: e.toString()});
		}
	}

	openModal = (dialog, opts={}) => {
		this.setState({
			modal: {
				...opts,
				active: dialog,
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
		const { sessions, error, modal } = this.state;
		return <div className="content-box">
			<h2>Sessions</h2>
			{error && <p className="alert-box">{error}</p>}
			{sessions && <button onClick={() => this.openModal('message')} className="button">Message all sessions</button>}
			{sessions && <SessionTable sessions={sessions} />}
			<Modal
				isOpen={modal.active !== null}
				onRequestClose={this.closeModal}
				style={MODAL_SMALL_STYLE}
			>
				<ModalContent modal={modal} closeFunc={this.closeModal} />
			</Modal>
		</div>
	}
}

