import React from 'react';
import classNames from 'classnames';

import './form.css';

export const InputGrid = ({children}) => <div className="input-grid">{children}</div>;

export const Caption = ({children}) => <p className="input-grid-caption">{children}</p>;

export const Label = ({children}) => <label className="input-grid-label">{children}:</label>;

export const Field = ({label, children}) => <>
	<label className="input-grid-label">{label}</label>
	<div className="input-grid-field">{children}</div>
	</>

export const TextInput = ({long, value, update, pending}) => (
	<input
		type="text"
		className={classNames({'input-text': true, long, pending})}
		value={value}
		onChange={(e) => update(e.target.value)}
	/>
);

export const IntegerInput = ({value, update, pending}) => (
	<input
		type="number"
		className={classNames({'input-text': true, pending})}
		value={value}
		onChange={(e) => {
			const i = parseInt(e.target.value);
			if(!isNaN(i))
				update(parseInt(e.target.value))
		}}
	/>
);

export const ReadOnly = ({long, value}) => (
	<input
		type="text"
		readOnly
		className={classNames({'input-readonly': true, long})}
		value={value}
	/>
);

export const CheckboxInput = ({value, update, pending, label}) => (
	<label className={classNames({"input-checkbox": true, pending})}>
		<input type="checkbox"
		checked={value}
		onChange={e => update(e.target.checked)}
		/>
		<span>{label}</span>
	</label>
);

