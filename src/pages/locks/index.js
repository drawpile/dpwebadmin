import React, { useState, useEffect } from "react";
import { getLocks, putLocks } from "../../api";

const knownSections = {
  server: {
    name: "Settings",
    weight: 1,
  },
  listserverwhitelist: {
    name: "List servers",
    weight: 2,
  },
  sessions: {
    name: "Sessions and users",
    weight: 3,
  },
  bans: {
    name: "Bans",
    weight: 4,
  },
  extbans: {
    name: "Extbans",
    weight: 5,
  },
  accounts: {
    name: "Accounts",
    weight: 6,
  },
};

const LocksForm = ({
  locks: { sections, password, supported },
  changeLocks,
  inputs,
  setInputs,
}) => {
  if (!supported) {
    return <p>Setting locks is only supported when using a config database.</p>;
  }

  const keys = Object.keys(sections).sort((a, b) => {
    const weightA = knownSections[a]?.weight;
    const weightB = knownSections[b]?.weight;
    if (weightA) {
      if (weightB) {
        return weightA < weightB ? -1 : weightA > weightB ? 1 : 0;
      } else {
        return -1;
      }
    } else if (weightB) {
      return 1;
    } else {
      return a < b ? -1 : a > b ? 1 : 0;
    }
  });

  const anyLocked = password || keys.findIndex((k) => sections[k]) !== -1;
  const formRows = [];

  if (anyLocked) {
    formRows.push(
      <p key="intro">
        The following sections are locked.{" "}
        {password ? "Enter the unlock password and c" : "C"}lick the button at
        the bottom to unlock them.
      </p>
    );
  } else {
    formRows.push(
      <p key="intro">
        Choose which sections you want to lock from being changed.
      </p>
    );
  }

  for (const k of keys) {
    formRows.push(
      <div className="form-row" key={`section-${k}`}>
        <label>
          <input
            type="checkbox"
            disabled={anyLocked}
            checked={inputs.sections[k]}
            onChange={(e) =>
              setInputs({
                ...inputs,
                sections: { ...inputs.sections, [k]: e.target.checked },
              })
            }
          />
          {knownSections[k]?.name || k[0].toUpperCase() + k.slice(1)}
        </label>
      </div>
    );
  }

  if (anyLocked) {
    if (password) {
      formRows.push(
        <div className="form-row" key="password">
          <label>
            Unlock password:{" "}
            <input
              type="password"
              className="input-text"
              value={inputs.password}
              onChange={(e) =>
                setInputs({ ...inputs, password: e.target.value })
              }
            />
          </label>
        </div>
      );
    }
    formRows.push(
      <div className="form-row" key="button">
        <button
          type="submit"
          className="button"
          disabled={password && inputs.password.trim() === ""}
        >
          Unlock
        </button>
      </div>
    );
  } else {
    formRows.push(
      <div className="form-row" key="password">
        <label>
          Unlock password:{" "}
          <input
            type="password"
            className="input-text"
            value={inputs.password}
            onChange={(e) => setInputs({ ...inputs, password: e.target.value })}
          />
        </label>
      </div>
    );

    const inputPassword = inputs.password.trim();
    const inputRepeatPassword = inputs.repeatPassword.trim();
    if (inputPassword !== "") {
      formRows.push(
        <div className="form-row" key="repeat-password">
          <label>
            Repeat password:{" "}
            <input
              type="password"
              className="input-text"
              value={inputs.repeatPassword}
              onChange={(e) =>
                setInputs({ ...inputs, repeatPassword: e.target.value })
              }
            />
          </label>
        </div>
      );
    }

    const passwordsMatch =
      inputPassword === "" || inputPassword === inputRepeatPassword;
    if (inputPassword === "") {
      formRows.push(
        <p className="details" key="password-details">
          The unlock password is optional. If you set one, you will be required
          to enter the password again to unlock.
        </p>
      );
    } else if (inputRepeatPassword === "") {
      formRows.push(
        <p className="details" key="password-details">
          Enter the unlock password again.
        </p>
      );
    } else if (!passwordsMatch) {
      formRows.push(
        <p className="details" key="password-details">
          Passwords don't match.
        </p>
      );
    }

    formRows.push(
      <div className="form-row" key="button">
        <button
          type="submit"
          className="button"
          disabled={
            !passwordsMatch ||
            Object.keys(inputs.sections).findIndex(
              (k) => inputs.sections[k]
            ) === -1
          }
          key="button"
        >
          Lock
        </button>
      </div>
    );
  }

  const submitForm = (e) => {
    e.preventDefault();
    const sectionsToLock = [];
    if (!anyLocked) {
      for (const k of keys) {
        if (inputs.sections[k]) {
          sectionsToLock.push(k);
        }
      }
    }
    changeLocks(sectionsToLock, inputs.password);
  };

  return <form onSubmit={submitForm}>{formRows}</form>;
};

export default function () {
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [locks, setLocks] = useState(null);
  const [inputs, setInputs] = useState(null);

  function updateLocks(result) {
    setLocks(result);
    setInputs({
      sections: { ...result.sections },
      password: "",
      repeatPassword: "",
    });
  }

  function fetchLocks() {
    setError(null);
    setBusy(true);
    getLocks()
      .then(updateLocks)
      .catch(setError)
      .finally(setBusy.bind(null, false));
  }

  function changeLocks(sections, password) {
    setError(null);
    setBusy(true);
    putLocks(sections, password)
      .then(updateLocks)
      .catch(setError)
      .finally(setBusy.bind(null, false));
  }

  useEffect(fetchLocks, []);

  return (
    <>
      <div className="content-box">
        <h2>Lock</h2>
        {error && <p className="alert-box">{error.toString()}</p>}
        {busy ? (
          <p>Loading…</p>
        ) : (
          locks && (
            <LocksForm
              locks={locks}
              changeLocks={changeLocks}
              inputs={inputs}
              setInputs={setInputs}
            />
          )
        )}
      </div>
    </>
  );
}
