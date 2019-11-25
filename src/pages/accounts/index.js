import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';

import { getAccounts, createAccount, changeAccount, deleteAccount } from '../../api';
import {
        InputGrid,
        Field,
        TextInput,
        CheckboxInput
} from '../../components/form.js';

const AccountListTable = ({accounts, editAccountFunc, deleteAccountFunc}) => {
	return <table className="table">
		<thead>
			<tr>
				<th>Username</th>
				<th>Status</th>
				<th>Flags</th>
				<th></th>
			</tr>
		</thead>
		<tbody>
			{accounts.map(a => <tr key={a.id}>
				<td>{a.username}</td>
				<td>{a.locked && 'Locked'}</td>
				<td>{a.flags}</td>
				<td>
					<button onClick={() => editAccountFunc(a)} className="small button">Edit</button>
					<button onClick={() => deleteAccountFunc(a.id)} className="small danger button">Delete</button>
				</td>
			</tr>)}
		</tbody>
	</table>
}

const EditAccountModal = ({title, user, closeFunc}) => {
	const [form, setForm] = useState(user);
	const vprops = name => ({
		value: form[name],
		update: value => setForm({...form, [name]: value}),
		pending: false
	});

	async function saveAccount() {
		if(!form.username)
			return;

		let flags = [];
		if(form.mod)
			flags.push('MOD');
		if(form.host)
			flags.push('HOST');
		flags = flags.join(' ');

		try {
			if(!user.id) {
				/* No user ID set: we're creating a new user */
				if(!form.password)
					return;

				await createAccount({
					username: form.username,
					password: form.password,
					locked: form.locked,
					flags: flags
				});

			} else {
				await changeAccount(user.id, {
					username: form.username,
					password: form.password,
					locked: form.locked,
					flags: flags
				});
			}
		} catch(e) {
			setForm({...form, error: e.toString()});
			return;
		}

		closeFunc(true);
	}

	return <>
		<h2>{title}</h2>
		{form.error && <p className="alert-box">{form.error}</p>}
		<InputGrid>
			<Field label="Username">
				<TextInput {...vprops('username')} />
			</Field>
			<Field label="Password">
				<TextInput {...vprops('password')} />
			</Field>
			<Field label="Options">
				<CheckboxInput label="Locked" {...vprops('locked')} />
				<CheckboxInput label="Moderator" {...vprops('mod')} />
				<CheckboxInput label="Can host" {...vprops('host')} />
			</Field>
		</InputGrid>
		<p>
			<button onClick={saveAccount} className="button">Save</button>
			<button onClick={e => closeFunc(false)} className="button">Cancel</button>
		</p>
		</>
}

export default function() {
	const [accounts, setAccounts] = useState([]);
	const [error, setError] = useState(null);
	const [editing, setEditing] = useState(null);
	const [confirmDelete, setConfirmDelete] = useState(null);

	function refreshAccountList() {
		getAccounts().then(setAccounts).catch(setError);
	}

	useEffect(refreshAccountList, []);

	function addAccount() {
		setEditing({
			title: 'New account',
			user: {
				username: '',
				password: '',
				locked: false,
				mod: false,
				host: true
			}
		});
	}

	function editAccount(user) {
		setEditing({
			title: 'Edit ' + user.username,
			user: {
				id: user.id,
				username: user.username,
				password: '',
				locked: user.locked,
				mod: user.flags.indexOf('MOD')>=0,
				host: user.flags.indexOf('HOST')>=0
			}
		});
	}

	function removeAccount() {
		deleteAccount(confirmDelete).then(refreshAccountList).catch(e => setError(e.toString()));
		setConfirmDelete(null);
	}

	return <div className="content-box">
		<h2>User accounts</h2>
		{error && <p className="alert-box">{error}</p>}
		{accounts && <AccountListTable
			accounts={accounts}
			editAccountFunc={editAccount}
			deleteAccountFunc={setConfirmDelete}
			/>}
		<p><button onClick={addAccount} className="button">Create</button></p>
		<Modal
			isOpen={editing !== null}
			onRequestClose={() => setEditing(null)}
		>
			{editing && <EditAccountModal
				title={editing.title}
				user={editing.user}
				closeFunc={(needRefresh) => {
					setEditing(null);
					if(needRefresh)
						refreshAccountList()
					}}
				/>}
		</Modal>
		<Modal
			isOpen={confirmDelete !== null}
			onRequestClose={() => setConfirmDelete(null)}
		>
			<h2>Really delete?</h2>
			<p>
				<button onClick={removeAccount} className="danger button">Delete</button>
				<button onClick={e => setConfirmDelete(null)} className="button">Cancel</button>
			</p>
		</Modal>
	</div>
}

