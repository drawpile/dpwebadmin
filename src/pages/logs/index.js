import React, { useState, useEffect } from 'react';

import { getLogs } from '../../api';

const LogListTable = ({logs}) => {
	return <table className="table">
		<thead>
			<tr>
				<th>Time</th>
				<th>Level</th>
				<th>Topic</th>
				<th>Session</th>
				<th>User</th>
				<th>Message</th>
			</tr>
		</thead>
		<tbody>
			{logs.map(l => <tr>
				<td>{l.timestamp}</td>
				<td>{l.level}</td>
				<td>{l.topic}</td>
				<td>{l.session}</td>
				<td>{l.user}</td>
				<td>{l.message}</td>
			</tr>)}
		</tbody>
	</table>
}

export default function() {
	const [logs, setLogs] = useState([]);
	const [error, setError] = useState(null);

	function fetchLogList() {
		getLogs().then(setLogs).catch(setError);
	}

	useEffect(fetchLogList, []);

	return <div className="content-box">
		<h2>Server logs</h2>
		{error && <p className="alert-box">{error}</p>}
		{logs && <LogListTable
			logs={logs}
			/>}
	</div>
}	
