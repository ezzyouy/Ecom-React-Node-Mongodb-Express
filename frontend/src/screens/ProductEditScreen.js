import React, { useContext, useEffect, useReducer, useState } from 'react'
import { Store } from '../Store'
import { getError } from '../utils'
import axios from 'axios'
import { useNavigate, useParams } from 'react-router-dom'
import { Button, Container, Form, ListGroup } from 'react-bootstrap'
import { Helmet } from 'react-helmet-async'
import LoadingBox from '../components/LoadingBox'
import MessageBox from '../components/MessageBox'
import { toast } from 'react-toastify'

const smallContainer = {
    maxWith: "600px"
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
        case 'UPLOAD_REQUEST':
            return { ...state, loadingUpload: true, errorUpload: '' };
        case 'UPLOAD_SUCCESS':
            return { ...state, loadingUpload: false, errorUpload: '' };
        case 'UPLOAD_FAIL':
            return { ...state, loadingUpload: false, errorUpload: action.payloa };

        default:
            return state;
    };
};
function ProductEditScreen() {
    const navigate = useNavigate();

    const params = useParams();
    const { id: productId } = params;

    const { state } = useContext(Store);
    const { userInfo } = state;

    const [{ loading, error, loadingUpdate, loadingUpload }, dispatch] = useReducer(reducer, {
        loading: true,
        error: ''
    });

    const [name, setName] = useState('');
    const [slug, setSlug] = useState('');
    const [price, setPrice] = useState('');
    const [image, setImage] = useState('');
    const [images, setImages] = useState([]);
    const [category, setCategory] = useState('');
    const [countInStock, setCountInStock] = useState('');
    const [brand, setBrand] = useState('');
    const [description, setDescription] = useState('');
    console.log("images--->", images);
    
    useEffect(() => {
        const fetchData = async () => {
            try {
                dispatch({ type: 'FETCH_REQUEST' });
                const { data } = await axios.get(`/api/products/${productId}`)
                setName(data.name);
                setSlug(data.slug);
                setPrice(data.price);
                setCategory(data.category);
                setImage(data.image);
                setImages(data.images);
                setCountInStock(data.countInStock);
                setBrand(data.brand);
                setDescription(data.description);

                dispatch({ type: 'FETCH_SUCCESS' });

            } catch (error) {
                dispatch({ type: 'FETCH_FAIL', payload: getError(error) })
            }
        }
        fetchData()
    }, [productId]);

    const submitHandler = async (e) => {
        e.preventDefault();
        try {
            dispatch({ type: 'UPDATE_REQUEST' });
            await axios.put(`/api/products/${productId}`, {
                _id: productId,
                name,
                slug,
                price,
                image,
                images,
                category,
                brand,
                description,
                countInStock
            }, {
                headers: {
                    Authorization: `bearer ${userInfo.token}`
                }
            })
            dispatch({ type: 'UPDATE_SUCCESS' })
            toast.success('Product updated successfully');
            navigate('/admin/products')
        } catch (error) {
            toast.error(getError(error))
            dispatch({ type: 'UPDATE_FAIL' })
        }
    }
    const uploadFileHandler = async (e, forImages) => {

        const file = e.target.files[0];
        const bodyFormDate = new FormData();
        bodyFormDate.append('file', file);
        try {
            dispatch({ type: 'UPLOAD_REQUEST' })
            const { data } = await axios.post(`/api/upload`, bodyFormDate, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `bearer ${userInfo.token}`
                }
            })
            dispatch({ type: 'UPLOAD_SUCCESS' });
            if (forImages) {
                setImages([...images, data.secure_url]);
            } else {
                setImage(data.secure_url);
            }
            toast.success("Image uploaded successfully, click update to apply it");
        } catch (error) {
            toast.error(getError(error));
            dispatch({ type: 'UPLOAD_FAIL', payload: getError(error) });
        }
    }
    const deleteFileHandler = async (fileName) => {
        setImages(images.filter((x) => x === fileName));
        toast.success('Images removed successfully. click update to apply it')
    }
    return (
        <Container className=  {smallContainer}>
            <Helmet>
                <title>
                    Edit Product ${productId}
                </title>
            </Helmet>
            <h1>Edit Product ${productId}</h1>
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
                    <Form.Group className='mb-3' controlId='slug'>
                        <Form.Label>Slug</Form.Label>
                        <Form.Control
                            value={slug}
                            onChange={(e) => setSlug(e.target.value)}
                            required
                        />
                    </Form.Group>
                    <Form.Group className='mb-3' controlId='price'>
                        <Form.Label>Price</Form.Label>
                        <Form.Control
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            required
                        />
                    </Form.Group>
                    <Form.Group className='mb-3' controlId='image'>
                        <Form.Label>Image</Form.Label>
                        <Form.Control
                            value={image}
                            onChange={(e) => setImage(e.target.value)}
                            required
                        />
                    </Form.Group>
                    <Form.Group className='mb-3' controlId='imageFile'>
                        <Form.Label>Upload File</Form.Label>
                        <Form.Control
                            type='file'
                            onChange={uploadFileHandler}

                        />
                        {loadingUpload && <LoadingBox></LoadingBox>}
                    </Form.Group>
                    <Form.Group className='mb-3' controlId='additionalImage'>
                        <Form.Label>Additional Images</Form.Label>
                        {images.length === 0 && <MessageBox>No image</MessageBox>}
                        <ListGroup variant='flush'>
                            {console.log(images.length)}
                            {images.map((x) => (
                                <ListGroup.Item key={x}>
                                    {x}
                                    <Button variant='light' onClick={(x) => deleteFileHandler(x)}>
                                        <i className='fa fa-times-circle'></i>
                                    </Button>
                                </ListGroup.Item>
                            ))}
                        </ListGroup>
                    </Form.Group>
                    <Form.Group className='mb-3' controlId='additionalImageFile'>
                        <Form.Label>Upload Additional File</Form.Label>
                        <Form.Control
                            type='file'
                            onChange={(e) => uploadFileHandler(e, true)}

                        />
                        {loadingUpload && <LoadingBox></LoadingBox>}
                    </Form.Group>
                    <Form.Group className='mb-3' controlId='category'>
                        <Form.Label>Category</Form.Label>
                        <Form.Control
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            required
                        />
                    </Form.Group>
                    <Form.Group className='mb-3' controlId='brand'>
                        <Form.Label>Brand</Form.Label>
                        <Form.Control
                            value={brand}
                            onChange={(e) => setBrand(e.target.value)}
                            required
                        />
                    </Form.Group>
                    <Form.Group className='mb-3' controlId='countInStock'>
                        <Form.Label>Count In Stock</Form.Label>
                        <Form.Control
                            value={countInStock}
                            onChange={(e) => setCountInStock(e.target.value)}
                            required
                        />
                    </Form.Group>
                    <Form.Group className='mb-3' controlId='description'>
                        <Form.Label>Description</Form.Label>
                        <Form.Control
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                        />
                    </Form.Group>
                    <div>
                        <Button disabled={loadingUpdate} type='submit'>Update</Button>
                        {loadingUpdate && <LoadingBox />}
                    </div>
                </Form>
            )}
        </Container>
    )
}

export default ProductEditScreen
