# EstateHub - MERN Stack Real Estate Listing Web App

EstateHub is a fully-featured real estate listing web application built with the MERN stack (MongoDB, Express, React with Vite, Node.js) and styled with Tailwind CSS. It supports role-based features for **Buyers** and **Agents** with custom search, filtering, favorite listings, and agent property inquiry submissions.

This project is structured as two independent modules (`/frontend` and `/backend`), making it perfectly optimized for containerized deployments (Docker, Kubernetes) and CI/CD pipelines.

---

## 🏗️ Project Structure

```text
/
├── .env                  # Core development env config
├── .env.example          # Template for root env vars
├── package.json          # Monorepo / combined development configuration
├── vite.config.ts        # Vite configuration (pointing root to frontend)
├── dist/                 # Production compiled builds (both frontend and backend)
├── backend/              # Node.js + Express backend service
│   ├── src/              # TypeScript source code
│   ├── .env.example      # Backend environment template
│   └── package.json      # Backend-specific package configs
└── frontend/             # React (Vite) frontend application
    ├── src/              # Frontend TypeScript source code
    ├── .env.example      # Frontend environment template
    └── package.json      # Frontend-specific package configs
```

---

## ⚙️ Environment Variables

### Root Level / Backend (`/.env` & `/backend/.env.example`)
Create a `.env` file in the root or the `/backend` folder with the following variables:

```env
PORT=3000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.aalr0fs.mongodb.net/cartix?retryWrites=true&w=majority
JWT_SECRET=estatehub_jwt_secret_key_987654321
NODE_ENV=development
VITE_API_URL=/api
```

### Frontend (`/frontend/.env.example`)
Create a `.env` file in `/frontend` if deployed completely separately from the Express proxy:

```env
VITE_API_URL=http://localhost:3000/api
```

---

## 🚀 Quick Start (Development & Local Setup)

To run the unified application locally in development mode:

1. **Install Root Dependencies**:
   ```bash
   npm install
   ```

2. **Configure Environment Variables**:
   Create a `.env` file at the root level and paste the MongoDB URI and secret keys.

3. **Start Development Server**:
   ```bash
   npm run dev
   ```
   *This starts the backend Express server on port `3000` and automatically mounts the Vite React dev server as middleware. Your app is accessible on http://localhost:3000.*

---

## 📦 Production Build & Run

To build the integrated production distribution:

1. **Compile Assets**:
   ```bash
   npm run build
   ```
   *This builds the React static bundle to `/dist/index.html` and compiles the Node.js Express server into `/dist/server.cjs` using esbuild.*

2. **Start Production Server**:
   ```bash
   npm run start
   ```

---

## 🐳 Dockerization & Containerization

Both folders are fully independent and can be Dockerized individually for Kubernetes or other orchestration engines.

### Backend Dockerfile Example (`/backend/Dockerfile`)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --only=production
COPY . .
ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "src/server.ts"]
```

### Frontend Dockerfile Example (`/frontend/Dockerfile`)
```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

---

## 🛡️ Kubernetes Liveness & Readiness Probes

This application includes specific probes suited for K8s monitoring:
- **Liveness Probe**: `GET /health` (returns `200` with `{ status: "ok" }`)
- **Readiness Probe**: `GET /ready` (checks connection to MongoDB and returns `200` if active, `503` if inactive)

---

## 📡 API Endpoints

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/auth/register` | Public | Registers a new Buyer or Agent |
| **POST** | `/api/auth/login` | Public | Authenticates credentials and returns JWT |
| **GET** | `/api/properties` | Public | Retrieves listings (supports queries: `city`, `bedrooms`, `minPrice`, `maxPrice`, `search`, `propertyType`) |
| **GET** | `/api/properties/:id` | Public | Retrieves specific listing details |
| **POST** | `/api/properties` | Private (Agent) | Creates a new property listing |
| **PUT** | `/api/properties/:id` | Private (Agent Owner) | Updates property listing details |
| **DELETE** | `/api/properties/:id` | Private (Agent Owner) | Deletes a property listing |
| **GET** | `/api/favorites` | Private | Retrieves the logged-in user's favorites list |
| **POST** | `/api/favorites/:propertyId` | Private | Saves a property to favorites |
| **DELETE** | `/api/favorites/:propertyId` | Private | Removes a property from favorites |
| **POST** | `/api/inquiries` | Public (Opt-Auth) | Submits contact inquiries to the DB |
| **GET** | `/health` | Public | Liveness probe (returns `200` if server is up) |
| **GET** | `/ready` | Public | Readiness probe (returns `200` if DB is connected) |
