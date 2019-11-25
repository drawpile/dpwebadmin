const APIROOT = '/api'

async function doGet(path) {
	const response = await fetch(APIROOT + path);
	if(!response.ok) {
		throw new Error(response.statusText);
	}

	return await response.json();
}

async function doSend(path, method, body) {
	const response = await fetch(APIROOT + path, {
		method: method,
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(body)
	});

	if(response.status === 400) {
		const body = await response.json();
		if(body.message !== undefined)
			throw new Error(body.message);
	}

	if(!response.ok) {
		throw new Error(response.statusText);
	}

	return await response.json();
}

async function doDelete(path) {
	const response = await fetch(APIROOT + path, {
		method: 'DELETE'
	});
	if(!response.ok) {
		throw new Error(response.statusText);
	}
}

export function getStatus() { return doGet('/status/'); }

export function getServerSettings() { return doGet('/server/'); }
export function setServerSettings(settings) { return doSend('/server/', 'PUT', settings); }

export function getListserverWhitelist() { return doGet('/listserverwhitelist/'); }
export function setListserverWhitelist(whitelist) { return doSend('/listserverwhitelist/', 'PUT', whitelist); }

export function getSessions() { return doGet('/sessions/'); }
export function getSession(id) { return doGet(`/sessions/${id}`); }
export function changeSession(id, changes) { return doSend(`/sessions/${id}`, 'PUT', changes); }
export function terminateSession(id) { return doDelete(`/sessions/${id}`); }

export function getUsers() { return doGet('/users/'); }
export function changeUser(sessionId, userId, changes) { return doSend(`/sessions/${sessionId}/${userId}`, 'PUT', changes); }
export function kickUser(sessionId, userId) { return doDelete(`/sessions/${sessionId}/${userId}`); }

export function getAccounts() { return doGet('/accounts/'); }
export function createAccount(account) { return doSend('/accounts/', 'POST', account); }
export function changeAccount(accountId, changes) { return doSend(`/accounts/${accountId}`, 'PUT', changes); }
export function deleteAccount(accountId) { return doDelete(`/accounts/${accountId}`); }

export function getBanList() { return doGet('/banlist/'); }
export function addBan(ban) { return doSend('/banlist/', 'POST', ban); }
export function deleteBan(id) { return doDelete(`/banlist/${id}`); }

export function getLogs() { return doGet('/log/'); }
