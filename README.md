# Anmol Fashion — Full Stack

## What this adds
- Orders saved permanently in Supabase PostgreSQL
- Customer details and cart items stored with each order
- Admin API to list orders
- GitHub Pages frontend can send orders to the backend
- COD order flow is ready
- UPI field is stored as a payment method; a real payment gateway still needs Razorpay/other credentials.

## 1. Supabase
Create a Supabase project, open SQL Editor, and run `schema.sql`.
Copy the project URL and service-role key into Render environment variables.
Never put the service-role key in frontend code.

## 2. Backend on Render
Push the `backend` folder to a GitHub repository.
On Render create a Web Service, choose that repository/folder, Build Command `npm install`, Start Command `npm start`.
Set environment variables from `.env.example`.
Render provides a public `onrender.com` URL.

## 3. Connect frontend
Open `frontend/script.js` and replace:
PASTE_YOUR_RENDER_BACKEND_URL_HERE
with your Render URL, for example:
https://anmol-fashion-api.onrender.com

Then upload the frontend files to the GitHub Pages repository.

## 4. Admin orders
GET `/api/orders` with header:
x-admin-key: YOUR_ADMIN_KEY

Do not expose the admin key in frontend code.
