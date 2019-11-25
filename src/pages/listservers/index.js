import React, { useState, useEffect } from 'react';

import { getListserverWhitelist, setListserverWhitelist} from '../../api';

const WhitelistTable = ({whitelist, deleteFunc, updateFunc, addFunc}) => {
	return <table className="table">
		<thead>
			<tr>
				<th>API URL</th>
				<th></th>
			</tr>
		</thead>
		<tbody>
			{whitelist.map((item, row) => <tr key={row}>
				<td><input className="input-text long" type="input" value={item} onChange={e => updateFunc(e.target.value, row)} /></td>
				<td>
					<button onClick={() => deleteFunc(row)} className="small danger button">Delete</button>
				</td>
			</tr>)}
			<tr>
				<td></td>
				<td><button onClick={addFunc} className="small button">Add</button></td>
			</tr>
		</tbody>
	</table>
}

export default function() {
	const [whitelist, setWhitelist] = useState(null);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState(null);

	function refreshWhitelist() {
		getListserverWhitelist().then(setWhitelist).catch(setError);
	}

	function saveChanges() {
		setListserverWhitelist(whitelist)
			.then(result => {
				setWhitelist(result);
				setError(null);
			})
			.catch(setError)
			.finally(() => setSaving(false))
	}


	useEffect(refreshWhitelist, []);

	function removeRow(row) {
		setWhitelist({
			...whitelist,
			whitelist: whitelist.whitelist.filter((_,i) => i !== row)
		});
	}

	function updateRow(value, index) {
		setWhitelist({
			...whitelist,
			whitelist: whitelist.whitelist.map((v,i) => i === index ? value : v)
		});
	}

	function addRow() {
		setWhitelist({
			...whitelist,
			whitelist: [...whitelist.whitelist, '']
		});
	}

	return <div className="content-box">
		<h2>List server URL whitelist</h2>
		{error && <p className="alert-box">{error.toString()}</p>}
		{whitelist && <>
			<WhitelistTable
				whitelist={whitelist.whitelist}
				deleteFunc={removeRow}
				updateFunc={updateRow}
				addFunc={addRow}
				/>
			<p><label className="input-checkbox">
					<input type="checkbox"
					checked={whitelist.enabled}
					onChange={e => setWhitelist({...whitelist, enabled: e.target.checked})}
					/>
					<span>Use whitelist</span>
				</label>
			</p>
		</>}

		<p><button onClick={saveChanges} className="button">{saving ? "Saving..." : "Save changes"}</button></p>
	</div>
}

