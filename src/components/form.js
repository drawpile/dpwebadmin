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

export const TextInput = ({long, enabled=true, value, update, pending}) => (
	<input
		type="text"
		disabled={!enabled}
		className={classNames({'input-text': true, long, pending})}
		value={value}
		onChange={(e) => update(e.target.value)}
	/>
);

export const TextAreaInput = ({long=true, enabled=true, value, update, pending, rows=10, maxLength}) => (
	<textarea
		type="text"
		disabled={!enabled}
		className={classNames({'input-text': true, long, pending})}
		value={value}
		rows={rows}
		maxLength={maxLength}
		onChange={(e) => update(e.target.value)}
	/>
);

export const IntegerInput = ({value, update, pending, enabled=true}) => (
	<input
		type="number"
		disabled={!enabled}
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

export const CheckboxInput = ({value, enabled=true, update, pending, label}) => (
	<div className="input-checkbox">
		<label className={classNames({"disabled": !enabled, pending})}>
			<input type="checkbox"
			checked={value}
			disabled={!enabled}
			onChange={e => update(e.target.checked)}
			/>
			<span>{label}</span>
		</label>
	</div>
);

