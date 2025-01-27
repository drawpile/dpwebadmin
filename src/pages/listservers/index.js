import React, { useState, useEffect } from "react";
import { getListserverWhitelist, setListserverWhitelist } from "../../api";

const WhitelistTable = ({
  whitelist,
  deleteFunc,
  updateFunc,
  addFunc,
  locked,
}) => {
  return (
    <table className="table">
      <thead>
        <tr>
          <th>API URL</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {whitelist.map((item, row) => (
          <tr key={row}>
            <td>
              <input
                className="input-text long"
                type="input"
                value={item}
                onChange={(e) => updateFunc(e.target.value, row)}
                disabled={locked}
              />
            </td>
            <td>
              <button
                onClick={() => deleteFunc(row)}
                className="small danger button"
                disabled={locked}
              >
                Delete
              </button>
            </td>
          </tr>
        ))}
        <tr>
          <td></td>
          <td>
            <button
              onClick={addFunc}
              className="small button"
              disabled={locked}
            >
              Add
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  );
};

export default function () {
  const [whitelist, setWhitelist] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  function refreshWhitelist() {
    getListserverWhitelist().then(setWhitelist).catch(setError);
  }

  function saveChanges() {
    setListserverWhitelist(whitelist)
      .then((result) => {
        setWhitelist(result);
        setError(null);
      })
      .catch(setError)
      .finally(() => setSaving(false));
  }

  useEffect(refreshWhitelist, []);

  function removeRow(row) {
    setWhitelist({
      ...whitelist,
      whitelist: whitelist.whitelist.filter((_, i) => i !== row),
    });
  }

  function updateRow(value, index) {
    setWhitelist({
      ...whitelist,
      whitelist: whitelist.whitelist.map((v, i) => (i === index ? value : v)),
    });
  }

  function addRow() {
    setWhitelist({
      ...whitelist,
      whitelist: [...whitelist.whitelist, ""],
    });
  }

  const locked = whitelist?._locked;
  return (
    <div className="content-box">
      <h2>List server URL whitelist</h2>
      {error && <p className="alert-box">{error.toString()}</p>}
      {locked && <p className="locked-box">This section is locked.</p>}
      {whitelist && (
        <>
          <WhitelistTable
            whitelist={whitelist.whitelist}
            deleteFunc={removeRow}
            updateFunc={updateRow}
            addFunc={addRow}
            locked={locked}
          />
          <hr />
          <div className="input-checkbox">
            <label>
              <input
                type="checkbox"
                checked={whitelist.enabled}
                onChange={(e) =>
                  setWhitelist({ ...whitelist, enabled: e.target.checked })
                }
                disabled={locked}
              />
              <span>Use whitelist</span>
            </label>
          </div>
        </>
      )}

      <p>
        <button
          onClick={saveChanges}
          className="button"
          disabled={saving || locked}
        >
          {saving ? "Saving..." : "Save changes"}
        </button>
      </p>
    </div>
  );
}
