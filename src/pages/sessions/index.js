import React from 'react';
import {
  Switch,
  Route,
  useParams,
  useRouteMatch
} from "react-router-dom";

import { SessionListPage } from './sessionlist.js';
import { SessionPage } from './session.js';

function Session() {
	const { sessionId } = useParams();

	return <SessionPage sessionId={sessionId} />
}

export default function() {
	const { path } = useRouteMatch();
	return <Switch>
		<Route exact path={path}><SessionListPage /></Route>
		<Route path={`${path}:sessionId`}><Session /></Route>
	</Switch>
}
