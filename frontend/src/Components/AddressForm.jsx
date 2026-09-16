import { useEffect, useState } from 'react';
import { Button, Form } from 'react-bootstrap';

const emptyAddress = {
  fullName: '',
  phone: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  postalCode: '',
  country: 'India',
  isDefault: false,
};

const AddressForm = ({
  initialAddress = null,
  onSubmit,
  onCancel,
  isLoading = false,
  submitLabel = 'Save Address',
  showCancel = true,
}) => {
  const [formData, setFormData] = useState(emptyAddress);

  useEffect(() => {
    if (initialAddress) {
      setFormData({
        fullName: initialAddress.fullName || '',
        phone: initialAddress.phone || '',
        addressLine1: initialAddress.addressLine1 || '',
        addressLine2: initialAddress.addressLine2 || '',
        city: initialAddress.city || '',
        state: initialAddress.state || '',
        postalCode: initialAddress.postalCode || '',
        country: initialAddress.country || 'India',
        isDefault: Boolean(initialAddress.isDefault),
      });
    } else {
      setFormData(emptyAddress);
    }
  }, [initialAddress]);

  const changeHandler = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const submitHandler = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Form className='address-form' onSubmit={submitHandler}>
      <div className='address-form-grid'>
        <Form.Group className='address-form-group'>
          <Form.Label>Full Name</Form.Label>
          <Form.Control
            type='text'
            name='fullName'
            value={formData.fullName}
            onChange={changeHandler}
            required
          />
        </Form.Group>

        <Form.Group className='address-form-group'>
          <Form.Label>Phone</Form.Label>
          <Form.Control
            type='tel'
            name='phone'
            value={formData.phone}
            onChange={changeHandler}
            required
          />
        </Form.Group>

        <Form.Group className='address-form-group address-form-full'>
          <Form.Label>Address Line 1</Form.Label>
          <Form.Control
            type='text'
            name='addressLine1'
            value={formData.addressLine1}
            onChange={changeHandler}
            required
          />
        </Form.Group>

        <Form.Group className='address-form-group address-form-full'>
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

        <Form.Group className='address-form-group'>
          <Form.Label>City</Form.Label>
          <Form.Control
            type='text'
            name='city'
            value={formData.city}
            onChange={changeHandler}
            required
          />
        </Form.Group>

        <Form.Group className='address-form-group'>
          <Form.Label>State</Form.Label>
          <Form.Control
            type='text'
            name='state'
            value={formData.state}
            onChange={changeHandler}
            required
          />
        </Form.Group>

        <Form.Group className='address-form-group'>
          <Form.Label>Postal Code</Form.Label>
          <Form.Control
            type='text'
            name='postalCode'
            value={formData.postalCode}
            onChange={changeHandler}
            required
          />
        </Form.Group>

        <Form.Group className='address-form-group'>
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

      {!initialAddress?.isDefault && (
        <div className='address-form-default'>
          <Form.Check
            type='checkbox'
            id='address-is-default'
            name='isDefault'
            label='Make this my default address'
            checked={formData.isDefault}
            onChange={changeHandler}
          />
        </div>
      )}

      <div className='address-form-actions'>
        {showCancel && (
          <Button
            type='button'
            className='address-form-cancel-btn'
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
        )}

        <Button
          type='submit'
          className='address-form-submit-btn'
          disabled={isLoading}
        >
          {isLoading ? 'Saving...' : submitLabel}
        </Button>
      </div>
    </Form>
  );
};

export default AddressForm;
