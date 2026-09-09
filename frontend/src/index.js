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
import ProductsScreen from './Screens/ProductsScreen.jsx';
import CartScreen from './Screens/CartScreen.jsx';
import OrderScreen from './Screens/OrderScreen.jsx';
import ProfileScreen from './Screens/ProfileScreen.jsx';
import PrivateRoute from './Components/PrivateRoute.jsx';
import AdminRoute from './Components/AdminRoute.jsx';
import OrderListScreen from './Screens/admin/OrderListScreen.jsx';
import ProductListScreen from './Screens/admin/ProductListScreen.jsx';
import ProductEditScreen from './Screens/admin/ProductEditScreen.jsx';
import UserListScreen from './Screens/admin/UserListScreen.jsx';
import ProductCreateScreen from './Screens/admin/ProductCreateScreen.jsx';
import AdminLoginScreen from './Screens/AdminLoginScreen.jsx';

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path='/' element={<App />}>
      <Route index={true} path='/' element={<HomeScreen />} />

      <Route path='/products/:slug' element={<ProductScreen />} />
      <Route path='/products' element={<ProductsScreen />} />
      <Route path='/products/search/:keyword' element={<ProductsScreen />} />
      <Route path='/products/page/:pageNumber' element={<ProductsScreen />} />
      <Route
        path='/products/search/:keyword/page/:pageNumber'
        element={<ProductsScreen />}
      />
      <Route path='/cart' element={<CartScreen />} />
      <Route path='/admin/login' element={<AdminLoginScreen />} />

      <Route path='' element={<PrivateRoute />}>
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
        <Route path='/admin/product/create' element={<ProductCreateScreen />} />
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
