import React, { useContext, useState } from 'react'
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import { Link } from 'react-router-dom';
import Rating from './Rating';
import axios from 'axios';
import { Store } from '../Store';

const style={
    normale:{
        backgroundColor:"#ffc000",
        color:"#000000"
    },
    hover:{
        backgroundColor:"#007bff",
        color:"#ffffff"
    }
}
function Product(props) {
    const [hover, setHover] = useState(false)
    const { product } = props;
    const { state, dispatch: ctxDispatch } = useContext(Store);
    const {
        cart: { cartItems },
    } = state;
    const addToCartHandler = async (item) => {
        const existItem = cartItems.find((x) => x._id === product._id);
        const quantity = existItem ? existItem.quantity + 1 : 1;
        const { data } = await axios.get(`/api/products/${item._id}`)

        if (data.countInStock < quantity) {
            window.alert('Sorry. Product is out of stock');
            return;
        }
        ctxDispatch({ type: 'CART_ADD_ITEM', payload: { ...item, quantity } })
    }
    return (
        <Card className="product" >
            <Link to={`/product/${product?.slug}`}>
                <img src={product?.image} className='card-img-top' alt={product?.slog} />
            </Link>
            <Card.Body>
                <Link to={`/product/${product?.slug}`}>
                    <Card.Title>{product?.name}</Card.Title>
                </Link>
                <Rating rating={product?.rating} numReviews={product?.numReviews} />
                <Card.Text>${product?.price}</Card.Text>
                {
                    product?.countInStock === 0 ? <Button variant='light' disabled>Out of stock</Button> :
                        <Button
                        onMouseEnter={()=>setHover(true)}
                        onMouseLeave={()=>setHover(false)}    
                        style={{...style. normale, ...(hover?style.hover:null)}}
                            onClick={() => addToCartHandler(product)}
                        >Add to card</Button>
                }
            </Card.Body>
        </Card>
    )
}

export default Product
