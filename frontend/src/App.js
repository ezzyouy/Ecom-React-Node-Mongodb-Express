import { BrowserRouter, Link, NavLink, Route, Routes } from "react-router-dom";
import HomeScreen from "./screens/HomeScreen";
import ProductScreen from "./screens/ProductScreen";
import Navbar from "react-bootstrap/Navbar";
import Container from 'react-bootstrap/Container'
import Nav from "react-bootstrap/Nav";
import { Badge, Button, NavDropdown } from "react-bootstrap";
import { useContext, useEffect, useState, } from "react";
import { Store } from "./Store";
import CartScreen from "./screens/CartScreen";
import SigninScreen from "./screens/SigninScreen";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/ReactToastify.css'
import ShippingAdreessScreen from "./screens/ShippingAdreessScreen";
import SignupScreen from "./screens/SignupScreen";
import PaymentScreen from "./screens/PaymentScreen";
import PlaceOrderScreen from "./screens/PlaceOrderScreen";
import OrderScreen from "./screens/OrderScreen";
import OrderHistoryScreen from "./screens/OrderHistoryScreen";
import ProfileScreen from "./screens/ProfileScreen";
import { getError } from "./utils";
import axios from "axios";
import SearchBox from "./components/SearchBox";
import SearchScreen from "./screens/SearchScreen";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardScree from "./screens/DashboardScree";
import AdminRoute from "./components/AdminRoute";
import ProductListScreen from "./screens/ProductListScreen";
import ProductEditScreen from "./screens/ProductEditScreen";
import OrderListScreen from "./screens/OrderListScreen";
import UserListScreen from "./screens/UserListScreen";
import UserEditScreen from "./screens/UserEditScreen";
import MapScreen from "./screens/MapScreen";

function App() {
  const { state, dispatch: ctxDispatch } = useContext(Store)

  const { fullBox, cart, userInfo } = state
  const signoutHandler = () => {
    ctxDispatch({ type: "USER_SIGNOUT" });
    localStorage.removeItem('userInfo');
    localStorage.removeItem('shippingAddress')
    localStorage.removeItem('paymentMethod')
    window.location.href = '/signin'
  }
  //-----------UseState-------------------
  const [sidebaeIsOpen, setSidebaeIsOpen] = useState(false)
  const [categories, setCategories] = useState([])
  //-----------useEffet-------------------
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await axios.get(`/api/products/categories`);
        setCategories(data)
      } catch (error) {
        toast.error(getError(error))
      }
    }
    fetchCategories();
  }, [])

  return (

    <div className={
      sidebaeIsOpen
        ? fullBox
          ? `d-flex flex-column site-container active-cont full-box`
          : "d-flex flex-column site-container active-cont"
        : fullBox
          ? `d-flex flex-column site-container active-cont`
          : "d-flex flex-column site-container"
    }>
      <ToastContainer position="bottom-center" limit={1} />
      <header style={fullBox ? { display: 'none' } : null}>
        <Navbar bg="dark" variant="dark" expand="lg">
          <Container>
            <Button
              variant="dark"
              onClick={() => setSidebaeIsOpen(!sidebaeIsOpen)}
            >
              <i className="fas fa-bars" />
            </Button>
            <Nav.Link as={Link} to="/">
              <Navbar.Brand>Portfolio</Navbar.Brand>
            </Nav.Link >
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
              <SearchBox />
              <Nav className="me-auto w-100 justify-content-end">
                <Link as={Link} to="/cart" className="nav-link">
                  Cart
                  {cart.cartItems.length > 0 && (
                    <Badge pill bg="danger">
                      {cart.cartItems.reduce((a, c) => a + c.quantity, 0)}
                    </Badge>
                  )}
                </Link>

                {(userInfo && userInfo.length !== 0) ?
                  (<NavDropdown title={userInfo.name} id="basic-nav-dropdown">
                    <NavDropdown.Item href="/profile" >User Profile</NavDropdown.Item>
                    <NavDropdown.Item href="/orderhistory">Order History</NavDropdown.Item>
                    <NavDropdown.Divider />
                    <Link
                      className="dropdown-item"
                      to="/signout"
                      onClick={signoutHandler}
                    >
                      Sign Out
                    </Link>
                  </NavDropdown>)
                  : (
                    <Link className="nav-link" to="/signin">Sign In</Link>
                  )}
                {(userInfo && userInfo.length !== 0) && userInfo.isAdmin && (
                  <NavDropdown title='Admin' id="admin-nav-dropdown">

                    <NavDropdown.Item href={'/admin/dashboard'}>Dashboard</NavDropdown.Item>
                    <NavDropdown.Item href={'/admin/products'}>Products</NavDropdown.Item>
                    <NavDropdown.Item href={'/admin/orders'}>Orders</NavDropdown.Item>
                    <NavDropdown.Item href={'/admin/users'}>Users</NavDropdown.Item>
                  </NavDropdown>
                )}
              </Nav>
            </Navbar.Collapse>
          </Container>
        </Navbar>
      </header>
      <div className={
        sidebaeIsOpen
          ? "active-nav side-navbar d-flex justify-content-between flex-wrap flex-column"
          : "side-navbar d-flex justify-content-between flex-wrap flex-column"
      }>
        <Nav className="flex-column text-white w-100 p-2">
          <Nav.Item>
            <strong>Categories</strong>
          </Nav.Item>
          {categories.map((category) => (
            <Nav.Item key={category}>
              <NavLink to={`search?category=${category}`}
                onClick={() => setSidebaeIsOpen(false)}
              >
                {category}
              </NavLink>
            </Nav.Item>
          ))}
        </Nav>
      </div>
      <main>
        <Container className="mt-3">
          <Routes>
            <Route path="/product/:slug" element={<ProductScreen />} />
            <Route path="/cart" element={<CartScreen />} />
            <Route path="/signin" element={<SigninScreen />} />
            <Route path="/signup" element={<SignupScreen />} />
            <Route path="/shipping" element={<ShippingAdreessScreen />} />
            <Route path="/payment" element={<PaymentScreen />} />
            <Route path="/placeorder" element={<PlaceOrderScreen />} />
            <Route path="/" element={<HomeScreen />} />
            <Route path="/order/:id" element={
              <ProtectedRoute>
                <OrderScreen />
              </ProtectedRoute>
            } />
            <Route path="/orderhistory" element={
              <ProtectedRoute>
                <OrderHistoryScreen />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <ProfileScreen />
              </ProtectedRoute>} />
            <Route path="/map" element={
              <ProtectedRoute>
                <MapScreen />
              </ProtectedRoute>} />
            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={
              <AdminRoute>
                <DashboardScree />
              </AdminRoute>} />
            <Route path="/admin/products" element={
              <AdminRoute>
                <ProductListScreen />
              </AdminRoute>} />
            <Route path="/admin/product/:id" element={
              <AdminRoute>
                <ProductEditScreen />
              </AdminRoute>} />
            <Route path="/admin/orders" element={
              <AdminRoute>
                <OrderListScreen />
              </AdminRoute>} />
            <Route path="/admin/users" element={
              <AdminRoute>
                <UserListScreen />
              </AdminRoute>} />
            <Route path="/admin/user/:id" element={
              <AdminRoute>
                <UserEditScreen />
              </AdminRoute>} />
            <Route path="/search" element={<SearchScreen />} />
          </Routes>

        </Container>
      </main>
      <footer style={fullBox ? { display: 'none' } : null}>
        <div className="text-center ">All rights reserved</div>
      </footer>
    </div>
  );
}

export default App;
