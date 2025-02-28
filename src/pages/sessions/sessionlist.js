import React from "react";
import Modal from "react-modal";
import { Link, useRouteMatch } from "react-router-dom";
import { getSessions } from "../../api/";
import { ModalContent } from "./modals.js";
import { formatDateTime } from "../../api/format.js";

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

const SessionTable = ({ sessions }) => {
  const { path } = useRouteMatch();

  return (
    <table className="table">
      <thead>
        <tr>
          <th>Title</th>
          <th>ID</th>
          <th>Alias</th>
          <th>Users</th>
          <th>Options</th>
          <th>Size</th>
          <th>Started at</th>
        </tr>
      </thead>
      <tbody>
        {sessions.map((s) => {
          const title = s.title || "(untitled)";
          return (
            <tr key={s.id}>
              <td>
                {s.id ? <Link to={`${path}${s.id}`}>{title}</Link> : title}
              </td>
              <td>
                {s.id ? (
                  <Link to={`${path}${s.id}`}>
                    <abbr title={s.id}>{s.id.substr(0, 8)}...</abbr>
                  </Link>
                ) : (
                  "(template)"
                )}
              </td>
              <td>
                {s.id ? <Link to={`${path}${s.id}`}>{s.alias}</Link> : s.alias}
              </td>
              <td>
                {s.userCount || 0} / {s.maxUserCount || 254}
              </td>
              <td>
                {s.hasPassword && <span title="Password">🔒</span>}
                {s.closed && <span title="Closed to new users">🚪</span>}
                {s.authOnly && <span title="Registered users only">👥</span>}
                {s.persistent && <span title="Persists without users">💾</span>}
                {s.nsfm && (
                  <span title="Not suitable for minors (NSFM)">🔞</span>
                )}
                {s.idleOverride && <span title="Ignores idle timeout">⏰</span>}
                {s.allowWeb && (
                  <span title="Allow joining via web browser">🌐</span>
                )}
                {s.invites && (
                  <span title="Allow operators to manage invite codes">📮</span>
                )}
              </td>
              <td>{((s.size || 0) / (1024 * 1024)).toFixed(2)} MB</td>
              <td>
                {s.startTime ? formatDateTime(s.startTime) : "not started"}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

export class SessionListPage extends React.Component {
  state = {
    modal: {
      active: null,
    },
  };
  timer = null;

  componentDidMount() {
    this.refreshList();
    this.timer = setInterval(this.refreshList, 10000);
  }

  componentWillUnmount() {
    clearInterval(this.timer);
  }

  refreshList = async () => {
    try {
      const result = await getSessions();
      if (Array.isArray(result)) {
        this.setState({ sessions: result, locked: false, error: null });
      } else {
        this.setState({
          sessions: result.sessions,
          locked: result._locked,
          error: null,
        });
      }
    } catch (e) {
      this.setState({ error: e.toString() });
    }
  };

  openModal = (dialog, opts = {}) => {
    this.setState({
      modal: {
        ...opts,
        active: dialog,
      },
    });
  };

  closeModal = () => {
    this.setState({
      modal: {
        active: null,
      },
    });
  };

  render() {
    const { sessions, error, modal, locked } = this.state;
    return (
      <div className="content-box">
        <h2>Sessions</h2>
        {error && <p className="alert-box">{error.toString()}</p>}
        {locked && <p className="locked-box">This section is locked.</p>}
        {sessions && (
          <button
            onClick={() => this.openModal("message")}
            className="button"
            disabled={locked}
          >
            Message all sessions
          </button>
        )}
        {sessions && <SessionTable sessions={sessions} />}
        <Modal
          isOpen={modal.active !== null}
          onRequestClose={this.closeModal}
          style={MODAL_SMALL_STYLE}
        >
          <ModalContent modal={modal} closeFunc={this.closeModal} />
        </Modal>
      </div>
    );
  }
}
