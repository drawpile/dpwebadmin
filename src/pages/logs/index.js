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
			{logs.map((l,idx) => <tr key={idx}>
				<td>{l.timestamp}</td>
				<td>{l.level}</td>
				<td>{l.topic}</td>
				<td>{l.session}</td>
				<td>{l.user}</td>
				<td>{l.message}</td>
			</tr>)}
		</tbody>
	</table>
};

const Filters = ({inputs, setInputs, setParams, setPage}) => {
	function submitFilters(e) {
		e.preventDefault();
		setParams({...inputs});
		setPage(1);
		return false;
	}

	return <form>
		<label className="form-row">
			Session ID:
			<input className="form-field input-text" type="text" onChange={e => setInputs({...inputs, session: e.target.value})}></input>
		</label>
		<label className="form-row">
			User:
			<input className="form-field input-text" type="text" onChange={e => setInputs({...inputs, user: e.target.value})}></input>
		</label>
		<label className="form-row">
			Message:
			<input className="form-field input-text" type="text" onChange={e => setInputs({...inputs, contains: e.target.value})}></input>
		</label>
		<button type="submit" className="button" onClick={submitFilters}>Filter</button>
	</form>
};

const Pagination = ({page, setPage}) => {
	function firstPage(e) {
		e.preventDefault();
		setPage(1);
		return false;
	}

	function prevPage(e) {
		e.preventDefault();
		setPage(page - 1);
		return false;
	}

	function nextPage(e) {
		e.preventDefault();
		setPage(page + 1);
		return false;
	}

	return <>
		{page > 1 ? <a href="#" onClick={firstPage}>« First</a> : '« First'}
		{' | '}
		{page > 1 ? <a href="#" onClick={prevPage}>‹ Previous</a> : '‹ Previous'}
		{' | '}Page {page}{' | '}
		<a href="#" onClick={nextPage}>Next ›</a>
	</>;
};

export default function() {
	const [page, setPage] = useState(1);
	const [logs, setLogs] = useState([]);
	const [error, setError] = useState(null);
	const [busy, setBusy] = useState(false);
	const [inputs, setInputs] = useState({
		session: '',
		user: '',
		contains: '',
	});
	const [params, setParams] = useState({
		session: '',
		user: '',
		contains: '',
	});

	function fetchLogList() {
		setBusy(true);
		getLogs(page, params.session, params.user, params.contains)
			.then(setLogs).catch(setError).finally(setBusy.bind(null, false));
	}

	useEffect(fetchLogList, [page, params]);

	return <>
		<div className="content-box">
			<h2>Server logs</h2>
			{error && <p className="alert-box">{error}</p>}
			<Filters inputs={inputs} setInputs={setInputs} setParams={setParams} setPage={setPage}/>
		</div>
		<div className="content-box">
			<Pagination page={page} setPage={setPage}/>
			<hr/>
			{busy ? 'Loading…' : <LogListTable logs={logs} />}
			<hr/>
			<Pagination page={page} setPage={setPage}/>
		</div>
	</>;
}
