import React, { useContext, useEffect, useReducer, useState } from 'react'
import LoadingBox from '../components/LoadingBox'
import MessageBox from '../components/MessageBox'
import { Store } from '../Store'
import { Link, useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'
import { getError } from '../utils'
import { Helmet } from 'react-helmet-async'
import { Button, Card, Col, ListGroup, Row } from 'react-bootstrap'
import { PayPalButtons, usePayPalScriptReducer } from '@paypal/react-paypal-js'
import { toast } from 'react-toastify'

const style = {
    normale: {
        backgroundColor: "#ffc000",
        color: "#000000",
    },
    hover: {
        backgroundColor: "#007bff",
        color: "#ffffff",
    }
}

const reducer = (state, action) => {
    switch (action.type) {
        case 'ORDER_FETCH_REQUEST':
            return { ...state, loading: true, error: '' };
        case 'ORDER_FETCH_SUCCESS':
            return { ...state, order: action.payload, loading: false, error: '' };
        case 'ORDER_FETCH_FAIL':
            return { ...state, error: action.payload, loading: false };
        case "PAY_REQUEST":
            return { ...state, loadingPay: true };
        case "PAY_SUCCESS":
            return { ...state, loadingPay: false, successPay: true };
        case "PAY_FAIL":
            return { ...state, loadingPay: false };
        case "PAY_RESET":
            return { ...state, loadingPay: false, successPay: false };
        case 'DELIVER_REQUEST':
            return { ...state, loadingDeliver: false };
        case 'DELIVER_SUCCESS':
            return { ...state, loadingDeliver: true, successDeliver: true };
        case 'DELIVER_FAIL':
            return { ...state, loadingDeliver: false, errorDeliver: action.payload };
        case 'DELIVER_RESET':
            return { ...state, loadingDeliver: false, successDeliver: false };
        default:
            return state;
    }
}
export default function OrderScreen() {
    /* style */
    const [hover, setHover] = useState(false)
     /* end style */

    const navigate = useNavigate()

    const { state } = useContext(Store)
    const { userInfo, } = state;

    const params = useParams();
    const { id: orderId } = params;

    const [{ loading, error, order, successPay, loadingPay, loadingDeliver, successDeliver, errorDeliver }, dispatch] = useReducer(reducer, {
        loading: true,
        error: '',
        order: {},
        successPay: false,
        loadingPay: false

    })
    const [{ isPending }, paypalDispatch] = usePayPalScriptReducer()

    //#################PayPal############################

    function createOrder(data, actions) {
        return actions.order.create({
            purchase_units: [
                {
                    amount: {
                        value: order.totalPrice
                    }
                }
            ]
        })
            .then((orderID) => {
                return orderID;
            })
    }
    function onApprove(data, actions) {
        return actions.order
            .capture()
            .then(async function (details) {
                try {
                    dispatch({ type: 'PAY_REQUEST' });
                    const { data } = await axios.put(`/api/orders/${order._id}/pay`, details, {
                        headers: { Authorization: `Bearer ${userInfo.token}` }
                    })
                    dispatch({ type: 'PAY_SUCCESS', payload: data });
                    toast.success('Order is paid')
                } catch (error) {
                    dispatch({ type: 'PAY_FAIL', payload: getError(error) });
                    toast.error(getError(error));
                }
            })
    }
    function onError(error) {
        toast.error(getError(error));
    }
    //#################PayPal############################
    useEffect(() => {

        const fetchOrder = async () => {
            try {
                dispatch({ type: 'ORDER_FETCH_REQUEST' })
                const { data } = await axios.get(`/api/orders/${orderId}`, {
                    headers: {
                        Authorization: `Bearer ${userInfo.token}`
                    }
                });

                dispatch({ type: 'ORDER_FETCH_SUCCESS', payload: data })
            } catch (err) {
                dispatch({ type: 'ORDER_FETCH_FAIL', payload: getError(err) })

            }
        }

        if (!userInfo) {
            return navigate('/login')
        }
        if (
            !order._id || successPay || successDeliver ||
            (order._id && order._id !== orderId)
        ) {
            fetchOrder()
            if (successPay) {
                dispatch({ type: 'PAY_RESET', })
            }
            if (successDeliver) {
                dispatch({ type: 'DELIVER_RESET', })
            }
        } else {
            const loadPaypalScript = async () => {
                const { data: clientId } = await axios.get('/api/keys/paypal', {
                    headers: {
                        Authorization: `bearer ${userInfo.token}`
                    }
                });
                paypalDispatch({
                    type: 'resetOptions',
                    value: {
                        'clientId': clientId,
                        currency: 'USD'
                    }
                });
                paypalDispatch({
                    type: 'setLoadingStatus',
                    value: 'pending'
                });
            }
            loadPaypalScript();
        }

    }, [order, orderId, userInfo, navigate, paypalDispatch, successPay, successDeliver])

    const deliverOrderHandler = async () => {
        try {
            dispatch({ type: 'DELIVER_REQUEST' })
            const { data } = await axios.put(`/api/orders/${order._id}/deliver`,
                {},
                {
                    headers: {
                        Authorization: `bearer ${userInfo.token}`
                    }
                })
            dispatch({ type: 'DELIVER_SUCCESS', payload: data })
            toast.success('Order is delivered')
        } catch (error) {
            toast.error(getError(error))
            dispatch({ type: 'DELIVER_FAIL', payload: getError(error) })
        }
    }
    return (
        <>
            {loading ? (
                <LoadingBox></LoadingBox>
            ) : error ? (
                <MessageBox variant="danger">{error}</MessageBox>
            ) : (
                <div>
                    <Helmet>
                        <title>Order {orderId}</title>
                    </Helmet>
                    <h1 className='mb-3'>Order {orderId}</h1>
                    <Row>
                        <Col md={8}>
                            <Card className="mb-3">
                                <Card.Body>
                                    <Card.Title>Shipping</Card.Title>
                                    <Card.Text>
                                        <strong>Name : </strong>{order.shippingAddress.fullName} <br />
                                        <strong>Address : </strong> {order.shippingAddress.address},
                                        {order.shippingAddress.city}, {order.shippingAddress.postalCode},
                                        {order.shippingAddress.country}
                                    </Card.Text>
                                    {order.isDelivered ? (
                                        <MessageBox variant="success">
                                            Delivered at {order.deliveredAt}
                                        </MessageBox>
                                    ) : (
                                        <MessageBox variant="danger">Not Delivered</MessageBox>
                                    )}
                                </Card.Body>
                            </Card>
                            <Card className='mb-3'>
                                <Card.Body>
                                    <Card.Title>Payment</Card.Title>
                                    <Card.Text>
                                        <strong>Method : </strong>{order.paymentMethod}
                                    </Card.Text>
                                    {order.isPaid ? (
                                        <MessageBox variant="success">
                                            Paid at {order.paidAt}
                                        </MessageBox>
                                    ) : (
                                        <MessageBox variant="danger">Not Paid</MessageBox>
                                    )}
                                </Card.Body>
                            </Card>
                            <Card className='mb-3'>
                                <Card.Body>
                                    <Card.Title>Items</Card.Title>
                                    <ListGroup variant='flush'>
                                        {order.orderItems.map((item) => (
                                            <ListGroup.Item key={item._id}>
                                                <Row className="align-items-center">
                                                    <Col md={6}>
                                                        <img
                                                            src={item.image}
                                                            alt={item.name}
                                                            className='img-fluid rounded'
                                                            style={{ height: "80px" }}
                                                        />{' '}
                                                        <Link to={`/product/${item.slug}`}>  {item.name}</Link>
                                                    </Col>
                                                    <Col md={3}>
                                                        <span>{item.quantity}</span>
                                                    </Col>
                                                    <Col md={3}>${item.price}</Col>
                                                </Row>
                                            </ListGroup.Item>
                                        ))}
                                    </ListGroup>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={4}>
                            <Card className='mb-3'>
                                <Card.Body>
                                    <Card.Title>Order Summary</Card.Title>
                                    <ListGroup variant='flush'>
                                        <ListGroup.Item>
                                            <Row>
                                                <Col>Items</Col>
                                                <Col>${order.itemsPrice.toFixed(2)}</Col>
                                            </Row>
                                        </ListGroup.Item>
                                        <ListGroup.Item>
                                            <Row>
                                                <Col>Shipping</Col>
                                                <Col>${order.shippingPrice.toFixed(2)}</Col>
                                            </Row>
                                        </ListGroup.Item>
                                        <ListGroup.Item>
                                            <Row>
                                                <Col>Tax</Col>
                                                <Col>${order.taxPrice.toFixed(2)}</Col>
                                            </Row>
                                        </ListGroup.Item>
                                        <ListGroup.Item>
                                            <Row>
                                                <Col>
                                                    <strong>Order Total</strong>
                                                </Col>
                                                <Col>
                                                    <strong>${order.totalPrice.toFixed(2)}</strong>
                                                </Col>
                                            </Row>
                                        </ListGroup.Item>
                                        {!order.isPaid && (
                                            <ListGroup.Item>
                                                {isPending ? (
                                                    <>
                                                        <LoadingBox />
                                                    </>
                                                ) : (
                                                    <div>
                                                        <PayPalButtons
                                                            createOrder={createOrder}
                                                            onApprove={onApprove}
                                                            onError={onError}
                                                        ></PayPalButtons>
                                                    </div>

                                                )}
                                                {
                                                    loadingPay && <LoadingBox></LoadingBox>
                                                }
                                            </ListGroup.Item>
                                        )}
                                        {userInfo.isAdmin && order.isPaid && !order.isDelivred && (
                                            <ListGroup.Item>
                                                {loadingDeliver && <LoadingBox></LoadingBox>}
                                                <div className='d-grid'>
                                                    <Button
                                                        type='button'
                                                        onMouseEnter={()=>{
                                                            setHover(true);
                                                          }}
                                                          onMouseLeave={()=>{
                                                            setHover(false);
                                                          }}
                                                          style={{
                                                            ...style.normale,
                                                            ...(hover ? style.hover : null)
                                                          }}
                                                        
                                                        onClick={deliverOrderHandler}>
                                                        Deliver Order
                                                    </Button>
                                                </div>
                                            </ListGroup.Item>
                                        )}
                                    </ListGroup>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </div>
            )}
        </>
    )
}
