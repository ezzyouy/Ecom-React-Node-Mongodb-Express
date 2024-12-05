import React, { useContext, useEffect, useId, useReducer, useState } from 'react'
import { Store } from '../Store';
import { toast } from 'react-toastify';
import { getError } from '../utils';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Container, Form } from 'react-bootstrap';
import { Helmet } from 'react-helmet-async';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';

const style = {
    normale: {
        backgroundColor: "#ffc000",
        color: "#000000"
    },
    hover: {
        backgroundColor: "#007bff",
        color: "#ffffff"
    }
}
const reducer = (state, action) => {
    switch (action.type) {
        case 'FETCH_REQUEST':
            return { ...state, loading: true };
        case 'FETCH_SUCCESS':
            return { ...state, loading: false };
        case 'FETCH_FAIL':
            return { ...state, loading: false, error: action.payload };
        case 'UPDATE_REQUEST':
            return { ...state, loadingUpdate: true };
        case 'UPDATE_SUCCESS':
            return { ...state, loadingUpdate: false };
        case 'UPDATE_FAIL':
            return { ...state, loadingUpdate: false };
        default:
            return state;
    }
};

function UserEditScreen() {
    const [{ loading, error, loadingUpdate }, dispatch] = useReducer(reducer, {
        loading: true,
        error: ''
    })

    const { state } = useContext(Store);
    const { userInfo } = state;

    const params = useParams();
    const { id: userId } = params;

    const navigate = useNavigate();

    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [isAdmin, setIsAdmin] = useState(false)
    /* --------- start style -------- */
    const [hover, setHover] = useState(false)
    /* --------- end style -------- */
    useEffect(() => {
        const fetchData = async () => {
            try {
                dispatch({ type: 'FETCH_REQUEST' })
                const { data } = await axios.get(`/api/users/${userId}`, {
                    headers: {
                        Authorization: `bearer ${userInfo.token}`
                    }
                })
                setName(data.name);
                setEmail(data.email);
                setIsAdmin(data.isAdmin);
                dispatch({ type: 'FETCH_SUCCESS' })

            } catch (error) {

                dispatch({ type: 'FETCH_FAIL', payload: getError(error) })
            }
        }
        fetchData();

    }, [userInfo, userId])

    const submitHandler = async (e) => {
        e.preventDefault();
        try {
            dispatch({ type: 'UPDATE_REQUEST' })
            await axios.put(`/api/users/${userId}`, {
                _id: userId, name, email, isAdmin
            }, {
                headers: {
                    Authorization: `bearer ${userInfo.token}`
                }
            })
            dispatch({ type: 'UPDATE_SUCCESS' });
            toast.success('User is updated successfully');
            navigate('/admin/users');
        } catch (error) {
            toast.error(getError(error))
            dispatch({ type: 'UPDATE_FAIL' })
        }

    }

    return (
        <Container style={{ maxWidth: "600px" }}>
            <Helmet>
                <title>
                    Edit User ${userId}
                </title>
            </Helmet>
            <h1>Edit User ${userId}</h1>
            {loading ? (
                <LoadingBox></LoadingBox>
            ) : error ? (
                <MessageBox variant="danger">{error}</MessageBox>
            ) : (
                <Form onSubmit={submitHandler}>
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
                            value={email}
                            type="email"
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </Form.Group>
                    <Form.Check
                        className='mb-3'
                        id='isAdmin'
                        type='checkbox'
                        value={isAdmin}
                        onChange={(e) => setIsAdmin(e.target.value)}
                    />
                    <div>
                        <Button
                            onMouseEnter={() => setHover(true)}
                            onMouseLeave={() => setHover(false)}
                            style={{
                                ...style.normale,
                                ...(hover ? style.hover : null)
                            }}
                            disabled={loadingUpdate}
                            type='submit'>Update</Button>
                        {loadingUpdate && <LoadingBox />}
                    </div>
                </Form>
            )}
        </Container>
    )
}

export default UserEditScreen
