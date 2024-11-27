import bcrypt from "bcryptjs";

const data = {
    users: [
        {
            name: "John Doe",
            email: "john.doe@example.com",
            password: bcrypt.hashSync("1234secure!"),
            isAdmin: false
        },
        {
            name: "Jane Smith",
            email: "jane.smith@example.com",
            password: bcrypt.hashSync("passw0rd$"),
            isAdmin: true
        },
        {
            name: "Alex Brown",
            email: "alex.brown@example.com",
            password: bcrypt.hashSync("A1ex@123"),
            isAdmin: false
        },
        {
            name: "Emma Wilson",
            email: "emma.wilson@example.com",
            password: bcrypt.hashSync("P@ssw0rd!"),
            isAdmin: true
        }
    ],
    products: [
        {
            //_id:1,
            name: "Nike Slim Shirt",
            slug: " nike-slim-shirt",
            category: 'Shirts',
            image: '/images/p1.jpg',
            price: 120,
            countInStock: 0,
            brand: 'Nike',
            rating: 4.5,
            numReviews: 10,
            description: "High quality shirt",
        },
        {
            //_id:2,
            name: "Adidas Fit Shirt",
            slug: " adidas-fit-shirt",
            category: 'Shirts',
            image: '/images/p2.jpg',
            price: 250,
            countInStock: 20,
            brand: 'Adidas',
            rating: 4.0,
            numReviews: 10,
            description: "High quality products",
        },
        {
            //_id:3,
            name: "Nike Slim Pant",
            slug: " nike-slim-pant",
            category: 'Pants',
            image: '/images/p3.jpg',
            price: 25,
            countInStock: 15,
            brand: 'Nike',
            rating: 4.5,
            numReviews: 14,
            description: "High quality shirt",
        },
        {
            //_id:4,
            name: "Puma Fit Pant",
            slug: " puma-fit-pant",
            category: 'Pants',
            image: '/images/p4.jpg',
            price: 65,
            countInStock: 5,
            brand: 'puma',
            rating: 4.0,
            numReviews: 10,
            description: "High quality products",
        },
    ]
}
export default data;