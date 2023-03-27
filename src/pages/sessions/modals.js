import React, { useState, useContext } from 'react';
import { useHistory } from 'react-router-dom';

import { changeSession, terminateSession, changeUser, kickUser } from '../../api';

/** Modal building blocks */
const ModalContext = React.createContext({});

const ModalHeader = ({children}) => <h2>{children}</h2>
const ModalButtons = ({children}) => <p>{children}</p>

const OkButton = ({label, func, children}) => {
	const ctx = useContext(ModalContext);
	function clickHandler() {
		// TODO disable button while processing
		func().then(ctx.closeFunc);
	}
	return <button onClick={clickHandler} className="danger button">{label}</button>
}

const CancelButton = ({label="Cancel"}) => {
	const ctx = useContext(ModalContext);
	return <button onClick={e => ctx.closeFunc()} className="button">{label}</button>
}


/** Modal dialogs */
function SetPasswordModal({targetSetting, title}) {
	const [passwd, setPasswd] = useState('');
	const ctx = useContext(ModalContext);

	function setPassword() {
		return changeSession(ctx.sessionId, { [targetSetting]: passwd });
	}

	return <>
		<ModalHeader>Set session {title}</ModalHeader>
		<input
			type="password" 
			className="input-text"
			onChange={e => setPasswd(e.target.value)}
			/>
		<ModalButtons>
			<OkButton func={setPassword} label="Set" />
			<CancelButton />
		</ModalButtons>
		</>
}

function TerminateSessionModal() {
	const ctx = useContext(ModalContext);
	const history = useHistory();

	async function terminate() {
		await terminateSession(ctx.sessionId);
		history.replace('/sessions/');
	}

	return <>
		<ModalHeader>Terminate session</ModalHeader>
		<p>Really terminate session?</p>
		<ModalButtons>
			<OkButton func={terminate} label="Terminate" />
			<CancelButton />
		</ModalButtons>
		</>
}

function KickUserModal() {
	const ctx = useContext(ModalContext);

	async function kick() {
		await kickUser(ctx.sessionId, ctx.userId);
	}

	return <>
		<ModalHeader>Kick user</ModalHeader>
		<p>Really kick {ctx.userName}?</p>
		<ModalButtons>
			<OkButton func={kick} label="Kick" />
			<CancelButton />
		</ModalButtons>
		</>
}

function MessageModal() {
	const [message, setMessage] = useState('');
	const ctx = useContext(ModalContext);

	function sendMessage() {
		if(ctx.userId) {
			return changeUser(ctx.sessionId, ctx.userId, { alert: message });
		} else {
			return changeSession(ctx.sessionId, { alert: message });
		}
	}

	return <>
		<ModalHeader>Message {ctx.userName || "everyone"}</ModalHeader>
		<input
			type="text" 
			className="input-text"
			style={{width: "600px"}}
			onChange={e => setMessage(e.target.value)}
			/>
		<ModalButtons>
			<OkButton func={sendMessage} label="Send" />
			<CancelButton />
		</ModalButtons>
		</>
}

export function ModalContent({modal, closeFunc}) {
	let m;
	switch(modal.active) {
	case 'setPassword': m = <SetPasswordModal targetSetting='password' title="password" />; break;
	case 'setOpword': m = <SetPasswordModal targetSetting='opword' title="opword" />; break;
	case 'terminate': m = <TerminateSessionModal />; break;
	case 'message': m = <MessageModal />; break;
	case 'kick': m = <KickUserModal />; break;
	default: return null;
	}

	return <ModalContext.Provider value={{...modal, closeFunc}}>
		{m}
		</ModalContext.Provider>
}


