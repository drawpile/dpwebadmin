import React, { useState, useContext } from "react";
import { useHistory } from "react-router-dom";
import {
  changeSessions,
  changeSession,
  terminateSession,
  changeUser,
  kickUserFromSession,
  connectChat,
  disconnectChat,
  createInvite,
} from "../../api";

/** Modal building blocks */
const ModalContext = React.createContext({});

const ModalHeader = ({ children }) => <h2>{children}</h2>;
const ModalButtons = ({ children }) => <p>{children}</p>;

const OkButton = ({ label, func, errorFunc, disabled }) => {
  const ctx = useContext(ModalContext);
  function clickHandler() {
    // TODO disable button while processing
    func()
      .then(ctx.closeFunc)
      .catch((err) => {
        console.error("Error", err);
        if (errorFunc) {
          errorFunc(err);
        }
      });
  }
  return (
    <button
      onClick={clickHandler}
      className="danger button"
      disabled={!!disabled}
    >
      {label}
    </button>
  );
};

const CancelButton = ({ label = "Cancel" }) => {
  const ctx = useContext(ModalContext);
  return (
    <button onClick={(e) => ctx.closeFunc()} className="button">
      {label}
    </button>
  );
};

/** Modal dialogs */
function SetPasswordModal({ targetSetting, title }) {
  const [passwd, setPasswd] = useState("");
  const ctx = useContext(ModalContext);

  function setPassword() {
    return changeSession(ctx.sessionId, { [targetSetting]: passwd });
  }

  return (
    <>
      <ModalHeader>Set session {title}</ModalHeader>
      <input
        type="password"
        className="input-text"
        onChange={(e) => setPasswd(e.target.value)}
      />
      <ModalButtons>
        <OkButton func={setPassword} label="Set" />
        <CancelButton />
      </ModalButtons>
    </>
  );
}

function TerminateSessionModal() {
  const ctx = useContext(ModalContext);
  const history = useHistory();

  async function terminate() {
    await terminateSession(ctx.sessionId);
    history.replace("/sessions/");
  }

  return (
    <>
      <ModalHeader>Terminate session</ModalHeader>
      <p>Really terminate session?</p>
      <ModalButtons>
        <OkButton func={terminate} label="Terminate" />
        <CancelButton />
      </ModalButtons>
    </>
  );
}

function KickUserModal() {
  const ctx = useContext(ModalContext);

  async function kick() {
    await kickUserFromSession(ctx.sessionId, ctx.userId);
  }

  return (
    <>
      <ModalHeader>Kick user</ModalHeader>
      <p>Really kick {ctx.userName}?</p>
      <ModalButtons>
        <OkButton func={kick} label="Kick" />
        <CancelButton />
      </ModalButtons>
    </>
  );
}

function MessageModal() {
  const [message, setMessage] = useState("");
  const ctx = useContext(ModalContext);

  function sendMessage() {
    if (ctx.sessionId) {
      if (ctx.userId) {
        return changeUser(ctx.sessionId, ctx.userId, { alert: message });
      } else {
        return changeSession(ctx.sessionId, { alert: message });
      }
    } else {
      return changeSessions({ alert: message });
    }
  }

  return (
    <>
      <ModalHeader>
        Message {ctx.sessionId ? ctx.userName || "everyone" : "all sessions"}
      </ModalHeader>
      <textarea
        type="text"
        className="input-text message-area"
        rows="5"
        onChange={(e) => setMessage(e.target.value)}
      />
      <ModalButtons>
        <OkButton func={sendMessage} label="Send" />
        <CancelButton />
      </ModalButtons>
    </>
  );
}

