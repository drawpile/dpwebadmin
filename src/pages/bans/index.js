import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import { getBanList, addBan, deleteBan } from "../../api";
import {
  InputGrid,
  Field,
  TextInput,
  IntegerInput,
} from "../../components/form.js";

const BanListTable = ({ bans, deleteBanFunc, locked }) => {
  return (
    <table className="table">
      <thead>
        <tr>
          <th>Address</th>
          <th>Expires</th>
          <th>Added</th>
          <th>Comment</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {bans.map((b) => (
          <tr key={b.id}>
            <td>
              {b.ip}
              {b.subnet > 0 ? ` / ${b.subnet}` : ""}
            </td>
            <td>{b.expires}</td>
            <td>{b.added}</td>
            <td>{b.comment}</td>
            <td>
              <button
                onClick={() => deleteBanFunc(b.id)}
                className="small danger button"
                disabled={locked}
              >
                Delete
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

const AddBanModal = ({ closeFunc }) => {
  const [form, setForm] = useState({
    address: "",
    subnet: "",
    expires: "",
    comment: "",
  });
  const [error, setError] = useState(null);

  const vprops = (name) => ({
    value: form[name],
    update: (value) => setForm({ ...form, [name]: value }),
    pending: false,
  });

  async function saveBanEntry() {
    try {
      await addBan(form);
    } catch (e) {
      setError(e.toString());
      return;
    }

    closeFunc(true);
  }

  return (
    <>
      <h2>Add a new ban</h2>
      {error && <p className="alert-box">{error}</p>}
      <InputGrid>
        <Field label="Address">
          <TextInput {...vprops("ip")} />
        </Field>
        <Field label="Subnet mask">
          <IntegerInput {...vprops("subnet")} />
        </Field>
        <Field label="Expires">
          <TextInput {...vprops("expires")} />
        </Field>
        <Field label="Comment">
          <TextInput long {...vprops("comment")} />
        </Field>
      </InputGrid>
      <p>
        <button onClick={saveBanEntry} className="button">
          Add
        </button>
        <button onClick={(e) => closeFunc(false)} className="button">
          Cancel
        </button>
      </p>
    </>
  );
};

export default function () {
  const [bans, setBans] = useState([]);
  const [locked, setLocked] = useState(false);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  function refreshBanList() {
    getBanList()
      .then((result) => {
        if (Array.isArray(result)) {
          setBans(result);
          setLocked(false);
        } else {
          setBans(result.bans);
          setLocked(result._locked);
        }
      })
      .catch(setError);
  }

  useEffect(refreshBanList, []);

  function removeBan() {
    deleteBan(confirmDelete)
      .then(refreshBanList)
      .catch((e) => setError(e.toString()));
    setConfirmDelete(null);
  }

  return (
    <div className="content-box">
      <h2>IP bans</h2>
      {error && <p className="alert-box">{error.toString()}</p>}
      {locked && <p className="locked-box">This section is locked.</p>}
      {bans && (
        <BanListTable
          bans={bans}
          deleteBanFunc={setConfirmDelete}
          locked={locked}
        />
      )}
      <p>
        <button
          onClick={(e) => setEditing(true)}
          className="button"
          disabled={locked}
        >
          Add
        </button>
      </p>
      <Modal isOpen={editing} onRequestClose={() => setEditing(null)}>
        {editing && (
          <AddBanModal
            closeFunc={(needRefresh) => {
              setEditing(false);
              if (needRefresh) refreshBanList();
            }}
          />
        )}
      </Modal>
      <Modal
        isOpen={confirmDelete !== null}
        onRequestClose={() => setConfirmDelete(null)}
      >
        <h2>Really delete?</h2>
        <p>
          <button onClick={removeBan} className="danger button">
            Delete
          </button>
          <button onClick={(e) => setConfirmDelete(null)} className="button">
            Cancel
          </button>
        </p>
      </Modal>
    </div>
  );
}
