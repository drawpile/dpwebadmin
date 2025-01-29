import React from "react";
import Modal from "react-modal";
import { Link } from "react-router-dom";
import { getUsers } from "../../api";
import { ModalContent } from "./modals.js";

const UserListTable = ({ users, openModal, locked }) => {
  return (
    <table className="table">
      <thead>
        <tr>
          <th>Username</th>
          <th>ID</th>
          <th>Session</th>
          <th>IP</th>
          <th>Features</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {users.map((u) => (
          <tr key={`${u.session}.${u.id}`}>
            <td>{u.name}</td>
            <td>{u.id}</td>
            <td>
              <Link to={`/sessions/${u.session}`}>{u.session}</Link>
            </td>
            <td>{u.ip}</td>
            <td>
              {u.mod && "MOD"} {u.op && "OP"} {u.ghost && "GHOST"}
            </td>
            <td>
              <button
                onClick={() =>
                  openModal("kick", { userName: u.name || u.ip, uid: u.uid })
                }
                className="small danger button"
                disabled={locked}
              >
                Kick
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default class extends React.Component {
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
      const result = await getUsers();
      if (Array.isArray(result)) {
        this.setState({ users: result, locked: false, error: null });
      } else {
        this.setState({
          users: result.users,
          locked: result._locked,
          error: null,
        });
      }
    } catch (e) {
      this.setState({ error: e });
    }
  };

  openModal = (dialog, opts = {}) => {
    this.setState({
      modal: {
        ...opts,
        active: dialog,
        sessionId: this.props.sessionId,
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
    const { users, error, modal, locked } = this.state;
    return (
      <>
        <div className="content-box">
          <h2>Users</h2>
          {error && <p className="alert-box">{error.toString()}</p>}
          {locked && <p className="locked-box">This section is locked.</p>}
          {users && (
            <UserListTable
              users={users}
              openModal={this.openModal}
              locked={locked}
            />
          )}
        </div>
        <Modal isOpen={modal.active !== null} onRequestClose={this.closeModal}>
          <ModalContent modal={modal} closeFunc={this.closeModal} />
        </Modal>
      </>
    );
  }
}
