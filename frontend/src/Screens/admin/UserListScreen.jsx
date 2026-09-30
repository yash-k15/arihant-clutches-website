import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Button, Modal, Table } from 'react-bootstrap';
import { FaCopy, FaExchangeAlt, FaTrash } from 'react-icons/fa';
import { toast } from 'sonner';
import Message from '../../Components/Message';
import Loader from '../../Components/Loader';
import {
  useGetUsersQuery,
  useDeleteUserMutation,
  useUpdateUserMutation,
} from '../../slices/usersApiSlice';
import AdminTableToolbar from '../../Components/AdminTableToolbar';
import AdminFilterPanel from '../../Components/AdminFilterPanel';
import Paginate from '../../Components/Paginate';

import '../../assets/styles/components/UserListScreen.css';

const UserListScreen = () => {
  const { pageNumber } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const keyword = searchParams.get('keyword') || '';
  const role = searchParams.get('role') || '';
  const sort = searchParams.get('sort') || 'latest';

  const [searchValue, setSearchValue] = useState(keyword);

  const [sortOpen, setSortOpen] = useState(false);

  const userSortOptions = [
    { value: 'latest', label: 'Latest' },
    { value: 'oldest', label: 'Oldest' },
    { value: 'name-asc', label: 'Name A → Z' },
    { value: 'name-desc', label: 'Name Z → A' },
  ];

  const [filterOpen, setFilterOpen] = useState(false);
  const [draftRole, setDraftRole] = useState(role);

  const filterCount = role ? 1 : 0;

  const { data, isLoading, error } = useGetUsersQuery({
    keyword,
    pageNumber,
    role,
    sort,
  });

  const users = data?.users || [];

  useEffect(() => {
    const timer = setTimeout(() => {
      const trimmedSearch = searchValue.trim();
      const currentKeyword = searchParams.get('keyword') || '';

      if (trimmedSearch === currentKeyword) return;

      const params = new URLSearchParams(searchParams);

      if (trimmedSearch) {
        params.set('keyword', trimmedSearch);
      } else {
        params.delete('keyword');
      }

      params.delete('pageNumber');

      navigate(
        {
          pathname: '/admin/userlist',
          search: params.toString(),
        },
        { replace: true },
      );
    }, 400);

    return () => clearTimeout(timer);
  }, [searchValue, searchParams, navigate]);

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
    } catch (error) {
      toast.error(
        error?.data?.error ||
          error?.data?.message ||
          error?.error ||
          'Unable to change user role',
      );
    }
  };

  const deleteHandler = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await deleteUser(id).unwrap();
        toast.success('User deleted');
      } catch (error) {
        toast.error(
          error?.data?.error ||
            error?.data?.message ||
            error?.error ||
            'Unable to delete user',
        );
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

  const openFilterPanel = () => {
    setDraftRole(role);
    setFilterOpen(true);
  };

  const handleApplyFilters = () => {
    const params = new URLSearchParams(searchParams);

    if (draftRole) {
      params.set('role', draftRole);
    } else {
      params.delete('role');
    }

    params.delete('pageNumber');
    setFilterOpen(false);

    navigate(
      {
        pathname: '/admin/userlist',
        search: params.toString(),
      },
      { replace: true },
    );
  };

  const handleResetFilters = () => {
    const params = new URLSearchParams(searchParams);

    params.delete('role');
    params.delete('pageNumber');

    setDraftRole('');
    setFilterOpen(false);

    navigate(
      {
        pathname: '/admin/userlist',
        search: params.toString(),
      },
      { replace: true },
    );
  };

  const handleSortChange = (value) => {
    const params = new URLSearchParams(searchParams);

    params.set('sort', value);
    params.delete('pageNumber');

    setSortOpen(false);

    navigate(
      {
        pathname: '/admin/userlist',
        search: params.toString(),
      },
      { replace: true },
    );
  };

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

      <AdminTableToolbar
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        searchPlaceholder='Search users...'
        onFilterClick={openFilterPanel}
        filterCount={filterCount}
        sortValue={sort}
        sortOptions={userSortOptions}
        sortOpen={sortOpen}
        onSortToggle={() => setSortOpen((prev) => !prev)}
        onSortChange={handleSortChange}
      />

      <AdminFilterPanel
        show={filterOpen}
        onClose={() => setFilterOpen(false)}
        onReset={handleResetFilters}
        onApply={handleApplyFilters}
        filterCount={filterCount}
      >
        <div className='admin-filter-section'>
          <h4>Role</h4>

          <div className='admin-filter-radio-group'>
            <label>
              <input
                type='radio'
                name='user-role'
                checked={draftRole === ''}
                onChange={() => setDraftRole('')}
              />
              <span>All</span>
            </label>

            <label>
              <input
                type='radio'
                name='user-role'
                checked={draftRole === 'customer'}
                onChange={() => setDraftRole('customer')}
              />
              <span>Customer</span>
            </label>

            <label>
              <input
                type='radio'
                name='user-role'
                checked={draftRole === 'admin'}
                onChange={() => setDraftRole('admin')}
              />
              <span>Admin</span>
            </label>
          </div>
        </div>
      </AdminFilterPanel>

      {loadingDelete && <Loader />}
      {loadingRoleUpdate && <Loader />}

      {isLoading ? (
        <Loader />
      ) : error ? (
        <Message variant='danger'>
          {error?.data?.error || error?.data?.message || error?.error}
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

      <Paginate
        pages={data?.pages || 1}
        page={data?.page || Number(pageNumber) || 1}
        isAdmin
        adminPath='userlist'
      />

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
