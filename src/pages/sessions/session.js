import React from "react";
import Modal from "react-modal";
import classNames from "classnames";
import {
  InputGrid,
  Field,
  TextInput,
  IntegerInput,
  ReadOnly,
  CheckboxInput,
} from "../../components/form.js";
import { ModalContent } from "./modals.js";
import { formatDateTime, formatFileSize, reformatSettings } from "../../api/format.js";
import {
  getSession,
  changeSession,
  changeUser,
  unlistSession,
  getChatMessages,
  sendChatMessage,
  revokeInvite,
} from "../../api/";

const MODAL_SMALL_STYLE = {
  content: {
    top: "20%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
  },
};

const SessionInfo = ({ session, openModal, vprops, locked }) => {
  return (
    <div>
      <InputGrid>
        <Field label="Title">
          <TextInput long {...vprops("title")} />
        </Field>
        <Field label="ID">
          <ReadOnly long value={session.id} />
        </Field>
        <Field label="Alias">
          <ReadOnly value={session.alias} />
        </Field>
        <Field label="Started by">
          <ReadOnly value={session.founder} />
        </Field>
        <Field label="Started at">
          <ReadOnly value={formatDateTime(session.startTime)} />
        </Field>
        <Field label="Size">
          <ReadOnly value={(session.size / (1024 * 1024)).toFixed(2) + " MB"} />
          /
          <ReadOnly
            value={(session.maxSize / (1024 * 1024)).toFixed(2) + " MB"}
          />
        </Field>
        <Field label="Autoreset threshold">
          <TextInput {...vprops("resetThreshold")} />
          {session.effectiveResetThreshold && (
            <>
              {" effectively "}
              <ReadOnly {...vprops("effectiveResetThreshold")} />
            </>
          )}
        </Field>
        <Field label="Users">
          <ReadOnly value={session.userCount} />
          /
          <IntegerInput {...vprops("maxUserCount")} />
        </Field>
        <Field>
          <CheckboxInput
            label=" 🚪 Closed to new users"
            {...vprops("closed")}
          />
          <CheckboxInput
            label=" 👥 Registered users only"
            {...vprops("authOnly")}
          />
          <CheckboxInput
            label=" 💾 Persists without users"
            {...vprops("persistent")}
          />
          <CheckboxInput
            label=" 🔞 Not suitable for minors (NSFM)"
            {...vprops("nsfm")}
          />
          <CheckboxInput
            label=" ⏰ Ignores idle timeout"
            {...vprops("idleOverride")}
          />
          <CheckboxInput
            label=" 🌐 Allow joining via web browser"
            {...vprops("allowWeb", session.allowWeb !== undefined)}
          />
          <CheckboxInput
            label=" 📮 Allow operators to manage invite codes"
            {...vprops("invites", session.invites !== undefined)}
          />
        </Field>
      </InputGrid>
      <p>
        <button
          onClick={(e) => openModal("setPassword")}
          className="button"
          disabled={locked}
        >
          {session.hasPassword ? "Change" : "Set"} password
        </button>
        <button
          onClick={(e) => openModal("setOpword")}
          className="button"
          disabled={locked}
        >
          {session.hasOpword ? "Change" : "Set"} opword
        </button>
        <button
          onClick={(e) => openModal("terminate")}
          className="danger button"
          disabled={locked}
        >
          Terminate
        </button>
      </p>
    </div>
  );
};

