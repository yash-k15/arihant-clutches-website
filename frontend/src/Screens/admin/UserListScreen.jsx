import { useState } from 'react';
import { Button, Modal, Table } from 'react-bootstrap';
import { FaCopy, FaExchangeAlt, FaTrash } from 'react-icons/fa';
import { toast } from 'react-toastify';
import Message from '../../Components/Message';
import Loader from '../../Components/Loader';
import {
  useGetUsersQuery,
  useDeleteUserMutation,
  useUpdateUserMutation,
} from '../../slices/usersApiSlice';
import '../../assets/styles/components/UserListScreen.css';

const UserListScreen = () => {
  const { data: users, isLoading, error } = useGetUsersQuery();

  const [deleteUser, { isLoading: loadingDelete }] = useDeleteUserMutation();

  const [updateUser, { isLoading: loadingRoleUpdate }] =
    useUpdateUserMutation();

  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const openRoleModal = (user) => {
    setSelectedUser(user);
    setShowRoleModal(true);
  };

  const closeRoleModal = () => {
    if (loadingRoleUpdate) return;

    setShowRoleModal(false);
    setSelectedUser(null);
  };

  const changeRoleHandler = async () => {
    if (!selectedUser) return;

    try {
      await updateUser({
        userId: selectedUser._id,
        name: selectedUser.name,
        email: selectedUser.email,
        isAdmin: !selectedUser.isAdmin,
      }).unwrap();

      toast.success(
        `${selectedUser.name} is now ${
          selectedUser.isAdmin ? 'a Customer' : 'an Admin'
        }`,
      );

      closeRoleModal();
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  const deleteHandler = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await deleteUser(id).unwrap();
        toast.success('User deleted');
      } catch (err) {
        toast.error(err?.data?.message || err.error);
      }
    }
  };

  const copyContact = async (value, type) => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success(`${type} copied`);
    } catch (error) {
      toast.error(`Unable to copy ${type.toLowerCase()}`);
    }
  };

  const formatPhone = (phone) => `+91 ${phone}`;

  const formatDate = (date) =>
    new Date(date).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

  const renderContact = (user) => (
    <div className='admin-users-contact'>
      {user.phone && (
        <div className='admin-users-contact-item'>
          <span className='admin-users-contact-value'>
            {formatPhone(user.phone)}
          </span>

          <button
            type='button'
            className='admin-users-copy-btn'
            aria-label='Copy phone number'
            title='Copy phone number'
            onClick={() => copyContact(formatPhone(user.phone), 'Phone number')}
          >
            <FaCopy />
          </button>
        </div>
      )}

      {user.email && (
        <div className='admin-users-contact-item'>
          <span className='admin-users-contact-value'>{user.email}</span>

          <button
            type='button'
            className='admin-users-copy-btn'
            aria-label='Copy email'
            title='Copy email'
            onClick={() => copyContact(user.email, 'Email')}
          >
            <FaCopy />
          </button>
        </div>
      )}
    </div>
  );

  const renderRole = (user) => (
    <span
      className={
        user.isAdmin
          ? 'admin-users-role admin-users-role-admin'
          : 'admin-users-role admin-users-role-customer'
      }
    >
      {user.isAdmin ? 'Admin' : 'Customer'}
    </span>
  );

  const renderActions = (user, mobile = false) => (
    <div
      className={mobile ? 'admin-users-mobile-actions' : 'admin-users-actions'}
    >
      <Button
        variant='light'
        className={
          mobile ? 'admin-users-mobile-role-btn' : 'admin-users-role-btn'
        }
        onClick={() => openRoleModal(user)}
        disabled={loadingRoleUpdate}
        title='Change role'
      >
        <FaExchangeAlt />
        {mobile && <span>Change Role</span>}
      </Button>

      <Button
        className={
          mobile ? 'admin-users-mobile-delete-btn' : 'admin-users-delete-btn'
        }
        onClick={() => deleteHandler(user._id)}
        disabled={loadingDelete}
        title='Delete user'
      >
        <FaTrash />
        {mobile && <span>Delete</span>}
      </Button>
    </div>
  );

  return (
    <div className='admin-users-page'>
      <div className='admin-users-header'>
        <div>
          <p className='admin-users-subtitle'>ADMIN PANEL</p>
          <h1 className='admin-users-title'>Users</h1>
          <p className='admin-users-description'>
            Manage registered users and account roles
          </p>
        </div>
      </div>

      <div className='admin-users-toolbar'>
        <div className='admin-users-search'>
          <input
            type='search'
            placeholder='Search users...'
            aria-label='Search users'
          />
        </div>
      </div>

      {loadingDelete && <Loader />}
      {loadingRoleUpdate && <Loader />}

      {isLoading ? (
        <Loader />
      ) : error ? (
        <Message variant='danger'>
          {error?.data?.message || error.error}
        </Message>
      ) : (
        <>
          {/* Desktop / Tablet */}
          <div className='admin-users-table-wrapper'>
            <Table borderless hover className='admin-users-table align-middle'>
              <thead>
                <tr>
                  <th>USER</th>
                  <th>CONTACT</th>
                  <th>ROLE</th>
                  <th>JOINED</th>
                  <th className='admin-users-actions-header'>ACTIONS</th>
                </tr>
              </thead>

              <tbody>
                {users.map((user) => (
                  <tr key={user._id}>
                    <td>
                      <div className='admin-users-user'>
                        <div className='admin-users-avatar'>
                          {user.name.charAt(0).toUpperCase()}
                        </div>

                        <span className='admin-users-name'>{user.name}</span>
                      </div>
                    </td>

                    <td>{renderContact(user)}</td>

                    <td>{renderRole(user)}</td>

                    <td>
                      <span className='admin-users-date'>
                        {formatDate(user.createdAt)}
                      </span>
                    </td>

                    <td>{renderActions(user)}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>

          {/* Mobile */}
          <div className='admin-users-mobile-list'>
            {users.map((user) => (
              <div className='admin-user-card' key={user._id}>
                <div className='admin-user-card-header'>
                  <div className='admin-users-avatar'>
                    {user.name.charAt(0).toUpperCase()}
                  </div>

                  <div className='admin-user-card-identity'>
                    <span className='admin-user-card-name'>{user.name}</span>

                    {renderRole(user)}
                  </div>
                </div>

                {renderContact(user)}

                <div className='admin-user-card-meta'>
                  <div>
                    <span className='admin-user-card-label'>JOINED</span>

                    <span className='admin-users-date'>
                      {formatDate(user.createdAt)}
                    </span>
                  </div>
                </div>

                {renderActions(user, true)}
              </div>
            ))}
          </div>
        </>
      )}

      <Modal
        show={showRoleModal}
        onHide={closeRoleModal}
        centered
        className='admin-users-role-modal'
      >
        <Modal.Header closeButton>
          <Modal.Title>Change User Role</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {selectedUser && (
            <>
              <p className='admin-users-modal-message'>
                You are changing the role of{' '}
                <strong>{selectedUser.name}</strong> from{' '}
                <strong>{selectedUser.isAdmin ? 'Admin' : 'Customer'}</strong>{' '}
                to{' '}
                <strong>{selectedUser.isAdmin ? 'Customer' : 'Admin'}</strong>.
              </p>

              <div className='admin-users-role-change'>
                <span
                  className={
                    selectedUser.isAdmin
                      ? 'admin-users-role admin-users-role-admin'
                      : 'admin-users-role admin-users-role-customer'
                  }
                >
                  {selectedUser.isAdmin ? 'Admin' : 'Customer'}
                </span>

                <FaExchangeAlt />

                <span
                  className={
                    selectedUser.isAdmin
                      ? 'admin-users-role admin-users-role-customer'
                      : 'admin-users-role admin-users-role-admin'
                  }
                >
                  {selectedUser.isAdmin ? 'Customer' : 'Admin'}
                </span>
              </div>

              <p className='admin-users-modal-warning'>
                Are you sure you want to change this user's role?
              </p>
            </>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button
            variant='light'
            className='admin-users-modal-cancel'
            onClick={closeRoleModal}
            disabled={loadingRoleUpdate}
          >
            Cancel
          </Button>

          <Button
            className='admin-users-modal-confirm'
            onClick={changeRoleHandler}
            disabled={loadingRoleUpdate}
          >
            Change Role
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default UserListScreen;
