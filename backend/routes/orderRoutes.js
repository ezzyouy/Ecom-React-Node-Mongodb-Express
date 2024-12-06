import express from "express";
import expressAsyncHandler from "express-async-handler";
import Order from "../models/orderModel.js";
import { isAdmin, isAuth } from "../utils.js";
import User from "../models/userModel.js";
import Product from "../models/productModel.js";
import nodemailer from "nodemailer";

const orderRouter = express.Router();

orderRouter.get("/", isAuth, isAdmin, expressAsyncHandler(async (req, res) => {
    const orders = await Order.find().populate('user', 'name');
    if (orders) {
        res.send(orders)
    } else {
        res.status(404).send({ message: "Orders Doesn't existe" })
    }

}));

orderRouter.post("/", isAuth, expressAsyncHandler(async (req, res) => {
    const newOrder = new Order({
        orderItems: req.body.orderItems.map((x) => ({ ...x, product: x._id })),
        shippingAddress: req.body.shippingAddress,
        paymentMethod: req.body.paymentMethod,
        itemsPrice: req.body.itemsPrice,
        shippingPrice: req.body.shippingPrice,
        taxPrice: req.body.taxPrice,
        totalPrice: req.body.totalPrice,
        user: req.user._id
    })
    const order = await newOrder.save();
    res.status(201).send({ message: 'New Order Created', order });

}))
orderRouter.get("/summary", isAuth, isAdmin, expressAsyncHandler(async (req, res) => {
    const orders = await Order.aggregate([
        {
            $group: {
                _id: null,
                numOrders: { $sum: 1 },
                totalSales: { $sum: '$totalPrice' },
            }
        }
    ])
    const users = await User.aggregate([
        {
            $group: {
                _id: null,
                numUsers: { $sum: 1 }
            }
        }
    ])
    const dailyOrders = await Order.aggregate([
        {
            $group: {
                _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                orders: { $sum: 1 },
                sales: { $sum: '$totalPrice' },
            }
        },
        { $sort: { _id: 1 } }
    ])
    const productCategories = await Product.aggregate([
        {
            $group: {
                _id: '$category',
                count: { $sum: 1 }
            }
        },
    ])


    res.send({ orders, users, dailyOrders, productCategories })
}));
orderRouter.get("/mine", isAuth, expressAsyncHandler(async (req, res) => {
    const orders = await Order.find({ user: req.user._id })

    res.send(orders)
}));

orderRouter.get("/:id", isAuth, expressAsyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id)

    if (order) {
        res.send(order)
    } else {
        res.status(404).send({ message: 'Order Not Found' });
    }
}))

orderRouter.put('/:id/pay', isAuth, expressAsyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id)
    if (order) {
        order.isPaid = true;
        order.paidAt = Date.now();
        order.paymentResult = {
            id: req.body.id,
            status: req.body.status,
            update_time: req.body.update_time,
            email_address: req.body.email_address
        };
        const updateOrder = await order.save();
        /* mailgun().message().send({
            form:'Amazona <Ama@mg.yourdomain.com>',
            to:`${order.user.name} <${order.user.email}>`,
            subject: `New order ${order._id}`,
            html: payOrderEmailTemplate(order),
        },
            (error,body)=>{
                if(error){
                    console.log(error);
                }else{
                    console.log(body);
                    
                }
            }
        ); */
        const transporter = nodemailer.createTransport({
            host: 'sandbox.smtp.mailtrap.io',
            port: 587,
            secure: false, // use SSL
            auth: {
              user: 'bee5e843bea378',
              pass: 'c80f751071f8c1',
            }
          });
          
          // Configure the mailoptions object
          const mailOptions = {
            from: 'bra-e-zz@hotmail.fr',
            to: 'brahim.ezzyouy@email.com',
            subject: 'Sending Email using Node.js',
            text: 'That was easy!'
          };
          
          // Send the email
          transporter.sendMail(mailOptions, function(error, info){
            if (error) {
              console.log('Error:', error);
            } else {
              console.log('Email sent:', info.response);
            }
          });
        res.send({ message: 'Order Paid', order: updateOrder })
    } else {
        res.status(404).send({ message: 'Order Not Found' });
    }
}))

orderRouter.put('/:id/deliver', isAuth, expressAsyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (order) {
        order.isDelivered = true;
        order.deliveredAt = Date.now();
        await order.save();
        res.send({ message: 'Order Delivered' })
    } else {
        res.status(404).send({ message: "Order Not found" });
    }
}));

orderRouter.delete('/:id', isAuth, expressAsyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);
    if(order){
        await order.deleteOne();
        res.send({message:"Order Deleted"});
    }else{
        res.status(404).send({ message: "Order Not found" });
    }
}));

export default orderRouter;