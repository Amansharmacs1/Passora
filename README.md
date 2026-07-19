<div align="center">
  <img src="./frontend/public/favicon.svg" alt="Passora Logo" width="120" />
  <h1>Passora</h1>
  <p><strong>A modern, military-grade password manager built for teams and individuals.</strong></p>

  <p>
    <a href="#features">Features</a> •
    <a href="#tech-stack">Tech Stack</a> •
    <a href="#security-architecture">Security</a> •
    <a href="#getting-started">Getting Started</a> •
    <a href="#docker">Docker</a>
  </p>
</div>

---

Passora is a premium password manager engineered with a "security-first" architecture. Featuring an intuitive, minimalist SaaS dashboard and powerful security tools like Passkey support and Two-Factor Authentication, Passora rivals commercial platforms like Bitwarden, 1Password, and Dashlane.

## 🌟 Features

### Advanced Security
- **Biometric Passkeys:** Passwordless, phishing-resistant logins powered by WebAuthn.
- **Two-Factor Authentication (2FA):** Support for TOTP authenticator apps (Google Authenticator, Authy).
- **Master Password Protection:** A secondary layer of encryption securing all vault data. 
- **Data Breach Scanner:** Integrated with HaveIBeenPwned (HIBP) to actively monitor compromised credentials.
- **Auto-Logout & Session Management:** Idle timeouts and comprehensive cross-device session tracking.

### Core Experience
- **Secure Password Vault:** Store logins, credit cards, secure notes, and personal identities.
- **Command Palette:** Navigate anywhere instantly using `Ctrl+K` (or `Cmd+K`).
- **Advanced Password Generator:** Customizable length, character types, and complexity requirements.
- **Import / Export:** Seamlessly migrate data via encrypted CSV.
- **Performance Optimized:** Built with React `Suspense` and `React.memo` for ultra-fast interactions.

### UI & Aesthetics
- **Framer Motion Animations:** Smooth page transitions and micro-interactions.
- **Dark Mode Support:** A sleek, adaptive interface that seamlessly toggles between crisp light and true-neutral dark modes.
- **Emerald Theme:** A highly curated `#059669` green palette designed for premium SaaS applications.

---

## 🛠 Tech Stack

**Frontend**
- React (Vite 8)
- Tailwind CSS v4
- Framer Motion
- React Hook Form & React Hot Toast
- Recharts (Analytics Dashboard)

**Backend**
- Node.js (v22 / v24)
- Express.js
- MongoDB & Mongoose
- `speakeasy` (TOTP 2FA) & `@simplewebauthn/server` (Passkeys)

**DevOps & CI/CD**
- Docker & Docker Compose
- GitHub Actions (Automated CI/CD with Node.js)
- Native Node Test Runner & Supertest

---

## 🛡 Security Architecture

Passora is built with strict adherence to cybersecurity best practices:
1. **Zero-Knowledge Architecture:** Master passwords are never stored in plain text and are used to encrypt/decrypt sensitive vault data securely.
2. **Rate Limiting & Helmet Security:** Mitigates brute-force attacks and prevents common web vulnerabilities.
3. **Session Hashing:** JWT tokens are strictly validated and tracked to allow users to remotely revoke active sessions.

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v22.x or v24.x recommended)
- [MongoDB](https://www.mongodb.com/) (Local instance or Atlas cluster)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Amansharmacs1/Passora.git
   cd Passora
   ```

2. **Setup the Backend:**
   ```bash
   cd backend
   npm install
   
   # Create a .env file based on the environment variables required
   echo "PORT=5000\nMONGO_URI=mongodb://127.0.0.1:27017/passora\nJWT_SECRET=your_super_secret_key\nFRONTEND_URL=http://localhost:5173" > .env
   
   npm run dev
   ```

3. **Setup the Frontend:**
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```

4. **Visit:** `http://localhost:5173` in your browser.

---

## 🐳 Docker Deployment

Passora comes pre-configured with a `docker-compose.yml` for seamless, single-command deployment.

```bash
# Build and start all containers (Frontend, Backend, and MongoDB)
docker-compose up --build -d
```

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000`

---

## 🧪 Testing

Passora includes an automated integration test suite to verify core endpoints.
```bash
cd backend
npm test
```

---

## 📄 License
This project is licensed under the MIT License.