function InviteCreateModal() {
  const [maxUses, setMaxUses] = useState(1);
  const [role, setRole] = useState("");
  const [error, setError] = useState("");
  const ctx = useContext(ModalContext);

  function connect() {
    setError("");
    return createInvite(
      ctx.sessionId,
      maxUses,
      role === "trust",
      role === "op"
    );
  }

  function catchError(err) {
    setError(`${err}`.replace(/^Error:\s*/, ""));
  }

  return (
    <>
      <ModalHeader>Create Invite Code</ModalHeader>
      {error && (
        <p>
          <strong>Error:</strong> {error}
        </p>
      )}
      <label class="form-row">
        Uses:
        <input
          type="number"
          className="input-text form-field"
          min="1"
          max="50"
          value={maxUses}
          onChange={(e) => setMaxUses(e.target.value)}
        />
      </label>
      <div class="form-row">
        Role:
        <div className="form-field">
          <label className="form-radio-label">
            <input
              type="radio"
              checked={role === ""}
              onChange={(e) => {
                if (e.target.checked) {
                  setRole("");
                }
              }}
            />
            None
          </label>
          <label className="form-radio-label">
            <input
              type="radio"
              checked={role === "trust"}
              onChange={(e) => {
                if (e.target.checked) {
                  setRole("trust");
                }
              }}
            />
            Trusted
          </label>
          <label className="form-radio-label">
            <input
              type="radio"
              checked={role === "op"}
              onChange={(e) => {
                if (e.target.checked) {
                  setRole("op");
                }
              }}
            />
            Operator
          </label>
        </div>
      </div>
      <ModalButtons>
        <OkButton func={connect} errorFunc={catchError} label="Create" />
        <CancelButton />
      </ModalButtons>
    </>
  );
}

function ChatConnectModal() {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const ctx = useContext(ModalContext);

  function connect() {
    setError("");
    return connectChat(ctx.sessionId, message);
  }

  function catchError(err) {
    setError(`${err}`.replace(/^Error:\s*/, ""));
  }

  return (
    <>
      <ModalHeader>Initial message (required):</ModalHeader>
      {error && (
        <p>
          <strong>Error:</strong> {error}
        </p>
      )}
      <textarea
        className="input-text message-area"
        rows="5"
        onChange={(e) => setMessage(e.target.value)}
      />
      <ModalButtons>
        <OkButton
          func={connect}
          errorFunc={catchError}
          label="Connect"
          disabled={message.trim() === ""}
        />
        <CancelButton />
      </ModalButtons>
    </>
  );
}

function ChatDisconnectModal() {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const ctx = useContext(ModalContext);

  function disconnect() {
    setError("");
    return disconnectChat(ctx.sessionId, message);
  }

  function catchError(err) {
    setError(`${err}`.replace(/^Error:\s*/, ""));
  }

  return (
    <>
      <ModalHeader>Disconnect message (optional):</ModalHeader>
      {error && (
        <p>
          <strong>Error:</strong> {error}
        </p>
      )}
      <textarea
        className="input-text message-area"
        rows="5"
        onChange={(e) => setMessage(e.target.value)}
      />
      <ModalButtons>
        <OkButton func={disconnect} errorFunc={catchError} label="Disconnect" />
        <CancelButton />
      </ModalButtons>
    </>
  );
}

export function ModalContent({ modal, closeFunc }) {
  let m;
  switch (modal.active) {
    case "setPassword":
      m = <SetPasswordModal targetSetting="password" title="password" />;
      break;
    case "setOpword":
      m = <SetPasswordModal targetSetting="opword" title="operator password" />;
      break;
    case "terminate":
      m = <TerminateSessionModal />;
      break;
    case "message":
      m = <MessageModal />;
      break;
    case "kick":
      m = <KickUserModal />;
      break;
    case "inviteCreate":
      m = <InviteCreateModal />;
      break;
    case "chatConnect":
      m = <ChatConnectModal />;
      break;
    case "chatDisconnect":
      m = <ChatDisconnectModal />;
      break;
    default:
      return null;
  }

  return (
    <ModalContext.Provider value={{ ...modal, closeFunc }}>
      {m}
    </ModalContext.Provider>
  );
}
