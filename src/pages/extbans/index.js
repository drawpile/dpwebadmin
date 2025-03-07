import React, { useState, useEffect } from "react";
import {
  changeExtBan,
  getExtBanList,
  refreshExtBans as checkExtBanList,
} from "../../api";

const ExtBanListTable = ({ bans, setBanEnabledFunc, locked }) => {
  return (
    <table className="table">
      <thead>
        <tr>
          <th>Id</th>
          <th>Expires</th>
          <th>Comment</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {bans.map((b) => (
          <tr key={b.id}>
            <td>{b.id}</td>
            <td>{b.expires}</td>
            <td>{b.comment}</td>
            <td>
              {b.enabled ? (
                <button
                  onClick={() => setBanEnabledFunc(b.id, false)}
                  className="button small danger"
                  disabled={locked}
                >
                  Disable
                </button>
              ) : (
                <button
                  onClick={() => setBanEnabledFunc(b.id, true)}
                  className="button small"
                  disabled={locked}
                >
                  Enable
                </button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

const ExtBanListContent = ({
  extBans: { bans, config, status },
  setBanEnabledFunc,
  locked,
}) => {
  return (
    <>
      <dl>
        <dt>Status:</dt>
        <dd>
          {status.active ? "active" : "inactive"},{" "}
          {status.started ? "started" : "stopped"}
        </dd>
        <dt>Check interval:</dt>
        <dd>{status.intervalMsecs}ms</dd>
        <dt>Next check in:</dt>
        <dd>{status.msecsUntilNextCheck}ms</dd>
        <dt>Source URL:</dt>
        <dd>{status.url}</dd>
        <dt>Cache key:</dt>
        <dd>{config.extBansCacheKey}</dd>
      </dl>
      <ExtBanListTable
        bans={bans}
        setBanEnabledFunc={setBanEnabledFunc}
        locked={locked}
      />
    </>
  );
};

export default function () {
  const [extBans, setExtBans] = useState(null);
  const [error, setError] = useState(null);

  function refreshExtBanList() {
    getExtBanList().then(setExtBans).catch(setError);
  }

  function refreshNow() {
    setExtBans(null);
    setTimeout(refreshExtBanList, 200);
  }

  function checkNow() {
    setExtBans(null);
    checkExtBanList()
      .then(setTimeout.bind(undefined, refreshExtBanList, 1000))
      .catch(setError);
  }

  function setBanEnabled(id, enabled) {
    changeExtBan(id, { enabled }).then(refreshExtBanList).catch(setError);
  }

  useEffect(refreshExtBanList, []);

  const locked = extBans?._locked;
  return (
    <div className="content-box">
      <h2>External bans</h2>
      {error && <p className="alert-box">{error.toString()}</p>}
      {locked && <p className="locked-box">This section is locked.</p>}
      <button onClick={refreshNow} className="button">
        Refresh
      </button>
      <button onClick={checkNow} className="button">
        Check now
      </button>
      {extBans && (
        <ExtBanListContent
          extBans={extBans}
          setBanEnabledFunc={setBanEnabled}
          locked={locked}
        />
      )}
    </div>
  );
}
