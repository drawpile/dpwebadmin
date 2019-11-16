import React from 'react';
import {
  Link,
  useRouteMatch
} from "react-router-dom";

import { getSessions } from '../../api/';

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
				<td><abbr title={s.id}>{s.id.substr(0, 8)}...</abbr></td>
				<td>{s.alias}</td>
				<td>{s.userCount} / {s.maxUserCount}</td>
				<td></td>
				<td>{(s.size / (1024 *1024)).toFixed(2)} MB</td>
				<td>{s.startTime}</td>
			</tr>)}
		</tbody>
	</table>
}

export class SessionListPage extends React.Component {
	state = {}
	timer = null;

	componentDidMount() {
		this.refreshList();
		this.timer = setInterval(this.refreshList, 10000);
	}

	componentWillUnmount() {
		clearInterval(this.timer);
	}

	refreshList = async () => {
		console.log("Refreshing sessions");
		try {
				const sessions = await getSessions();
				this.setState({sessions, error: null});
		} catch(e) {
				this.setState({error: e.toString()});
		}
	}

	render() {
		const { sessions, error } = this.state;
		return <div className="content-box">
			<h2>Sessions</h2>
			{error && <p className="alert-box">{error}</p>}
			{sessions && <SessionTable sessions={sessions} />}
		</div>
	}
}

