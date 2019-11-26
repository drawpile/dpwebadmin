import React, { useState, useRef } from 'react';
import { useHistory } from 'react-router-dom';
import { tryLogin } from '../../api';
import { InputGrid, Field } from '../../components/form.js';

export default function() {
	const usernameEl = useRef(null);
	const passwordEl = useRef(null);
	const [error, setError] = useState(null);
	const history = useHistory();

	async function doLogin() {
		try {
			const ok = await tryLogin(usernameEl.current.value, passwordEl.current.value);
			if(ok) {
				history.replace('/');

			} else {
				setError("Incorrect username or password");
			}
		} catch(e) {
			setError(e.toString());
		}
	}

	return <div className="content-box">
		<h2>Log in</h2>
		{error && <p className="alert-box">{error}</p>}
		<form onSubmit={e => { e.preventDefault(); doLogin(); }}>
			<InputGrid>
				<Field label="Username">
					<input type="text" className="input-text" ref={usernameEl} />
				</Field>
				<Field label="Password">
					<input type="password" className="input-text" ref={passwordEl} />
				</Field>
				<Field>
					<input type="submit" className="button" value="Log in" />
				</Field>
			</InputGrid>
		</form>
	</div>
}