const StatusBox = ({
  session: {
    autoreset: {
      delay,
      historyFirstIndex,
      historyLastIndex,
      requestStatus,
      sessionState,
      stream,
      timer,
    },
  },
}) => {
  function renderStream({
    state,
    ctxId,
    size,
    startIndex,
    messageCount,
    haveConsumer,
  }) {
    return (
      <>
        <dt>Reset stream state:</dt>
        <dd>{state}</dd>
        <dt>Reset stream user:</dt>
        <dd>{ctxId}</dd>
        <dt>Reset stream size:</dt>
        <dd>{formatFileSize(size)}</dd>
        <dt>Reset stream start index:</dt>
        <dd>{startIndex}</dd>
        <dt>Reset stream message count:</dt>
        <dd>{messageCount}</dd>
        <dt>Reset stream has consumer:</dt>
        <dd>{haveConsumer ? "yes" : "no"}</dd>
      </>
    );
  }

  return (
    <div className="content-box">
      <h3>Status</h3>
      <dl>
        <dt>Session state:</dt>
        <dd>{sessionState}</dd>
        <dt>History indexes:</dt>
        <dd>
          {historyFirstIndex} to {historyLastIndex}
        </dd>
        <dt>Autoreset request status:</dt>
        <dd>{requestStatus}</dd>
        <dt>Autoreset delay:</dt>
        <dd>{delay} ms</dd>
        <dt>Autoreset timer:</dt>
        <dd>{timer === undefined ? "not active" : `${timer} ms`}</dd>
        {stream && renderStream(stream)}
      </dl>
    </div>
  );
};

