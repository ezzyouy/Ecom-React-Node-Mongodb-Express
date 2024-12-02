import React, { useContext, useEffect, useReducer } from 'react'
import { Helmet } from 'react-helmet-async'
import { Store } from '../Store'
import { getError } from '../utils'
import axios from 'axios'
import LoadingBox from '../components/LoadingBox'
import MessageBox from '../components/MessageBox'
import { Card, Col, Row } from 'react-bootstrap'
import { Chart } from "react-google-charts";

const reducer = (state, action) => {
    switch (action.type) {
        case 'FETCH_REQUEST':
            return { ...state, loading: true }
        case 'FETCH_SUCCESS':
            return { ...state, loading: false, summary: action.payload }
        case 'FETCH_FAIL':
            return { ...state, loading: false, error: action.payload }

        default:
            return state;
    }
}
function DashboardScree() {
    const { state } = useContext(Store)
    const { userInfo } = state;
    const [{ loading, error, summary }, dispatch] = useReducer(reducer, {
        loading: true,
        error: ''
    })

    useEffect(() => {
        const fetchData = async () => {
            dispatch({ type: 'FETCH_REQUEST' });
            try {
                const { data } = await axios.get(`/api/orders/summary`, {
                    headers: {
                        Authorization: `bearer ${userInfo.token}`
                    }
                });
                dispatch({ type: 'FETCH_SUCCESS', payload: data });
            } catch (error) {
                dispatch({ type: 'FETCH_FAIL', payload: getError(error) });
            }
        }
        fetchData();
    }, [userInfo])

    return (
        <div>
            <Helmet>
                <title>Dashborad</title>
            </Helmet>
            <h1>Dashboard</h1>
            {loading ? (
                <LoadingBox></LoadingBox>
            ) : error ? (
                <MessageBox variant="danger">{error}</MessageBox>
            ) : (
                <>
                    <Row>
                        <Col md={4}>
                            <Card>
                                <Card.Body>
                                    <Card.Title>{summary.users && summary.users[0] ? summary.users[0].numUsers : 0}</Card.Title>
                                    <Card.Text>Users</Card.Text>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={4}>
                            <Card>
                                <Card.Body>
                                    <Card.Title>{summary.orders && summary.orders[0] ? summary.orders[0].numOrders : 0}</Card.Title>
                                    <Card.Text>Orders</Card.Text>
                                </Card.Body>
                            </Card></Col>
                        <Col md={4}>
                            <Card>
                                <Card.Body>
                                    <Card.Title>${summary.orders && summary.users[0] ? summary.orders[0].totalSales?.toFixed(2) : 0}</Card.Title>
                                    <Card.Text>Orders</Card.Text>
                                </Card.Body>
                            </Card></Col>
                    </Row>
                    <div className='my-3'>
                        <h2>Sales</h2>
                        {console.log(summary.dailyOrders)}
                        {summary.dailyOrders.length === 0 ? (
                            <MessageBox>No Sale</MessageBox>
                        ) : (
                            <Chart
                                width="100%"
                                height="400px"
                                chartType="AreaChart"
                                loader={<div>loading Chart....</div>}
                                data={[['Date', 'Sales'], ...summary.dailyOrders.map((x) => [x._id, x.sales])]}
                            >

                            </Chart>
                        )}
                    </div>
                </>
            )}
        </div>
    )
}

export default DashboardScree
