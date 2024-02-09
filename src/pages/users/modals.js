import React, { useContext } from 'react';

import { kickUserByUid } from '../../api';

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
function KickUserModal() {
	const ctx = useContext(ModalContext);

	async function kick() {
		await kickUserByUid(ctx.uid);
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

export function ModalContent({modal, closeFunc}) {
	let m;
	switch(modal.active) {
	case 'kick': m = <KickUserModal />; break;
	default: return null;
	}

	return <ModalContext.Provider value={{...modal, closeFunc}}>
		{m}
		</ModalContext.Provider>
}