const UserListBox = ({ sessionId, users, openModal, locked }) => {
  function changeUserOp(user) {
    changeUser(sessionId, user.id, { op: !user.op });
  }

  function changeUserTrusted(user) {
    changeUser(sessionId, user.id, { trusted: !user.trusted });
  }

  return (
    <div className="content-box">
      <h3>Users</h3>
      <table className="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>IP</th>
            <th>Flags</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className={classNames({ offline: !u.online })}>
              <td>{u.id}</td>
              <td>{u.name}</td>
              <td>{u.ip}</td>
              <td>
                {u.muted && "Muted"} {u.mod && "MOD"} {u.ghost && "GHOST"}{" "}
                {u.op && "Op"} {u.trusted && "Trusted"} {u.holdLocked && "Hold"}{" "}
                {u.resetFlags?.length ? `Reset(${u.resetFlags.join(" ")})` : ""}
              </td>
              <td>{u.online ? "online" : "offline"}</td>
              <td>
                {u.online && (
                  <>
                    {!u.mod && (
                      <button
                        onClick={() => changeUserOp(u)}
                        className="small button"
                        disabled={locked}
                      >
                        {u.op ? "De-op" : "Op"}
                      </button>
                    )}
                    {!u.mod && (
                      <button
                        onClick={() => changeUserTrusted(u)}
                        className="small button"
                        disabled={locked}
                      >
                        {u.trusted ? "Untrust" : "Trust"}
                      </button>
                    )}
                    <button
                      onClick={() =>
                        openModal("message", { userName: u.name, userId: u.id })
                      }
                      className="small button"
                      disabled={locked}
                    >
                      Message
                    </button>
                    <button
                      onClick={() =>
                        openModal("kick", { userName: u.name, userId: u.id })
                      }
                      className="small danger button"
                      disabled={locked}
                    >
                      Kick
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p>
        <button
          onClick={() => openModal("message")}
          className="button"
          disabled={locked}
        >
          Message all
        </button>
      </p>
    </div>
  );
};

const ListingsBox = ({ listings, unlisted, unlist, locked }) => {
  return (
    <div className="content-box">
      <h3>Listings</h3>
      <table className="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>URL</th>
            <th>Code</th>
            <th>Type</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {listings.map((l) => (
            <tr key={l.id}>
              <td>{l.id}</td>
              <td>{l.url}</td>
              <td>{l.roomcode}</td>
              <td>{l.private ? "Private" : "Public"}</td>
              <td>
                {unlisted[l.id] ? (
                  "Unlisting…"
                ) : (
                  <button
                    onClick={() => unlist(l.id)}
                    className="small danger button"
                    disabled={locked}
                  >
                    Unlist
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const InvitesBox = ({ invites, openModal, revoked, revoke, locked }) => {
  return (
    <div className="content-box">
      <h3>Invite Codes</h3>
      <button
        onClick={() => openModal("inviteCreate")}
        className="button"
        disabled={locked}
      >
        Create
      </button>
      <table className="table">
        <thead>
          <tr>
            <th>Code</th>
            <th>Created by</th>
            <th>Created at</th>
            <th>Roles</th>
            <th>Uses</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {invites.map((invite) => [
            <tr key={invite.secret}>
              <td>{invite.secret}</td>
              <td>{invite.creator}</td>
              <td>{formatDateTime(invite.at)}</td>
              <td>
                {invite.trust && "Trusted"} {invite.op && "Operator"}
              </td>
              <td>
                {invite.uses?.length || 0} / {invite.maxUses}
              </td>
              <td>
                <button
                  onClick={() => revoke(invite.secret)}
                  className="small danger button"
                  disabled={revoked[invite.secret] || locked}
                >
                  {revoked[invite.secret] ? "Revoked" : "Revoke"}
                </button>
              </td>
            </tr>,
            invite.uses.map((use) => (
              <tr key={`${invite.secret}:${use.at}:${use.name}`}>
                <td colspan="6" className="invite-use">
                  Used {formatDateTime(use.at)} by {use.name}
                </td>
              </tr>
            )),
          ])}
        </tbody>
      </table>
    </div>
  );
};

function renderOfflineChat(openModal, locked) {
  return (
    <>
      <p>Not connected.</p>
      <button
        onClick={() => openModal("chatConnect")}
        className="button"
        disabled={locked}
      >
        Connect
      </button>
    </>
  );
}

const CHAT_FLAG_SHOUT = 0x1;
const CHAT_FLAG_ACTION = 0x2;
const CHAT_FLAG_PIN = 0x4;
const CHAT_FLAG_ALERT = 0x8;

function renderChatMessage({ i: id, n: name, m: message, f: flags }, index) {
  if (id === undefined) {
    return (
      <div key={index} className="chat-message chat-message-admin">
        <span className="chat-message-sender">Admin:</span> {message}
      </div>
    );
  } else {
    if (flags) {
      if (flags & CHAT_FLAG_PIN) {
        if (message === "-") {
          return (
            <div key={index} className="chat-message chat-message-user">
              <span className="chat-message-sender">
                {id} {name} <em>unpinned the pinned message</em>
              </span>
            </div>
          );
        } else {
          return (
            <div key={index} className="chat-message chat-message-user">
              <span className="chat-message-sender">
                {id} {name} <em>pinned a message</em>:
              </span>{" "}
              {message}
            </div>
          );
        }
      } else if (flags & CHAT_FLAG_ALERT) {
        return (
          <div key={index} className="chat-message chat-message-user">
            <span className="chat-message-sender">
              {id} {name} <em>alerts</em>:
            </span>{" "}
            {message}
          </div>
        );
      } else if (flags & CHAT_FLAG_SHOUT) {
        return (
          <div key={index} className="chat-message chat-message-user">
            <span className="chat-message-sender">
              {id} {name} <em>shouts</em>:
            </span>{" "}
            {message}
          </div>
        );
      } else if (flags & CHAT_FLAG_ACTION) {
        return (
          <div key={index} className="chat-message chat-message-user">
            <span className="chat-message-sender">
              {id} {name}
            </span>{" "}
            <em>{message}</em>
          </div>
        );
      }
    }
    return (
      <div key={index} className="chat-message chat-message-user">
        <span className="chat-message-sender">
          {id} {name}:
        </span>{" "}
        {message}
      </div>
    );
  }
}

function renderOnlineChat(openModal, locked) {
  return (
    <>
      <p>Connected.</p>
      <button
        onClick={() => openModal("chatDisconnect")}
        className="button danger"
        disabled={locked}
      >
        Disconnect
      </button>
    </>
  );
}

function handleChatKey(submitChatMessage, e) {
  if (e.keyCode === 13 && !(e.ctrlKey || e.shiftKey)) {
    submitChatMessage(e);
  }
}

const ChatBox = ({
  info,
  state,
  loading,
  chatMessage,
  setChatMessage,
  submitChatMessage,
  openModal,
  locked,
}) => {
  const connected = info || state.connected;
  return (
    <div className="content-box">
      <h3>Chat</h3>
      {state.error && (
        <p>
          <strong>Error:</strong> {state.error}
        </p>
      )}
      {connected
        ? renderOnlineChat(openModal, locked)
        : renderOfflineChat(openModal, locked)}
      {loading && "updating…"}
      <div id="chat-message-box" className="chat">
        {(state.messages || []).map(renderChatMessage)}
      </div>
      {
        <form className="chat-grid" onSubmit={submitChatMessage}>
          <textarea
            rows="3"
            className="input-text"
            placeholder={
              connected ? "Write a chat message here…" : "Chat not connected"
            }
            disabled={!connected || locked}
            value={connected ? chatMessage : ""}
            onChange={(e) => setChatMessage(e.target.value)}
            onKeyDown={(e) => handleChatKey(submitChatMessage, e)}
          />
          <button
            type="submit"
            className="button"
            disabled={!connected || chatMessage?.trim() === "" || locked}
          >
            Send
          </button>
        </form>
      }
    </div>
  );
};

export class SessionPage extends React.Component {
  state = {
    changed: {},
    unlisted: {},
    revoked: {},
    chat: {
      connected: false,
      messages: [],
      offset: 0,
      error: null,
    },
    modal: {
      active: null,
    },
    chatLoading: false,
    chatMessage: "",
  };
  refreshTimer = null;
  debounceTimer = null;
  chatTimer = null;

  componentDidMount() {
    this.refreshList();
    this.refreshTimer = setTimeout(this.refreshList, 10000);
  }

  componentWillUnmount() {
    if (this.refreshTimer !== null) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
    if (this.debounceTimer !== null) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
    this.stopChatTimer();
  }

  refreshList = async () => {
    if (this.refreshTimer !== null) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
    try {
      const session = await getSession(this.props.sessionId);
      this.setStateSession(session);
      if (session.chat && !this.chatTimer) {
        this.requestChatMessages();
      }
    } catch (e) {
      this.setState({ error: e.toString() });
    } finally {
      if (this.refreshTimer === null) {
        this.refreshTimer = setTimeout(this.refreshList, 10000);
      }
    }
  };

  setStateSession(session) {
    reformatSettings(session, {
      resetThreshold: formatFileSize,
      effectiveResetThreshold: formatFileSize,
    });

    if (session.invitelist) {
      const compareAt = (a, b) => {
        const aAt = a?.at || "";
        const bAt = b?.at || "";
        return aAt < bAt ? -1 : aAt > bAt ? 1 : 0;
      };
      try {
        session.invitelist.sort(compareAt);
        for (const invite of session.invitelist) {
          invite.uses?.sort(compareAt);
        }
      } catch (e) {
        console.error(e);
      }
    }

    this.setState({ session, locked: session._locked, error: null });
  }

  updateSetting(key, value) {
    this.setState((d) => ({
      session: {
        ...d.session,
        [key]: value,
      },
      changed: {
        ...d.changed,
        [key]: value,
      },
    }));

    if (this.debounceTimer !== null) {
      clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = setTimeout(() => {
      this.updateSettings(this.state.session.id, this.state.changed);
      this.setState({ changed: {} });
      this.debounceTimer = null;
    }, 1000);
  }

  async updateSettings(id, changed) {
    try {
      const session = await changeSession(id, changed);
      this.setStateSession(session);
    } catch (e) {
      this.setState({
        error: e.toString(),
      });
    }
  }

  openModal = (dialog, opts = {}) => {
    this.setState({
      modal: {
        ...opts,
        active: dialog,
        sessionId: this.props.sessionId,
      },
    });
  };

  closeModal = (res) => {
    if (res && this.state.modal.active === "chatConnect") {
      this.setState({
        chat: {
          ...this.state.chat,
          connected: true,
          offset: 0,
          error: null,
        },
        modal: {
          active: null,
        },
      });
      this.handleChatResponse(res);
      this.startChatTimer();
    } else if (res && this.state.modal.active === "chatDisconnect") {
      this.stopChatTimer();
      this.setState({
        chat: {
          ...this.state.chat,
          connected: false,
          offset: 0,
          error: null,
        },
        modal: {
          active: null,
        },
        session: {
          ...this.state.session,
          chat: null,
        },
      });
      this.handleChatResponse(res);
    } else {
      if (res && this.state.modal.active === "inviteCreate") {
        this.refreshList();
      }
      this.setState({
        modal: {
          active: null,
        },
      });
    }
  };

  unlist = (listingId) => {
    this.setState({
      unlisted: {
        ...this.state.unlisted,
        [listingId]: true,
      },
    });
    unlistSession(this.props.sessionId, listingId);
  };

  revoke = async (secret) => {
    this.setState({
      revoked: {
        ...this.state.revoked,
        [secret]: true,
      },
    });
    try {
      await revokeInvite(this.props.sessionId, secret);
    } finally {
      this.refreshList();
    }
  };

  scrollChatToBottom() {
    setTimeout(() => {
      const elem = document.getElementById("chat-message-box");
      elem.scrollTop = elem.scrollHeight;
    }, 100);
  }

  handleChatResponse(res) {
    const count = res.messages.length;
    const offset = res.offset + count;
    if (offset !== this.state.chat.offset) {
      this.setState({
        chat: {
          ...this.state.chat,
          messages: [...this.state.chat.messages, ...res.messages],
          offset: res.offset + count,
        },
      });
      this.scrollChatToBottom();
    }
  }

  handleChatRequest(req) {
    this.setState({ chatLoading: true });
    req
      .then((res) => {
        this.handleChatResponse(res);
      })
      .catch((err) => {
        console.error(err);
        this.setState({
          chat: {
            error: `${err}`.replace(/^Error:\s*/, ""),
          },
        });
      })
      .finally(() => {
        this.setState({ chatLoading: false });
        this.stopChatTimer();
        this.startChatTimer();
      });
  }

  requestChatMessages() {
    this.stopChatTimer();
    this.handleChatRequest(
      getChatMessages(this.props.sessionId, this.state.chat.offset)
    );
  }

  startChatTimer() {
    if (!this.chatTimer) {
      this.chatTimer = setTimeout(this.requestChatMessages.bind(this), 4000);
    }
  }

  stopChatTimer() {
    if (this.chatTimer) {
      clearTimeout(this.chatTimer);
      this.chatTimer = null;
    }
  }

  submitChatMessage(e) {
    e.preventDefault();
    const message = this.state.chatMessage?.trim();
    if (message !== "") {
      this.setState({ chatMessage: "" });
      this.stopChatTimer();
      this.handleChatRequest(
        sendChatMessage(this.props.sessionId, message, this.state.chat.offset)
      );
    }
    return false;
  }

  render() {
    const { session, changed, error, modal, locked } = this.state;
    const vprops = (name, enabled = true) => ({
      value: session[name],
      update: (value) => this.updateSetting(name, value),
      pending: changed[name] !== undefined,
      enabled: !locked && enabled,
    });

    return (
      <>
        <div className="content-box">
          <h2>Session</h2>
          {error && <p className="alert-box">{error.toString()}</p>}
          {locked && <p className="locked-box">This section is locked.</p>}
          {session && (
            <SessionInfo
              session={session}
              openModal={this.openModal}
              vprops={vprops}
              locked={locked}
            />
          )}
        </div>
        {session?.autoreset && <StatusBox session={session} />}
        {session && (
          <UserListBox
            sessionId={this.props.sessionId}
            users={session.users}
            openModal={this.openModal}
            locked={locked}
          />
        )}
        {session && (
          <ListingsBox
            listings={session.listings}
            unlisted={this.state.unlisted}
            unlist={this.unlist}
            locked={locked}
          />
        )}
        {session && session.invitelist && (
          <InvitesBox
            invites={session.invitelist}
            openModal={this.openModal}
            revoked={this.state.revoked}
            revoke={this.revoke}
            locked={locked}
          />
        )}
        {session && session.chat !== undefined && (
          <ChatBox
            info={session.chat}
            state={this.state.chat}
            loading={this.state.chatLoading}
            chatMessage={this.state.chatMessage}
            setChatMessage={(chatMessage) => this.setState({ chatMessage })}
            submitChatMessage={this.submitChatMessage.bind(this)}
            openModal={this.openModal}
            locked={locked}
          />
        )}
        <Modal
          isOpen={modal.active !== null}
          onRequestClose={this.closeModal}
          style={MODAL_SMALL_STYLE}
        >
          <ModalContent modal={modal} closeFunc={this.closeModal} />
        </Modal>
      </>
    );
  }
}
