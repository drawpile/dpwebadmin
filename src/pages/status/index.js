import React from 'react';

import { getStatus } from '../../api/';

export default class extends React.Component {
	state = {}
	timer = null;

	componentDidMount() {
		this.refreshStatus();
		this.timer = setInterval(this.refreshStatus, 10000);
	}

	componentWillUnmount() {
		clearInterval(this.timer);
	}

	refreshStatus = async () => {
		console.log("Refreshing status");
		try {
			const status = await getStatus();
			this.setState({status, error: null});
		} catch(e) {
			this.setState({error: e.toString()});
		}
	}

	render() {
		const { error, status } = this.state;

		let content = null;
		if(status) {
			content = <>
				<p>Server started at {status.started}</p>
				<p>Sessions: {status.sessions} / {status.maxSessions}</p>
				<p>Users: {status.users}</p>
				</>;
		}

		return <div className="content-box">
			<h2>Status</h2>
			{error && <p className="alert-box">{error}</p>}
			{content}
			</div>
	}
}

