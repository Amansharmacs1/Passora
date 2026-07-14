# Passora - Secure Password Manager

![Passora Logo](./frontend/public/favicon.svg)

Passora is a beautiful, intelligent, and highly secure password manager designed for modern teams and individuals. It uses a premium, clean SaaS UI designed around a security-first "Emerald" theme. 

## 🌟 Features
- **Military-Grade Security**: Passwords and sensitive data are protected with secure hashing and encryption.
- **Clean SaaS Dashboard**: A premium, minimal interface that removes clutter and prioritizes speed.
- **Password Strength Meter**: Real-time evaluation of password complexity to ensure maximum security.
- **Dark & Light Mode**: A sleek interface that gracefully adapts to a true-neutral dark mode or crisp light mode.
- **Responsive Design**: Built seamlessly for desktop, tablet, and mobile viewing.

## 🛠 Tech Stack
- **Frontend**: React, Vite, Tailwind CSS v4, Framer Motion, React Router, React Hook Form
- **Backend**: Node.js, Express, MongoDB (Mongoose)
- **Authentication**: JWT (JSON Web Tokens)

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB running locally or a MongoDB Atlas URI

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Amansharmacs1/Passora.git
   cd Passora
   ```

2. **Setup the Backend**
   ```bash
   cd backend
   npm install
   ```
   Create a `.env` file in the `backend` directory with the following variables:
   ```env
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/passora
   JWT_SECRET=your_jwt_secret
   ```
   Start the backend server:
   ```bash
   npm run dev
   ```

3. **Setup the Frontend**
   Open a new terminal window and run:
   ```bash
   cd frontend
   npm install
   ```
   Start the frontend development server:
   ```bash
   npm run dev
   ```

4. **Open the App**
   Navigate to `http://localhost:5173` in your browser.

## 🎨 Theme & Design
The application utilizes a highly specific **Emerald Green** color palette:
- **Primary**: `#059669`
- **Secondary**: `#10B981`
- **Backgrounds**: `#F8FAFC` (Light) / `#0a0a0a` (Dark)
- **Surfaces**: `#ECFDF5` (Light) / `#171717` (Dark)

## 📄 License
This project is licensed under the MIT License.
