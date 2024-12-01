import React, { useContext, useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import CheckoutSteps from '../components/CheckoutSteps'
import { Store } from '../Store'
import { useNavigate } from 'react-router-dom'
import { Button, Form } from 'react-bootstrap'

function PaymentScreen() {
    const navigate = useNavigate()
    const { state, dispatch: ctxDispatch } = useContext(Store)
    const {
        cart: { shippingAddress, paymentMethod }
    } = state

    const [paymentMethodName, setPaymentMethod] = useState(paymentMethod || 'Paypal')
    useEffect(() => {
        if (!shippingAddress.address) {
            navigate('/shipping')
        }

    }, [shippingAddress, navigate])

    const submitHandler = (e) => {
        e.preventDefault();
        ctxDispatch({ type: 'SAVE_PAYMENT_METHOD', payload: paymentMethodName })
        localStorage.setItem('paymentMethod', paymentMethodName)
        navigate('/placeorder')
    }
    return (
        <div>
            <Helmet>
                <title>Payment Method</title>
            </Helmet>
            <CheckoutSteps step1 step2 setp3></CheckoutSteps>
            <div className='container' style={{ maxWidth: "600px" }}>
                <h1>Payment Method</h1>
                <Form onSubmit={submitHandler}>
                    <div className='mb-3'>
                        <Form.Check
                            type='radio'
                            id='Paypal'
                            label='Paypal'
                            value='Paypal'
                            checked={paymentMethodName === 'Paypal'}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                        />
                    </div>
                    <div className='mb-3'>
                        <Form.Check
                            type='radio'
                            id='Stripe'
                            label='Stripe'
                            value='Stripe'
                            checked={paymentMethodName === 'Stripe'}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                        />
                    </div>
                    <div className='mb-3'>
                        <Button variant="warning" type="submit">Continue</Button>
                    </div>
                </Form>
            </div>

        </div>
    )
}

export default PaymentScreen
