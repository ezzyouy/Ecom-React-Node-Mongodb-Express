import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Form, FormControl, InputGroup } from 'react-bootstrap'

const style = {
    normale: {
        backgroundColor: '#ffc000',
        color: 'black'
    },
    hover: {
        backgroundColor: '#007bff',
        color: 'white'
    }
}
export default function SearchBox() {
    const navigate = useNavigate()
    const [query, setQuery] = useState('')

    const [hover, setHover] = useState(false)

    const submitHandler = (e) => {
        e.preventDefault();
        navigate(query ? `/search?query=${query}` : '/search');
    };
    return (
        <Form className='d-flex me-auto' onSubmit={submitHandler}>
            <InputGroup>
                <FormControl type='text' name='q' id='q'
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="search products..."
                    aria-label='Search Products'
                    aria-describedby='button-search'
                ></FormControl>
                <Button
                    variant='primary'
                    onMouseEnter={()=>setHover(true)}
                    onMouseLeave={()=>setHover(false)}
                    style={{
                        ...style.normale,
                        ...(hover ? style.hover : null)
                    }}
                    type='submit'
                    id='button-search'>
                    <i className='fas fa-search'></i>
                </Button>
            </InputGroup>
        </Form>
    )
}
