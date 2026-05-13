import { LinkContainer } from 'react-router-bootstrap';
import { Table, Button } from 'react-bootstrap';
import { FaTimes, FaTrash, FaEdit, FaCheck } from 'react-icons/fa';
import Message from '../../Components/Message';
import Loader from '../../Components/Loader';
import { toast } from 'react-toastify';
import {
  useGetUsersQuery,
  useDeleteUserMutation,
} from '../../slices/usersApiSlice.js';

const UserListScreen = () => {
  const { data: users, refetch, isLoading, error } = useGetUsersQuery();

  const [deleteUser, { isLoading: loadingDelete }] = useDeleteUserMutation();

  const deleteHandler = async (id) => {
    if (window.confirm('Are you sure?')) {
      try {
        await deleteUser(id);
        toast.success('User deleted');
        refetch();
      } catch (err) {
        toast.error(err?.data?.message || err.error);
      }
    }
  };

  return (
    <>
      <div className='admin-table-wrapper'>
        <div className='admin-page-header'>
          <div>
            <p className='admin-page-subtitle'>ADMIN PANEL</p>
            <h1 className='admin-page-title'>Users</h1>
          </div>
        </div>
        {loadingDelete && <Loader />}
        {isLoading ? (
          <Loader />
        ) : error ? (
          <Message variant='danger'>
            {error?.data?.message || error.error}
          </Message>
        ) : (
          <Table
            borderless
            hover
            responsive
            className='admin-table align-middle'
          >
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Joined</th>
                <th>Role</th>
                <th className='text-center'>Actions</th>
              </tr>
            </thead>

            <tbody>
              {users.map((user) => (
                <tr key={user._id}>
                  <td>
                    <div className='admin-user-cell'>
                      <div className='admin-user-avatar'>
                        {user.name.charAt(0).toUpperCase()}
                      </div>

                      <div>
                        <div className='admin-user-name'>{user.name}</div>
                      </div>
                    </div>
                  </td>

                  <td>
                    <a
                      href={`mailto:${user.email}`}
                      className='admin-user-email'
                    >
                      {user.email}
                    </a>
                  </td>

                  <td>
                    <span className='admin-date-text'>
                      {new Date(user.createdAt).toLocaleDateString('en-GB')}
                    </span>
                  </td>

                  <td>
                    <span
                      className={
                        user.isAdmin
                          ? 'admin-role-badge'
                          : 'customer-role-badge'
                      }
                    >
                      {user.isAdmin ? 'Admin' : 'Customer'}
                    </span>
                  </td>

                  <td>
                    <div className='admin-action-buttons'>
                      <LinkContainer to={`/admin/user/${user._id}/edit`}>
                        <Button
                          variant='light'
                          className='admin-edit-btn btn-sm'
                        >
                          <FaEdit />
                        </Button>
                      </LinkContainer>

                      <Button
                        className='admin-delete-btn btn-sm'
                        onClick={() => deleteHandler(user._id)}
                      >
                        <FaTrash />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </div>
    </>
  );
};

export default UserListScreen;
