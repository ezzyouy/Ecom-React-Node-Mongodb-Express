import React, { useContext, useReducer, useState } from 'react'
import { Store } from '../Store'
import { Button, Form } from 'react-bootstrap';
import { Helmet } from 'react-helmet-async';
import { toast } from 'react-toastify';
import { getError } from '../utils';
import axios from 'axios';

const reducer = (state, action) => {
    switch (action.type) {
        case 'UPDATE_REQUEST':
            return { ...state, loadingUpdate: true }
        case 'UPDATE_SUCCESS':
            return { ...state, loadingUpdate: false }
        case 'UPDATE_FAIL':
            return { ...state, loadingUpdate: false }
        default:
            return state;
    }
}
export default function ProfileScreen() {
    const { state, dispatch: ctxDispatch } = useContext(Store)
    const { userInfo } = state;
    //-------Reducer------
    const [{ loadingUpdate }, disptach] = useReducer(reducer, {
        loadingUpdate: false
    })
    //----useState--------
    const [name, setName] = useState(userInfo.name)
    const [email, setEmail] = useState(userInfo.email)
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    //--------------------

    const submitHandler = async (e) => {
        e.preventDefault();
        try {
            disptach({ type: 'UPDATE_REQUEST' })
            const { data } = await axios.put(`/api/users/profile`,
                {
                    name,
                    email,
                    password
                },
                {
                    headers: {
                        Authorization: `bearer ${userInfo.token}`
                    }
                }
            )
            disptach({ type: 'UPDATE_SUCCESS' });
            ctxDispatch({ type: 'USER_SIGNIN', payload: data })
            localStorage.setItem('userInfo', JSON.stringify(data));
            toast.success('User updated successfully')

        } catch (error) {
            disptach({ type: 'UPDATE_FAIL' })
            toast.error(getError(error))
        }

    }
    return (
        <div className='container' style={{ maxWidth: "600px" }} >
            <Helmet>
                <title>Profile</title>
            </Helmet>
            <h1>Profile</h1>
            <form onSubmit={submitHandler}>
                <Form.Group className='mb-3' controlId='name'>
                    <Form.Label>Name</Form.Label>
                    <Form.Control
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </Form.Group>
                <Form.Group className='mb-3' controlId='email'>
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                        type='email'
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </Form.Group>
                <Form.Group className='mb-3' controlId='password'>
                    <Form.Label>Password</Form.Label>
                    <Form.Control
                        type='password'
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </Form.Group>
                <Form.Group className='mb-3' controlId='confirmPassword'>
                    <Form.Label>Confirm Password</Form.Label>
                    <Form.Control
                        type='password'
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />
                </Form.Group>
                <div className='mb-3'>
                    <Button type='submit'>Update</Button>
                </div>
            </form>
        </div>
    )
}
