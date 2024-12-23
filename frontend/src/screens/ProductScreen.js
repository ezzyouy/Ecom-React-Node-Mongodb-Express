import axios from 'axios'
import React, { useContext, useEffect, useReducer, useRef, useState } from 'react'
import { Badge, Button, Card, Col, FloatingLabel, Form, ListGroup, Row } from 'react-bootstrap'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Rating from '../components/Rating'
import { Helmet } from 'react-helmet-async'
import LoadingBox from '../components/LoadingBox'
import MessageBox from '../components/MessageBox'
import { getError } from '../utils'
import { Store } from '../Store'
import { toast } from 'react-toastify'

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
            return { ...state, loading: true }
        case 'FETCH_SUCCESS':
            return { ...state, product: action.payload, loading: false }
        case 'FETCH_FAIL':
            return { ...state, loading: false, error: action.payload }
        case 'REFRESH_PRODUCT':
            return { ...state, product: action.payload }
        case 'CREATE_REQUEST':
            return { ...state, loadingCreateReview: true }
        case 'CREATE_SUCCESS':
            return { ...state, loadingCreateReview: false }
        case 'CREATE_FAIL':
            return { ...state, loadingCreateReview: false }
        default:
            return state;
    }
}
function ProductScreen() {

    const [rating, setRating] = useState(0)
    const [comment, setComment] = useState('')
    const [hover, setHover] = useState(false)
    const [selectedImages, setSelectedImages] = useState([])

    let reviewsRef = useRef()

    const navigate = useNavigate()
    const params = useParams();
    const { slug } = params;
    const [{ loading, error, product, loadingCreateReview }, dispatch] = useReducer(reducer, {
        product: [],
        loading: true,
        error: ''
    })
    //const [products, setProducts] = useState([]);
    useEffect(() => {
        const fetchData = async () => {
            dispatch({ type: 'FETCH_REQUEST' })
            try {
                const result = await axios.get(`/api/products/slug/${slug}`)
                setSelectedImages(result.data?.image);
                dispatch({ type: 'FETCH_SUCCESS', payload: result.data })
            } catch (error) {
                dispatch({ type: 'FETCH_FAIL', payload: getError(error) })
            }

        };
        fetchData();
    }, [slug,])
    const { state, dispatch: ctxDispatch } = useContext(Store);
    const { cart, userInfo } = state;

    const addToCartHandler = async () => {
        const existItem = cart.cartItems.find((x) => x._id === product._id);
        const quantity = existItem ? existItem.quantity + 1 : 1;
        const { data } = await axios.get(`/api/products/${product._id}`)
        if (data.countInStock < quantity) {
            window.alert('Sorry. Product is out of stock');
            return;
        }
        ctxDispatch({
            type: 'CART_ADD_ITEM',
            payload: { ...product, quantity }
        })
        navigate('/cart');
    }
    const submitHandler = async (e) => {
        e.preventDefault();
        if (!comment || !rating) {
            toast.error('Please enter commnet and rating');
            return;
        }
        try {
            dispatch({ type: 'CREATE_REQUEST' })
            const { data } = await axios.post(
                `/api/products/${product._id}/reviews`,
                { rating, comment, name: userInfo.name },
                {
                    headers: { Authorization: `bearer ${userInfo.token}` }
                }
            )
            dispatch({ type: 'CREATE_SUCCESS' });
            toast.success('Review submitted successfully');
            product.reviews.unshift(data.review);
            product.numReviews = data.numReviews;
            product.rating = data.rating;
            setComment('');
            setRating(0)
            dispatch({ type: 'REFRESH_PRODUCT', payload: product })
            window.scrollTo({
                behavior: 'smooth',
                top: reviewsRef.current.offsetTop
            })
        } catch (error) {
            toast.error(getError(error));
            dispatch({ type: 'CREATE_FAIL' })
        }
    }
    return (
        <div>
            {loading ? (
                <LoadingBox />
            ) : error ? (
                <MessageBox variant="danger">{error}</MessageBox>
            ) : (
                <div>
                    <Row>
                        <Col md={6}>
                        {console.log(product)}
                            <img
                                className='img-large'
                                src={selectedImages /* || product?.image */}
                                alt={product?.slig}
                            />
                        </Col>
                        <Col md={3}>
                            <ListGroup variant='flush'>
                                <ListGroup.Item>
                                    <Helmet>
                                        <title>{product?.name}</title>
                                    </Helmet>
                                </ListGroup.Item>
                                <ListGroup.Item>
                                    <Rating
                                        rating={product?.rating}
                                        numReviews={product?.numReviews}
                                    />
                                </ListGroup.Item>
                                <ListGroup.Item>
                                    Price : ${product?.price}
                                </ListGroup.Item>
                                <ListGroup.Item>
                                    <Row xs={1} md={2} className='g-2'>
                                        {
                                            [product?.image, ...product.images].map((x) => (
                                                <Col key={x}>
                                                    <Card>
                                                        <Button
                                                            className='thumbnail'
                                                            type='button'
                                                            variant='light'
                                                            onClick={() => setSelectedImages(x)}
                                                        >
                                                            <Card.Img
                                                                variant='top' src={x} alt='product' />
                                                        </Button>
                                                    </Card>
                                                </Col>
                                            ))
                                        }
                                    </Row>
                                </ListGroup.Item>
                                <ListGroup.Item>
                                    Description:
                                    <p>{product?.description}</p>
                                </ListGroup.Item>
                            </ListGroup>
                        </Col>
                        <Col md={3}>
                            <Card>
                                <Card.Body>
                                    <ListGroup variant='flush'>
                                        <ListGroup.Item>
                                            <Row>
                                                <Col>Price : </Col>
                                                <Col>${product?.price} </Col>
                                            </Row>
                                        </ListGroup.Item>
                                        <ListGroup.Item>
                                            <Row>
                                                <Col>Status : </Col>
                                                <Col>
                                                    {product?.countInStock > 0 ?
                                                        <Badge bg='success'>In Stock</Badge>
                                                        :
                                                        <Badge bg='danger'>Unavailable</Badge>}
                                                </Col>
                                            </Row>
                                        </ListGroup.Item>
                                        {product.countInStock > 0 && (
                                            <ListGroup.Item>
                                                <div className='d-grid'>
                                                    <Button
                                                        onMouseEnter={() => setHover(true)}
                                                        onMouseLeave={() => setHover(false)}
                                                        style={{ ...style.normale, ...(hover ? style.hover : null) }}
                                                        onClick={addToCartHandler}
                                                        variant='warning'>
                                                        Add to Cart
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
            <div className='my-3'>
                <h2 ref={reviewsRef}>Reviews</h2>
                {product.reviews?.length === 0 && (
                    <MessageBox>There is no review</MessageBox>
                )}
            </div>
            <ListGroup>
                {product.reviews?.map((review) => (
                    <ListGroup.Item key={review?._id}>
                        <strong>{review?.name}</strong>
                        <Rating rating={review?.rating} caption=" "></Rating>
                        <p>{review?.createdAt?.substring(0, 10)}</p>
                        <p>{review?.comment}</p>
                    </ListGroup.Item>
                ))}
            </ListGroup>
            <div className='my-3'>
                {userInfo && userInfo.length !== 0 ? (
                    <form onSubmit={submitHandler}>
                        <h2>Write a customer review</h2>
                        <Form.Group className='mb-3' controlId='rating'>
                            <Form.Label>Rating</Form.Label>
                            <Form.Select
                                aria-label='Rating'
                                value={rating}
                                onChange={(e) => setRating(e.target.value)}
                            >
                                <option value="">Select...</option>
                                <option value="1">1- Poor</option>
                                <option value="2">2- Fair</option>
                                <option value="3">3- Good</option>
                                <option value="4">4- Very good</option>
                                <option value="5">5- Excelent</option>
                            </Form.Select>
                        </Form.Group>
                        <FloatingLabel
                            controlId='floatingTextarea'
                            label="Comment"
                            className='mb-3'
                        >
                            <Form.Control
                                as="textarea"
                                placeholder='Leave a comment here'
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                            />
                        </FloatingLabel>
                        <div className='mb-3'>
                            <Button
                                onMouseEnter={() => setHover(true)}
                                onMouseLeave={() => setHover(false)}
                                style={{ ...style.normale, ...(hover ? style.hover : null) }}
                                disabled={loadingCreateReview}
                                type='submit'>
                                Submit
                            </Button>
                            {loadingCreateReview && <LoadingBox></LoadingBox>}
                        </div>
                    </form>
                ) : (
                    <MessageBox>
                        Please <Link to={`/signin?redirect=/product/${product.slug}`}>Sign In</Link> to write a review
                    </MessageBox>
                )}
            </div>
        </div>
    )
}

export default ProductScreen
