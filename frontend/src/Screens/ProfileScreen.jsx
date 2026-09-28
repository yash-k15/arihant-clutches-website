import { useEffect, useRef, useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import {
  FiEdit2,
  FiCopy,
  FiCheckCircle,
  FiClock,
  FiPackage,
  FiX,
} from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import Message from '../Components/Message.jsx';
import Loader from '../Components/Loader.jsx';
import Paginate from '../Components/Paginate.jsx';

import {
  useProfileMutation,

  // Old phone/password OTP flows preserved for possible future use
  // useSendOtpMutation,
  // useSendPasswordChangeOtpMutation,
  // useVerifyPasswordChangeOtpMutation,
  // useChangePasswordMutation,
  // useVerifyPhoneChangeOtpMutation,
  useGetUserAddressesQuery,
  useAddUserAddressMutation,
  useUpdateUserAddressMutation,
  useDeleteUserAddressMutation,
} from '../slices/usersApiSlice.js';
import { setCredentials } from '../slices/authSlice.js';
import { useGetMyOrdersQuery } from '../slices/ordersApiSlice.js';

import AddressForm from '../Components/AddressForm.jsx';
import SavedAddressCard from '../Components/SavedAddressCard.jsx';

import '../assets/styles/components/ProfileScreen.css';

const ProfileScreen = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [openAddressMenu, setOpenAddressMenu] = useState(null);

  const [pageNumber, setPageNumber] = useState(1);
  const ordersSectionRef = useRef(null);

  // const [isChangingPhone, setIsChangingPhone] = useState(false);
  // const [newPhone, setNewPhone] = useState('');
  // const [phoneOtp, setPhoneOtp] = useState('');
  // const [phoneOtpSent, setPhoneOtpSent] = useState(false);

  // const [isChangingPassword, setIsChangingPassword] = useState(false);
  // const [passwordOtp, setPasswordOtp] = useState('');
  // const [passwordChangeToken, setPasswordChangeToken] = useState('');
  // const [newPassword, setNewPassword] = useState('');
  // const [confirmPassword, setConfirmPassword] = useState('');

  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.auth);

  const [updateProfile, { isLoading: loadingUpdateProfile }] =
    useProfileMutation();

  // const [sendOtp, { isLoading: sendingOtp }] = useSendOtpMutation();

  // const [verifyPhoneChangeOtp, { isLoading: verifyingPhoneOtp }] =
  //   useVerifyPhoneChangeOtpMutation();

  // const [sendPasswordChangeOtp, { isLoading: sendingPasswordOtp }] =
  //   useSendPasswordChangeOtpMutation();

  // const [verifyPasswordChangeOtp, { isLoading: verifyingPasswordOtp }] =
  //   useVerifyPasswordChangeOtpMutation();

  // const [changePassword, { isLoading: changingPassword }] =
  //   useChangePasswordMutation();

  const { data: addressData, isLoading: loadingAddresses } =
    useGetUserAddressesQuery(userInfo?._id, {
      skip: !userInfo?._id,
    });

  const [addUserAddress, { isLoading: addingAddress }] =
    useAddUserAddressMutation();

  const [updateUserAddress, { isLoading: updatingAddress }] =
    useUpdateUserAddressMutation();

  const [deleteUserAddress, { isLoading: deletingAddress }] =
    useDeleteUserAddressMutation();

  const {
    data: ordersData,
    isLoading,
    error,
  } = useGetMyOrdersQuery(pageNumber);

  const orders = ordersData?.orders || [];

  useEffect(() => {
    if (userInfo) {
      setName(userInfo.name || '');
      setEmail(userInfo.email || '');
      setPhone(userInfo.phone || '');
    }
  }, [userInfo]);

  const handleEdit = () => {
    setName(userInfo?.name || '');
    setEmail(userInfo?.email || '');
    setPhone(userInfo?.phone || '');
    setIsEditing(true);
  };

  const handleCancel = () => {
    setName(userInfo?.name || '');
    setEmail(userInfo?.email || '');
    setPhone(userInfo?.phone || '');

    // Reset phone-change state
    // setIsChangingPhone(false);
    // setNewPhone('');
    // setPhoneOtp('');
    // setPhoneOtpSent(false);

    setIsEditing(false);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();

    try {
      const updatedUser = await updateProfile({
        _id: userInfo._id,
        name: name.trim(),
        phone: phone.trim(),
      }).unwrap();

      dispatch(setCredentials(updatedUser));

      // Reset phone-change state
      // setIsChangingPhone(false);
      // setNewPhone('');
      // setPhoneOtp('');
      // setPhoneOtpSent(false);

      setIsEditing(false);

      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error(error?.data?.message || 'Unable to update profile');
    }
  };

  const getInitial = (value) => value?.trim()?.charAt(0)?.toUpperCase() || 'U';

  const copyOrderId = async (orderId) => {
    try {
      await navigator.clipboard.writeText(orderId);
      toast.success('Order ID copied');
    } catch (error) {
      toast.error('Unable to copy Order ID');
    }
  };

  const getPaymentStatus = (order) => {
    if (order.isPaid) {
      return {
        label: 'Paid',
        icon: FiCheckCircle,
        className: 'is-success',
      };
    }

    return {
      label: 'Payment Pending',
      icon: FiClock,
      className: 'is-pending',
    };
  };

  const getDeliveryStatus = (order) => {
    if (order.isDelivered) {
      return {
        label: 'Delivered',
        icon: FiCheckCircle,
        className: 'is-success',
      };
    }

    return {
      label: 'Processing',
      icon: FiPackage,
      className: 'is-pending',
    };
  };

  // const handleSendPhoneOtp = async () => {
  //   const phone = newPhone.trim();

  //   if (!/^[6-9]\d{9}$/.test(phone)) {
  //     toast.warning('Enter a valid mobile number');
  //     return;
  //   }

  //   if (phone === userInfo.phone) {
  //     toast.warning('This is already your current phone number');
  //     return;
  //   }

  //   try {
  //     await sendOtp({
  //       phone,
  //       purpose: 'phone-change',
  //     }).unwrap();

  //     setPhoneOtpSent(true);
  //     setPhoneOtp('');

  //     toast.success('OTP sent successfully');
  //   } catch (error) {
  //     toast.error(error?.data?.message || 'Unable to send OTP');
  //   }
  // };

  // const handleVerifyPhoneOtp = async () => {
  //   if (!phoneOtp.trim()) {
  //     toast.warning('Enter the OTP');
  //     return;
  //   }

  //   try {
  //     const updatedUser = await verifyPhoneChangeOtp({
  //       phone: newPhone.trim(),
  //       otp: phoneOtp.trim(),
  //       purpose: 'phone-change',
  //     }).unwrap();

  //     dispatch(setCredentials(updatedUser));

  //     setIsChangingPhone(false);
  //     setNewPhone('');
  //     setPhoneOtp('');
  //     setPhoneOtpSent(false);

  //     toast.success('Phone number updated successfully');
  //   } catch (error) {
  //     toast.error(error?.data?.message || 'Invalid OTP');
  //   }
  // };

  // const handleCancelPhoneChange = () => {
  //   setIsChangingPhone(false);
  //   setNewPhone('');
  //   setPhoneOtp('');
  //   setPhoneOtpSent(false);
  // };

  // const handleStartPasswordChange = async () => {
  //   try {
  //     await sendPasswordChangeOtp().unwrap();

  //     setIsChangingPassword(true);
  //     setPasswordOtp('');
  //     setPasswordChangeToken('');

  //     toast.success('OTP sent successfully');
  //   } catch (error) {
  //     toast.error(error?.data?.message || 'Unable to send password change OTP');
  //   }
  // };

  // const handleVerifyPasswordOtp = async () => {
  //   if (!passwordOtp.trim()) {
  //     toast.warning('Enter the OTP');
  //     return;
  //   }

  //   try {
  //     const response = await verifyPasswordChangeOtp({
  //       otp: passwordOtp.trim(),
  //     }).unwrap();

  //     setPasswordChangeToken(response.passwordChangeToken);

  //     toast.success('OTP verified successfully');
  //   } catch (error) {
  //     toast.error(error?.data?.message || 'Invalid OTP');
  //   }
  // };

  // const handleChangePassword = async () => {
  //   if (!newPassword) {
  //     toast.warning('Enter a new password');
  //     return;
  //   }

  //   if (newPassword.length < 6) {
  //     toast.warning('Password must be at least 6 characters');
  //     return;
  //   }

  //   if (!confirmPassword) {
  //     toast.warning('Confirm your new password');
  //     return;
  //   }

  //   if (newPassword !== confirmPassword) {
  //     toast.warning('Passwords do not match');
  //     return;
  //   }

  //   if (!passwordChangeToken) {
  //     toast.error('Password change authorization is missing');
  //     return;
  //   }

  //   try {
  //     await changePassword({
  //       passwordChangeToken,
  //       newPassword,
  //     }).unwrap();

  //     setIsChangingPassword(false);
  //     setPasswordOtp('');
  //     setPasswordChangeToken('');
  //     setNewPassword('');
  //     setConfirmPassword('');

  //     toast.success('Password changed successfully');
  //   } catch (error) {
  //     toast.error(error?.data?.message || 'Unable to change password');
  //   }
  // };

  const handleAddAddress = async (address) => {
    try {
      await addUserAddress(address).unwrap();

      setIsAddingAddress(false);

      toast.success('Address saved successfully');
    } catch (error) {
      toast.error(error?.data?.message || 'Unable to save address');
    }
  };

  const handleUpdateAddress = async (address) => {
    try {
      await updateUserAddress({
        addressId: editingAddress._id,
        ...address,
      }).unwrap();

      setEditingAddress(null);

      toast.success('Address updated successfully');
    } catch (error) {
      toast.error(error?.data?.message || 'Unable to update address');
    }
  };

  const handleDeleteAddress = async (addressId) => {
    setOpenAddressMenu(null);

    if (!window.confirm('Are you sure you want to delete this address?')) {
      return;
    }

    try {
      await deleteUserAddress(addressId).unwrap();

      if (editingAddress?._id === addressId) {
        setEditingAddress(null);
      }

      toast.success('Address deleted successfully');
    } catch (error) {
      toast.error(error?.data?.message || 'Unable to delete address');
    }
  };

  const handleToggleAddressMenu = (addressId) => {
    setOpenAddressMenu((currentId) =>
      currentId === addressId ? null : addressId,
    );
  };

  const handleEditAddress = (address) => {
    setIsAddingAddress(false);
    setEditingAddress(address);
    setOpenAddressMenu(null);
  };

  const handleCancelAddressForm = () => {
    setIsAddingAddress(false);
    setEditingAddress(null);
  };

  return (
    <div className='profile-page'>
      <header className='profile-page-header'>
        <h1>My Account</h1>
        <p>Manage your account and view your orders</p>
      </header>

      <section className='profile-account-section'>
        <div className='profile-section-heading'>
          <div>
            <h2>Account Information</h2>
            <p>Your personal account details</p>
          </div>
        </div>

        <div className='profile-account-card'>
          {!isEditing ? (
            <>
              <div className='profile-account-top'>
                <div className='profile-user-info'>
                  <div className='profile-avatar' aria-hidden='true'>
                    {getInitial(userInfo?.name)}
                  </div>
                  <div>
                    <h3>{userInfo?.name || 'User'}</h3>
                    <p>Customer account</p>
                  </div>
                </div>

                <Button
                  type='button'
                  className='profile-edit-button'
                  onClick={handleEdit}
                >
                  <FiEdit2 />
                  Edit Profile
                </Button>
              </div>

              <div className='profile-account-details'>
                <div className='profile-detail'>
                  <span className='profile-detail-label'>Phone</span>
                  <span className='profile-detail-value'>
                    {userInfo?.phone || 'Not available'}
                  </span>
                </div>

                <div className='profile-detail'>
                  <span className='profile-detail-label'>Email</span>
                  <span className='profile-detail-value'>
                    {userInfo?.email || 'Not added'}
                  </span>
                </div>
              </div>
            </>
          ) : (
            <Form className='profile-edit-form' onSubmit={handleSaveProfile}>
              <div className='profile-edit-header'>
                <div>
                  <h3>Edit Profile</h3>
                  <p>Update your account information</p>
                </div>

                <button
                  type='button'
                  className='profile-close-button'
                  onClick={handleCancel}
                  aria-label='Cancel editing'
                >
                  <FiX />
                </button>
              </div>

              <div className='profile-form-fields'>
                <Form.Group controlId='profileName'>
                  <Form.Label>Name</Form.Label>
                  <Form.Control
                    type='text'
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </Form.Group>

                <Form.Group controlId='profileEmail'>
                  <Form.Label>Email</Form.Label>

                  <Form.Control type='email' value={email} readOnly />

                  <Form.Text className='profile-form-helper'>
                    Email address cannot be changed.
                  </Form.Text>
                </Form.Group>

                <Form.Group controlId='profilePhone'>
                  <Form.Label>Phone</Form.Label>

                  <Form.Control
                    type='tel'
                    value={phone}
                    onChange={(e) =>
                      setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))
                    }
                    placeholder='Enter your mobile number'
                    maxLength={10}
                    autoComplete='tel'
                  />

                  <Form.Text className='profile-form-helper'>
                    Optional
                  </Form.Text>
                </Form.Group>

                {/* <Form.Group controlId='profilePhone'>
                  <Form.Label>Phone</Form.Label>

                  {!isChangingPhone ? (
                    <div className='profile-phone-field'>
                      <Form.Control
                        type='tel'
                        value={userInfo?.phone || ''}
                        readOnly
                      />

                      <button
                        type='button'
                        className='profile-phone-change-button'
                        onClick={() => setIsChangingPhone(true)}
                      >
                        Change
                      </button>
                    </div>
                  ) : (
                    <div className='profile-phone-change'>
                      <div className='profile-phone-input-row'>
                        <Form.Control
                          type='tel'
                          value={newPhone}
                          onChange={(e) =>
                            setNewPhone(
                              e.target.value.replace(/\D/g, '').slice(0, 10),
                            )
                          }
                          placeholder='Enter new phone number'
                          maxLength={10}
                          disabled={phoneOtpSent}
                        />

                        {!phoneOtpSent && (
                          <button
                            type='button'
                            className='profile-phone-action-btn'
                            onClick={handleSendPhoneOtp}
                            disabled={sendingOtp}
                          >
                            {sendingOtp ? 'Sending...' : 'Send OTP'}
                          </button>
                        )}
                      </div>

                      {phoneOtpSent && (
                        <div className='profile-phone-otp'>
                          <Form.Control
                            type='text'
                            value={phoneOtp}
                            onChange={(e) =>
                              setPhoneOtp(
                                e.target.value.replace(/\D/g, '').slice(0, 6),
                              )
                            }
                            placeholder='Enter OTP'
                            maxLength={6}
                            inputMode='numeric'
                          />

                          <button
                            type='button'
                            className='profile-phone-action-btn'
                            onClick={handleVerifyPhoneOtp}
                            disabled={verifyingPhoneOtp}
                          >
                            {verifyingPhoneOtp ? 'Verifying...' : 'Verify OTP'}
                          </button>
                        </div>
                      )}

                      <button
                        type='button'
                        className='profile-phone-cancel-btn'
                        onClick={handleCancelPhoneChange}
                      >
                        Cancel
                      </button>
                    </div>
                  )}

                  <Form.Text>
                    Changing your phone number will require OTP verification.
                  </Form.Text>
                </Form.Group> */}
              </div>

              <div className='profile-form-actions'>
                <Button
                  type='button'
                  className='profile-cancel-button'
                  onClick={handleCancel}
                  disabled={loadingUpdateProfile}
                >
                  Cancel
                </Button>
                <Button
                  type='submit'
                  className='profile-save-button'
                  disabled={loadingUpdateProfile}
                >
                  {loadingUpdateProfile ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </Form>
          )}
        </div>
      </section>

      <section className='profile-addresses-section'>
        <div className='profile-section-heading'>
          <div>
            <h2>Saved Addresses</h2>
            <p>Manage your saved delivery addresses</p>
          </div>

          {!isAddingAddress && !editingAddress && (
            <Button
              type='button'
              className='profile-add-address-button'
              onClick={() => setIsAddingAddress(true)}
              disabled={addressData?.addresses?.length >= 10}
            >
              + Add Address
            </Button>
          )}
        </div>

        {loadingAddresses ? (
          <div className='profile-addresses-loader'>
            <Loader />
          </div>
        ) : isAddingAddress ? (
          <div className='profile-address-form-card'>
            <div className='profile-address-form-header'>
              <div>
                <h3>Add New Address</h3>
                <p>Save an address for faster checkout.</p>
              </div>

              <button
                type='button'
                className='profile-close-button'
                onClick={handleCancelAddressForm}
                aria-label='Cancel adding address'
              >
                <FiX />
              </button>
            </div>

            <AddressForm
              onSubmit={handleAddAddress}
              onCancel={handleCancelAddressForm}
              isLoading={addingAddress}
              submitLabel='Save Address'
            />
          </div>
        ) : editingAddress ? (
          <div className='profile-address-form-card'>
            <div className='profile-address-form-header'>
              <div>
                <h3>Edit Address</h3>
                <p>Update your saved delivery address.</p>
              </div>

              <button
                type='button'
                className='profile-close-button'
                onClick={handleCancelAddressForm}
                aria-label='Cancel editing address'
              >
                <FiX />
              </button>
            </div>

            <AddressForm
              initialAddress={editingAddress}
              onSubmit={handleUpdateAddress}
              onCancel={handleCancelAddressForm}
              isLoading={updatingAddress}
              submitLabel='Update Address'
            />
          </div>
        ) : addressData?.addresses?.length > 0 ? (
          <>
            <div className='profile-addresses-list'>
              {addressData.addresses.map((address) => (
                <SavedAddressCard
                  key={address._id}
                  address={address}
                  onEdit={handleEditAddress}
                  onDelete={handleDeleteAddress}
                  showMenu={openAddressMenu === address._id}
                  onToggleMenu={handleToggleAddressMenu}
                  isDeleting={deletingAddress}
                />
              ))}
            </div>

            <div className='profile-addresses-footer'>
              <span>{addressData.addresses.length} of 10 saved addresses</span>

              {addressData.addresses.length >= 10 && (
                <span className='profile-address-limit-message'>
                  Maximum saved addresses reached
                </span>
              )}
            </div>
          </>
        ) : (
          <div className='profile-empty-addresses'>
            <h3>No saved addresses</h3>
            <p>Save an address to make checkout faster next time.</p>

            <Button
              type='button'
              className='profile-add-address-empty-button'
              onClick={() => setIsAddingAddress(true)}
            >
              + Add Your First Address
            </Button>
          </div>
        )}
      </section>

      {/* {userInfo?.isAdmin && (
        <section className='profile-security-section'>
          <div className='profile-section-heading'>
            <div>
              <h2>Security</h2>
              <p>Manage your account security</p>
            </div>
          </div>

          <div className='profile-security-card'>
            <div className='profile-security-info'>
              <h3>Password</h3>

              {!isChangingPassword ? (
                <p>
                  Change your admin account password using OTP verification.
                </p>
              ) : passwordChangeToken ? (
                <p>Enter and confirm your new password.</p>
              ) : (
                <p>Enter the OTP sent to your registered phone number.</p>
              )}
            </div>

            <div className='profile-security-actions'>
              {!isChangingPassword ? (
                <button
                  type='button'
                  className='profile-change-password-button'
                  onClick={handleStartPasswordChange}
                  disabled={sendingPasswordOtp}
                >
                  {sendingPasswordOtp ? 'Sending OTP...' : 'Change Password'}
                </button>
              ) : passwordChangeToken ? (
                <div className='profile-password-form'>
                  <Form.Control
                    type='password'
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder='New password'
                    minLength={6}
                  />

                  <Form.Control
                    type='password'
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder='Confirm new password'
                    minLength={6}
                  />

                  <button
                    type='button'
                    className='profile-change-password-button'
                    onClick={handleChangePassword}
                    disabled={changingPassword}
                  >
                    {changingPassword ? 'Changing...' : 'Change Password'}
                  </button>
                </div>
              ) : (
                <div className='profile-password-otp'>
                  <Form.Control
                    type='text'
                    value={passwordOtp}
                    onChange={(e) =>
                      setPasswordOtp(
                        e.target.value.replace(/\D/g, '').slice(0, 6),
                      )
                    }
                    placeholder='Enter OTP'
                    maxLength={6}
                    inputMode='numeric'
                  />

                  <button
                    type='button'
                    className='profile-change-password-button'
                    onClick={handleVerifyPasswordOtp}
                    disabled={verifyingPasswordOtp}
                  >
                    {verifyingPasswordOtp ? 'Verifying...' : 'Verify OTP'}
                  </button>
                </div>
              )}

              {isChangingPassword && (
                <button
                  type='button'
                  className='profile-password-cancel-button'
                  onClick={() => {
                    setIsChangingPassword(false);
                    setPasswordOtp('');
                    setPasswordChangeToken('');
                    setNewPassword('');
                    setConfirmPassword('');
                  }}
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </section>
      )} */}

      <section ref={ordersSectionRef} className='profile-orders-section'>
        <div className='profile-section-heading'>
          <div>
            <h2>My Orders</h2>
            <p>Your recent purchases and order status</p>
          </div>
          {orders?.length > 0 && (
            <span className='profile-order-count'>
              {ordersData?.pages > 1
                ? `Showing ${(ordersData.page - 1) * 5 + 1}–${Math.min(
                    ordersData.page * 5,
                    ordersData.totalOrders,
                  )} of ${ordersData.totalOrders} orders`
                : `${ordersData.totalOrders} ${
                    ordersData.totalOrders === 1 ? 'Order' : 'Orders'
                  }`}
            </span>
          )}
        </div>

        {isLoading ? (
          <div className='profile-orders-loader'>
            <Loader />
          </div>
        ) : error ? (
          <Message variant='danger'>
            {error?.data?.message || error.error}
          </Message>
        ) : orders?.length === 0 ? (
          <div className='profile-empty-orders'>
            <div className='profile-empty-orders-icon'>
              <FiPackage />
            </div>
            <h3>No orders yet</h3>
            <p>Your orders will appear here once you place your first order.</p>
            <Link to='/products' className='profile-shop-button'>
              Start Shopping
            </Link>
          </div>
        ) : (
          <>
            <div className='profile-orders-list'>
              {orders.map((order) => {
                const paymentStatus = getPaymentStatus(order);
                const deliveryStatus = getDeliveryStatus(order);
                const PaymentIcon = paymentStatus.icon;
                const DeliveryIcon = deliveryStatus.icon;

                return (
                  <article className='profile-order-card' key={order._id}>
                    <div className='profile-order-header'>
                      <div>
                        <span className='profile-order-label'>Order</span>
                        <div className='profile-order-id-wrapper'>
                          <strong className='profile-order-id'>
                            #{order._id.slice(-8)}
                          </strong>

                          <button
                            type='button'
                            className='profile-order-copy-button'
                            onClick={() => copyOrderId(order._id)}
                            aria-label='Copy Order ID'
                            title='Copy Order ID'
                          >
                            <FiCopy />
                          </button>
                        </div>
                      </div>
                      <span className='profile-order-date'>
                        {new Date(order.createdAt).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </div>

                    <div className='profile-order-details'>
                      <div className='profile-order-detail'>
                        <span>Total</span>
                        <strong>
                          ₹{Number(order.totalPrice).toLocaleString('en-IN')}
                        </strong>
                      </div>

                      <div className='profile-order-detail'>
                        <span>Payment</span>
                        <span
                          className={`profile-status ${paymentStatus.className}`}
                        >
                          <PaymentIcon />
                          {paymentStatus.label}
                        </span>
                      </div>

                      <div className='profile-order-detail'>
                        <span>Delivery</span>
                        <span
                          className={`profile-status ${deliveryStatus.className}`}
                        >
                          <DeliveryIcon />
                          {deliveryStatus.label}
                        </span>
                      </div>
                    </div>

                    <div className='profile-order-footer'>
                      <Link
                        to={`/order/${order._id}`}
                        className='profile-view-order-button'
                      >
                        View Order
                        <span aria-hidden='true'>→</span>
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
            <Paginate
              pages={ordersData?.pages || 1}
              page={ordersData?.page || 1}
              isClientSide
              onPageChange={(newPage) => {
                setPageNumber(newPage);

                ordersSectionRef.current?.scrollIntoView({
                  behavior: 'smooth',
                  block: 'start',
                });
              }}
            />
          </>
        )}
      </section>
    </div>
  );
};

export default ProfileScreen;
