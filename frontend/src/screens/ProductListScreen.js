import React, { useContext, useEffect, useReducer } from 'react'
import { Store } from '../Store';
import { getError } from '../utils';
import axios from 'axios';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import { Button, Col, Row } from 'react-bootstrap';
import { toast } from 'react-toastify';

const style = {
    backgroundColor: "#ffc000",
    color: "#000000"
}
const reducer = (state, action) => {
    switch (action.type) {
        case 'FETCH_REQUEST':
            return { ...state, loading: true };
        case 'FETCH_SUCCESS':
            return {
                ...state,
                loading: false,
                products: action.payload.products,
                page: action.payload.page,
                pages: action.payload.pages,
            };
        case 'FETCH_FAIL':
            return { ...state, loading: false, error: action.payload };
        case 'CREATE_REQUEST':
            return { ...state, loadingCreate: true }
        case 'CREATE_SUCCESS':
            return { ...state, loadingCreate: false }
        case 'CREATE_FAIL':
            return { ...state, loadingCreate: false }
        case 'DELETE_REQUEST':
            return { ...state, loadingDelete: true, successDelete: false }
        case 'DELETE_SUCCESS':
            return { ...state, loadingDelete: false, successDelete:true }
        case 'DELETE_FAIL':
            return { ...state, loadingDelete: false, successDelete: false }
            case 'DELETE_RESET':
                return { ...state, loadingDelete: false, successDelete: false }  
        default:
            return state;
    }
}
function ProductListScreen() {

    const navigate = useNavigate();

    const { search, pathname } = useLocation();
    const sp = new URLSearchParams(search);

    const page = sp.get('page') || 1;

    const { state } = useContext(Store);
    const { userInfo } = state;

    const [{ loading, error, products, pages, loadingCreate, loadingDelete, successDelete }, dispatch] = useReducer(reducer, {
        loading: true,
        error: ''
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                dispatch({ type: 'FETCH_REQUEST' })
                const { data } = await axios.get(`/api/products/admin?page=${page}`, {
                    headers: {
                        Authorization: `bearer ${userInfo.token}`
                    }
                })
                dispatch({ type: 'FETCH_SUCCESS', payload: data })
            } catch (error) {
                dispatch({ type: 'FETCH_FAIL', payload: getError(error) })
            }
        }
        
        if(successDelete){
            dispatch({ type: 'DELETE_RESET' })
        }else{
            fetchData();
        }
    }, [page, userInfo, successDelete]);

    const createdHandler = async () => {
        if (window.confirm("Are you sure to create?")) {
            try {
                dispatch({ type: "CREATE_REQUEST" });
                const { data } = await axios.post(`/api/products`, {}, {
                    headers: {
                        Authorization: `bearer ${userInfo.token}`
                    }
                });
                toast.success('product created successfully');
                dispatch({ type: "CREATE_SUCCESS" });
                navigate(`/admin/product/${data.product._id}`)
            } catch (error) {
                dispatch({ type: "CREATE_FAIL", });
                toast.error(getError(error));
            }
        }
    };
    const deleteHandler = async (product) => {
        if (window.confirm("Are you sure to delete")) {
            try {
                dispatch({ type: "DELETE_REQUEST" });
                await axios.delete(`/api/products/${product._id}`, {
                    headers: {
                        Authorization: `bearer ${userInfo.token}`
                    }
                });
                dispatch({ type: "DELETE_SUCCESS" });
                toast.success('The Product Deleted')
                //navigate('/admin/products')

            } catch (error) {
                dispatch({ type: "DELETE_FAIL" });
            }
        }

    }
    return (
        <div>
            <Helmet>
                <title>Products</title>
            </Helmet>
            <Row>
                <Col>
                    <h1>Products</h1>
                </Col>
                <Col className="col text-end">
                    <div>
                        <Button type='button' onClick={createdHandler} style={style}>
                            Create Product
                        </Button>
                    </div>
                </Col>
            </Row>

            {loadingCreate && <LoadingBox></LoadingBox>}
            {loadingDelete && <LoadingBox></LoadingBox>}

            {loading ? (
                <LoadingBox />
            ) : error ? (
                <MessageBox variant="danger">{error}</MessageBox>
            ) : (
                <>
                    <table className='table'>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>NAME</th>
                                <th>PRICE</th>
                                <th>CATEGORY</th>
                                <th>BRAND</th>
                                <th>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map((product) => (
                                <tr key={product._id}>
                                    <td>{product._id}</td>
                                    <td>{product.name}</td>
                                    <td>{product.price}</td>
                                    <td>{product.category}</td>
                                    <td>{product.brand}</td>
                                    <td>
                                        <Button
                                            type='button'
                                            variant='light'
                                            onClick={() => navigate(`/admin/product/${product._id}`)}
                                        >
                                            Edit
                                        </Button>{'  '}
                                        <Button
                                            type='button'
                                            variant='light'
                                            onClick={() => deleteHandler(product)}
                                        >
                                            Delete
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div>
                        {[...Array(pages).keys()].map((x) => (
                            <Link
                                className={x + 1 === Number(page) ? "btn text-bold" : "btn"}
                                key={x + 1}
                                to={`/admin/products?page=${x + 1}`}
                            >
                                {x + 1}
                            </Link>
                        ))}
                    </div>
                </>
            )}
        </div>
    )
}

export default ProductListScreen
