import React, { useContext, useEffect, useState } from 'react'
import { Button, Form } from 'react-bootstrap'
import { Helmet } from 'react-helmet-async'
import { Store } from '../Store'
import { useNavigate } from 'react-router-dom'
import CheckoutSteps from '../components/CheckoutSteps'

export default function ShippingAdreessScreen() {
    const navigate = useNavigate();
    const { state, dispatch: ctxDispatch } = useContext(Store);
    const { fullBox, userInfo, cart: { shippingAddress } } = state;
    const [fullName, setFullName] = useState(shippingAddress.fullName || '')
    const [address, SetAddress] = useState(shippingAddress.address || '')
    const [city, setCity] = useState(shippingAddress.city || '')
    const [postalCode, setPostalCode] = useState(shippingAddress.postalCode || '')
    const [country, setCountry] = useState(shippingAddress.country || '')
    const submitHandler = async (e) => {
        e.preventDefault();
        ctxDispatch({
            type: "SAVE_SHIPPING_ADDRESS",
            payload: {
                fullName,
                address,
                city,
                postalCode,
                country,
                location: shippingAddress.location
            },
        });
        localStorage.setItem(
            'shippingAddress',
            JSON.stringify({
                fullName,
                address,
                city,
                postalCode,
                country,
                location: shippingAddress.location
            }));
        navigate('/payment');
    };
    useEffect(() => {
        if (!userInfo) {
            navigate('/signin?redirect=/shipping')
        }
    }, [userInfo, navigate])

    useEffect(() => {
        ctxDispatch({ type: 'SET_FULLBOX_OFF' })
    }, [ctxDispatch, fullBox])

    return (
        <div>
            <Helmet>
                <title>Shipping Address</title>
            </Helmet>
            <CheckoutSteps step1 step2></CheckoutSteps>
            <div className='container' style={{ maxWidth: "600px" }}>
                <h1>Shipping Address</h1>
                <Form onSubmit={submitHandler}>
                    <Form.Group className='mb3' controlId='fullName'>
                        <Form.Label>Full Name</Form.Label>
                        <Form.Control
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            required
                        ></Form.Control>
                    </Form.Group>
                    <Form.Group className='mb3' controlId='address'>
                        <Form.Label>Address</Form.Label>
                        <Form.Control
                            value={address}
                            onChange={(e) => SetAddress(e.target.value)}
                            required
                        ></Form.Control>
                    </Form.Group>
                    <Form.Group className='mb3' controlId='city'>
                        <Form.Label>City</Form.Label>
                        <Form.Control
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            required
                        ></Form.Control>
                    </Form.Group>
                    <Form.Group className='mb3' controlId='postalCode'>
                        <Form.Label>Postal Code</Form.Label>
                        <Form.Control
                            value={postalCode}
                            onChange={(e) => setPostalCode(e.target.value)}
                            required
                        ></Form.Control>
                    </Form.Group>
                    <Form.Group className='mb3' controlId='country'>
                        <Form.Label>Coutry</Form.Label>
                        <Form.Control
                            value={country}
                            onChange={(e) => setCountry(e.target.value)}
                            required
                        ></Form.Control>
                    </Form.Group>
                    <div className='mb-3 '>
                        <Button
                            id='chooseOnMap'
                            type='button'
                            variant='light'
                            onClick={() => navigate('/map')}
                        >
                            Choose Location on Map
                        </Button>
                        {shippingAddress.location && shippingAddress.location.lat ? (
                            <div>
                                LAT: {shippingAddress.location.lat}
                                LNG: {shippingAddress.location.lng}
                            </div>
                        ) : (
                            <div>No location</div>
                        )}
                    </div>
                    <div className='mb-3 mt-2 '>
                        <Button variant='warning' type='submit'>
                            Continue
                        </Button>
                    </div>
                </Form>
            </div>
        </div>
    )
}
