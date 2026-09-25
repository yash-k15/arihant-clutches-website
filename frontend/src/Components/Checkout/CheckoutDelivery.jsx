import { useEffect, useState, useMemo } from 'react';
import { Button, Form } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { saveShippingAddress } from '../../slices/cartSlice.js';
import {
  useGetUserAddressesQuery,
  useAddUserAddressMutation,
} from '../../slices/usersApiSlice.js';

const emptyAddress = {
  fullName: '',
  phone: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  postalCode: '',
  country: 'India',
};

const CheckoutDelivery = ({ onContinue }) => {
  const dispatch = useDispatch();

  const { userInfo } = useSelector((state) => state.auth);
  const { shippingAddress } = useSelector((state) => state.cart);

  const isCustomer = !!userInfo;

  const { data: addressData, isLoading: isAddressesLoading } =
    useGetUserAddressesQuery(userInfo?._id, {
      skip: !isCustomer || !userInfo?._id,
    });

  const [addUserAddress, { isLoading: isSavingAddress }] =
    useAddUserAddressMutation();

  const savedAddresses = useMemo(
    () => addressData?.addresses || [],
    [addressData?.addresses],
  );

  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [isEnteringNewAddress, setIsEnteringNewAddress] = useState(false);

  const [formData, setFormData] = useState({
    ...emptyAddress,
    fullName: shippingAddress?.fullName || '',
    phone: shippingAddress?.phone || '',
    addressLine1: shippingAddress?.addressLine1 || '',
    addressLine2: shippingAddress?.addressLine2 || '',
    city: shippingAddress?.city || '',
    state: shippingAddress?.state || '',
    postalCode: shippingAddress?.postalCode || '',
    country: shippingAddress?.country || 'India',
  });

  const [saveAddress, setSaveAddress] = useState(false);
  const [makeDefault, setMakeDefault] = useState(false);

  /*
   * If the cart already contains a saved address,
   * select the matching saved address.
   */
  useEffect(() => {
    if (!savedAddresses.length || !shippingAddress?.addressLine1) {
      return;
    }

    const matchingAddress = savedAddresses.find(
      (address) =>
        address.fullName === shippingAddress.fullName &&
        address.phone === shippingAddress.phone &&
        address.addressLine1 === shippingAddress.addressLine1 &&
        (address.addressLine2 || '') === (shippingAddress.addressLine2 || '') &&
        address.city === shippingAddress.city &&
        address.state === shippingAddress.state &&
        address.postalCode === shippingAddress.postalCode &&
        address.country === shippingAddress.country,
    );

    if (matchingAddress) {
      setSelectedAddressId(matchingAddress._id);
      setIsEnteringNewAddress(false);
    }
  }, [savedAddresses, shippingAddress]);

  /*
   * If there is no existing cart address, automatically
   * select the customer's default saved address.
   */
  useEffect(() => {
    if (
      !shippingAddress?.addressLine1 &&
      addressData?.defaultAddress &&
      !selectedAddressId &&
      !isEnteringNewAddress
    ) {
      setSelectedAddressId(addressData.defaultAddress._id);
    }
  }, [addressData, shippingAddress, selectedAddressId, isEnteringNewAddress]);

  const changeHandler = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const selectSavedAddress = (address) => {
    setSelectedAddressId(address._id);
    setIsEnteringNewAddress(false);

    setSaveAddress(false);
    setMakeDefault(false);
  };

  const handleEnterNewAddress = () => {
    setSelectedAddressId(null);
    setIsEnteringNewAddress(true);

    setFormData({
      ...emptyAddress,
      fullName: shippingAddress?.fullName || '',
      phone: shippingAddress?.phone || '',
      addressLine1: shippingAddress?.addressLine1 || '',
      addressLine2: shippingAddress?.addressLine2 || '',
      city: shippingAddress?.city || '',
      state: shippingAddress?.state || '',
      postalCode: shippingAddress?.postalCode || '',
      country: shippingAddress?.country || 'India',
    });
  };

  const handleUseSavedAddress = () => {
    setIsEnteringNewAddress(false);

    setSelectedAddressId(
      addressData?.defaultAddress?._id || savedAddresses[0]?._id || null,
    );

    setSaveAddress(false);
    setMakeDefault(false);
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    let addressToUse;

    /*
     * Existing saved address selected.
     */
    if (selectedAddressId) {
      const selectedAddress = savedAddresses.find(
        (address) => address._id === selectedAddressId,
      );

      if (!selectedAddress) {
        return;
      }

      addressToUse = {
        fullName: selectedAddress.fullName,
        phone: selectedAddress.phone,
        addressLine1: selectedAddress.addressLine1,
        addressLine2: selectedAddress.addressLine2 || '',
        city: selectedAddress.city,
        state: selectedAddress.state,
        postalCode: selectedAddress.postalCode,
        country: selectedAddress.country,
      };
    } else {
      /*
       * New address entered manually.
       */
      addressToUse = {
        fullName: formData.fullName.trim(),
        phone: formData.phone.trim(),
        addressLine1: formData.addressLine1.trim(),
        addressLine2: formData.addressLine2.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        postalCode: formData.postalCode.trim(),
        country: formData.country.trim(),
      };

      /*
       * Save the address if requested.
       */
      if (saveAddress && isCustomer) {
        try {
          await addUserAddress({
            ...addressToUse,
            isDefault: makeDefault,
          }).unwrap();
        } catch (error) {
          /*
           * Reaching the 10-address limit should not
           * prevent the customer from checking out.
           */
          if (
            error?.data?.message !== 'You can save a maximum of 10 addresses'
          ) {
            return;
          }
        }
      }
    }

    dispatch(saveShippingAddress(addressToUse));
    onContinue();
  };

  const hasSavedAddresses = savedAddresses.length > 0;

  return (
    <div className='checkout-step-content checkout-delivery'>
      <div className='checkout-section-heading'>
        <p className='checkout-section-label'>STEP 1</p>

        <h3>Delivery Address</h3>

        <p>Select where you would like your order delivered.</p>
      </div>

      {isCustomer && isAddressesLoading ? (
        <div className='checkout-address-loading'>
          Loading saved addresses...
        </div>
      ) : (
        <>
          {hasSavedAddresses && !isEnteringNewAddress && (
            <div className='checkout-saved-addresses'>
              <div className='checkout-saved-addresses-header'>
                <h4>Saved Addresses</h4>
              </div>

              <div className='checkout-saved-addresses-list'>
                {savedAddresses.map((address) => (
                  <button
                    type='button'
                    key={address._id}
                    className={`checkout-address-card ${
                      selectedAddressId === address._id ? 'selected' : ''
                    }`}
                    onClick={() => selectSavedAddress(address)}
                  >
                    <div className='checkout-address-card-header'>
                      <div className='checkout-address-card-name'>
                        <strong>{address.fullName}</strong>

                        {address.isDefault && (
                          <span className='checkout-address-default'>
                            Default
                          </span>
                        )}
                      </div>

                      <span
                        className={`checkout-address-radio ${
                          selectedAddressId === address._id ? 'selected' : ''
                        }`}
                      />
                    </div>

                    <div className='checkout-address-card-details'>
                      <p>{address.phone}</p>
                      <p>{address.addressLine1}</p>

                      {address.addressLine2 && <p>{address.addressLine2}</p>}

                      <p>
                        {address.city}, {address.state} - {address.postalCode}
                      </p>

                      <p>{address.country}</p>
                    </div>
                  </button>
                ))}
              </div>

              <button
                type='button'
                className='checkout-new-address-link'
                onClick={handleEnterNewAddress}
              >
                + Enter a new address
              </button>
            </div>
          )}

          {(!hasSavedAddresses || isEnteringNewAddress) && (
            <Form className='checkout-delivery-form' onSubmit={submitHandler}>
              {hasSavedAddresses && (
                <button
                  type='button'
                  className='checkout-back-to-saved-link'
                  onClick={handleUseSavedAddress}
                >
                  ← Use a saved address
                </button>
              )}

              <div className='checkout-address-form-grid'>
                <Form.Group>
                  <Form.Label>Full Name</Form.Label>
                  <Form.Control
                    type='text'
                    name='fullName'
                    value={formData.fullName}
                    onChange={changeHandler}
                    required
                  />
                </Form.Group>

                <Form.Group>
                  <Form.Label>Phone</Form.Label>
                  <Form.Control
                    type='tel'
                    name='phone'
                    value={formData.phone}
                    onChange={changeHandler}
                    required
                  />
                </Form.Group>

                <Form.Group className='checkout-address-form-full'>
                  <Form.Label>Address Line 1</Form.Label>
                  <Form.Control
                    type='text'
                    name='addressLine1'
                    value={formData.addressLine1}
                    onChange={changeHandler}
                    required
                  />
                </Form.Group>

                <Form.Group className='checkout-address-form-full'>
                  <Form.Label>
                    Address Line 2 <span>(Optional)</span>
                  </Form.Label>
                  <Form.Control
                    type='text'
                    name='addressLine2'
                    value={formData.addressLine2}
                    onChange={changeHandler}
                  />
                </Form.Group>

                <Form.Group>
                  <Form.Label>City</Form.Label>
                  <Form.Control
                    type='text'
                    name='city'
                    value={formData.city}
                    onChange={changeHandler}
                    required
                  />
                </Form.Group>

                <Form.Group>
                  <Form.Label>State</Form.Label>
                  <Form.Control
                    type='text'
                    name='state'
                    value={formData.state}
                    onChange={changeHandler}
                    required
                  />
                </Form.Group>

                <Form.Group>
                  <Form.Label>Postal Code</Form.Label>
                  <Form.Control
                    type='text'
                    name='postalCode'
                    value={formData.postalCode}
                    onChange={changeHandler}
                    required
                  />
                </Form.Group>

                <Form.Group>
                  <Form.Label>Country</Form.Label>
                  <Form.Control
                    type='text'
                    name='country'
                    value={formData.country}
                    onChange={changeHandler}
                    required
                  />
                </Form.Group>
              </div>

              {isCustomer && (
                <div className='checkout-address-save-options'>
                  <Form.Check
                    type='checkbox'
                    id='checkout-save-address'
                    label='Save this address'
                    checked={saveAddress}
                    onChange={(e) => {
                      setSaveAddress(e.target.checked);

                      if (!e.target.checked) {
                        setMakeDefault(false);
                      }
                    }}
                  />

                  {saveAddress && savedAddresses.length < 10 && (
                    <Form.Check
                      type='checkbox'
                      id='checkout-make-default'
                      label='Make this my default address'
                      checked={makeDefault}
                      onChange={(e) => setMakeDefault(e.target.checked)}
                    />
                  )}

                  {saveAddress && savedAddresses.length >= 10 && (
                    <p className='checkout-address-limit-message'>
                      You already have 10 saved addresses. This address will be
                      used for this order but will not be saved.
                    </p>
                  )}
                </div>
              )}

              <div className='checkout-delivery-actions'>
                <Button
                  type='submit'
                  className='checkout-continue-btn'
                  disabled={isSavingAddress}
                >
                  {isSavingAddress ? 'Saving...' : 'Continue to Payment'}
                </Button>
              </div>
            </Form>
          )}

          {hasSavedAddresses && !isEnteringNewAddress && (
            <div className='checkout-delivery-actions'>
              <Button
                type='button'
                className='checkout-continue-btn'
                disabled={!selectedAddressId}
                onClick={submitHandler}
              >
                Continue to Payment
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CheckoutDelivery;
