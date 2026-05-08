import React from 'react';
import ReactDOM from 'react-dom/client';
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Provider } from 'react-redux';
import store from './store.js';
//import 'bootstrap/dist/css/bootstrap.min.css';
import './assets/styles/bootstrap.custom.css';
import './assets/styles/index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import HomeScreen from './Screens/HomeScreen';
import ProductScreen from './Screens/ProductScreen';
import CartScreen from './Screens/CartScreen.jsx';
import LoginScreen from './Screens/LoginScreen.jsx';
import RegisterScreen from './Screens/RegisterScreen.jsx';
import ShippingScreen from './Screens/ShippingScreen.jsx';
import PlaceOrderScreen from './Screens/PlaceOrderScreen.jsx';
import OrderScreen from './Screens/OrderScreen.jsx';
import ProfileScreen from './Screens/ProfileScreen.jsx';
import PrivateRoute from './Components/PrivateRoute.jsx';
import AdminRoute from './Components/AdminRoute.jsx';
import OrderListScreen from './Screens/admin/OrderListScreen.jsx';
import ProductListScreen from './Screens/admin/ProductListScreen.jsx';
import ProductEditScreen from './Screens/admin/ProductEditScreen.jsx';
import UserListScreen from './Screens/admin/UserListScreen.jsx';
import UserEditScreen from './Screens/admin/UserEditScreen.jsx';
import ForgotPasswordScreen from './Screens/ForgotPasswordScreen.jsx';
import ResetPasswordScreen from './Screens/ResetPasswordScreen.jsx';

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path='/' element={<App />}>
      <Route index={true} path='/' element={<HomeScreen />} />
      <Route path='/search/:keyword' element={<HomeScreen />} />
      <Route path='/page/:pageNumber' element={<HomeScreen />} />
      <Route
        path='/search/:keyword/page/:pageNumber'
        element={<HomeScreen />}
      />
      <Route path='/products/:id' element={<ProductScreen />} />
      <Route path='/cart' element={<CartScreen />} />
      <Route path='/login' element={<LoginScreen />} />
      <Route path='/register' element={<RegisterScreen />} />
      <Route path='/forgotpassword' element={<ForgotPasswordScreen />} />
      <Route path='/resetpassword/:token' element={<ResetPasswordScreen />} />

      <Route path='' element={<PrivateRoute />}>
        <Route path='/shipping' element={<ShippingScreen />} />
        <Route path='/placeorder' element={<PlaceOrderScreen />} />
        <Route path='/order/:id' element={<OrderScreen />} />
        <Route path='/profile' element={<ProfileScreen />} />
      </Route>

      <Route path='' element={<AdminRoute />}>
        <Route path='/admin/orderlist' element={<OrderListScreen />} />
        <Route path='/admin/productlist' element={<ProductListScreen />} />
        <Route
          path='/admin/productlist/:pageNumber'
          element={<ProductListScreen />}
        />
        <Route path='/admin/product/:id/edit' element={<ProductEditScreen />} />
        <Route path='/admin/userlist' element={<UserListScreen />} />
        <Route path='/admin/user/:id/edit' element={<UserEditScreen />} />
      </Route>
    </Route>,
  ),
);
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <HelmetProvider>
      <Provider store={store}>
        <RouterProvider router={router} />
      </Provider>
    </HelmetProvider>
  </React.StrictMode>,
);

reportWebVitals();
