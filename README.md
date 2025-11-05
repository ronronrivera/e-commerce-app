# 🛒 E-Commerce Store

A **full-featured e-commerce store** built with the **MERN stack** — offering **user authentication**, **admin dashboard**, **CRUD operations**, **analytics**, and **secure payments with Stripe**.  
Customers receive **coupon discounts** after spending $200+!

<img width="1920" height="1080" alt="image" src="readmefiles/home.jpg"/>

## 🔐User Authentication
<p align="center">
  <img src="readmefiles/login.jpg" width="45%">
  <img src="readmefiles/signup.jpg" width="45%">
</p>

## 👑Admin Dashboard

### Create Products
<img width="1920" height="1080" alt="image" src="readmefiles/admin_dashboard.jpg"/>

### Product List
<img width="1920" height="1080" alt="image" src="readmefiles/productList.jpg"/>

### Analytics
<img width="1920" height="1080" alt="image" src="readmefiles/analytics.jpg"/>

## Checkout Page
<img width="1920" height="1080" alt="image" src="readmefiles/checkoutpage.jpg"/>

## Stripe
<img width="1920" height="1080" alt="image" src="readmefiles/stripe.jpg"/>

## Payment Successfull
<img width="1920" height="1080" alt="image" src="readmefiles/payment_successfull.jpg"/>

## Payment Cancel
<img width="1920" height="1080" alt="image" src="readmefiles/payment_cancel.jpg"/>


## 🌍 Live Demo
🟢 **[Try it here →](https://e-commerce-app-ap3d.onrender.com/)**  


## 💡 Motivation
I built this project to strengthen my **full-stack development** skills, improve my **problem-solving ability**, and gain experience designing scalable web applications from scratch.


## 🚀 Features
- 🗄️ **MongoDB & Redis** integration  
- 💳 **Stripe Payment** integration  
- 🔐 **JWT Authentication** (Access + Refresh Tokens)  
- 🛍️ **E-Commerce Core** (Cart, Checkout, Coupons)  
- 👑 **Admin Dashboard** with Product Management  
- 📊 **Sales Analytics**  
- 🎨 **Responsive UI** built with TailwindCSS  
- 🛡️ **Security & Data Protection**
- 🚀 **Caching with Redis**

## 🛠️ Tech Stack
| Layer | Technology |
|-------|-------------|
| Frontend | React, Vite, Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB (Mongoose) |
| Real-time | Socket.io |
| Email Service | Resend API |
| Auth | JSON Web Tokens (JWT) |

🔑 Environment Variables
PORT=8080
MONGO_URI=your_mongodb_uri

UPSTASH_REDIS_REST_URL=your_redis_url
UPSTASH_REDIS_REST_TOKEN=your_redis_token

ACCESS_TOKEN_SECRET=your_access_token
REFRESH_TOKEN_SECRET=your_refresh_token

CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api
CLOUDINARY_API_SECRET=your_cloudinary_secret

STRIPE_SECRET_KEY=your_stripe_secret_key

CLIENT_URL=http://localhost:5173

NODE_ENV=development


![License](https://img.shields.io/badge/license-MIT-blue)
![Status](https://img.shields.io/badge/status-active-brightgreen)
![Tech](https://img.shields.io/badge/MERN-stack-blue)

## ⚙️ Installation

### 1️⃣ Clone the repository
```bash
git clone https://github.com/ronronrivera/e-commerce-app
cd e-commerce-app

2️⃣ Install dependencies

cd backend
npm install

cd frontend
npm install


🧩 Running the App
cd backend
npm run dev

cd frontend
npm run dev
