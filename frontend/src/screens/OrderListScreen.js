import React, { useContext, useEffect, useReducer } from 'react'
import { Store } from '../Store'
import axios from 'axios';
import { getError } from '../utils';
import { Helmet } from 'react-helmet-async';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import { Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const reducer = (state, action) => {
    switch (action.type) {
        case 'FETCH_REQUEST':
            return { ...state, loading: true }
        case 'FETCH_SUCCESS':
            return { ...state, loading: false, orders: action.payload }
        case 'FETCH_FAIL':
            return { ...state, loading: false, error: action.payload }
        case "DELETE_REQUEST":
            return { ...state, loadingDelete: true, successDelete: false }
        case "DELETE_SUCCESS":
            return { ...state, loadingDelete: false, successDelete: true }
        case "DELETE_FAIL":
            return { ...state, loadingDelete: false }
        case "DELETE_RESET":
            return { ...state, loadingDelete: false, successDelete: false }
        default:
            return state;
    }
}
function OrderListScreen() {

    const navigate = useNavigate();

    const [{ loading, error, orders, loadingDelete, successDelete }, dispatch] = useReducer(reducer, {
        loading: true,
        error: '',
        orders: []
    })
    const { state } = useContext(Store)
    const { userInfo } = state;

    useEffect(() => {
        const fetchData = async () => {
            try {
                dispatch({ type: "FETCH_REQUEST" })
                const { data } = await axios.get(`/api/orders`, {
                    headers: {
                        Authorization: `bearer ${userInfo.token}`
                    }
                })
                dispatch({ type: "FETCH_SUCCESS", payload: data })
            } catch (error) {
                dispatch({ type: "FETCH_FAIL", payload: getError(error) })
            }
        }
        if (successDelete) {
            dispatch({ type: "DELETE_RESET"})
        } else {
            fetchData();
        }
    }, [userInfo, successDelete])
    const deleteHandler = async (order) => {
        if(window.confirm("Are you sure to delete")){
        try {
            dispatch({ type: "DELETE_REQUEST" });
            await axios.delete(`/api/orders/${order._id}`, {
                headers: {
                    Authorization: `bearer ${userInfo.token}`
                }
            });
            dispatch({ type: "DELETE_SUCCESS" });
            toast.success("Order deleted successfully");
        } catch (error) {
            toast.error(getError(error));
            dispatch({ type: "DELETE_FAIL" });
        }
    }};
    return (
        <div>
            <Helmet>
                <title>Orders</title>
            </Helmet>
            <h1>Orders</h1>
            {loadingDelete && <LoadingBox></LoadingBox>}
            {loading ? (
                <LoadingBox></LoadingBox>
            ) : error ? (
                <MessageBox variant="danger">{error}</MessageBox>
            ) : (
                <table className='table'>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>USER</th>
                            <th>DATE</th>
                            <th>TOTAL</th>
                            <th>PAID</th>
                            <th>DELIVERED</th>
                            <th>ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map((order) => (
                            <tr key={order._id}>
                                <td>{order._id}</td>
                                <td>{order.user ? order.user.name : "DELETED USER"}</td>
                                <td>{order.createdAT?.substring(0, 10)}</td>
                                <td>{order.totalPrice.toFixed(2)}</td>
                                <td>{order.isPaid ? order.paidAt?.substring(0, 10) : 'No'}</td>
                                <td>{order.isDelivered
                                    ? order.delivredAt?.substring(0, 10)
                                    : 'No'
                                }</td>
                                <td>
                                    <Button
                                        type='button'
                                        variant='light'
                                        onClick={() => navigate(`/order/${order._id}`)}
                                    >
                                        Details
                                    </Button>{' '}
                                    <Button
                                        type='button'
                                        variant='light'
                                        onClick={() => deleteHandler(order)}
                                        >
                                            Delete
                                        </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    )
}

export default OrderListScreen
