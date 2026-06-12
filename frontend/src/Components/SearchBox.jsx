import { useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';

const SearchBox = () => {
  const navigate = useNavigate();
  const { keyword: urlKeyword } = useParams();
  const [keyword, setKeyword] = useState(urlKeyword || '');

  const submitHandler = (e) => {
    e.preventDefault();
    if (keyword.trim()) {
      setKeyword('');
      navigate(`/products/search/${keyword}`);
    } else {
      navigate('/products');
    }
  };

  return (
    <Form onSubmit={submitHandler} className='search-form'>
      <Form.Control
        type='text'
        name='q'
        onChange={(e) => setKeyword(e.target.value)}
        value={keyword}
        placeholder='Search Products...'
        className='search-input'
      ></Form.Control>
      <Button type='submit' className='search-btn'>
        Search
      </Button>
    </Form>
  );
};

export default SearchBox;
