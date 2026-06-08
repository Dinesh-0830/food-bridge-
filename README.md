# FoodBridge – Connecting Surplus Food with People in Need

FoodBridge is a premium full-stack web application designed to optimize excess food distribution from hotels, restaurants, marriage halls, and individual donors to those in need via verified NGOs and registered volunteers.

---

## 🚀 Key Features

* **Dynamic Multi-Role System**: Roles for Hotels/Orgs, Individuals, Volunteers, NGOs, and Admins.
* **Real-time Live Location Tracking**: Sockets link GPS coordinate updates from volunteer riders to the Donor, NGO, and Admin dashboard maps.
* **Verification Proof System**: Volunteers upload visual proof of handovers which NGOs audit and verify.
* **Admin Control Center**: Approve NGO/Volunteer signups, manage user directories, and inspect metrics.
* **Premium Aesthetics**: Dark mode, glassmorphism card styling, neon SVG active maps, and soft transitions.

---

## 🛠️ Technology Stack

### Backend
* **Node.js** + **Express.js** (TypeScript)
* **PostgreSQL** + **Prisma ORM**
* **Socket.IO** (Real-time tracking and alerts)
* **JWT** + **bcrypt** (Secure Auth)
* **Cloudinary** (Secure uploads with local visual mock fallback)

### Frontend
* **Vite** + **React.js** (TypeScript)
* **Tailwind CSS** (Styling)
* **React Router** (Routing)
* **Axios** (API Client)
* **Socket.IO Client** (Live connections)

---

## 📦 Getting Started

### 1. Prerequisites
Ensure you have the following installed on your system:
* **Node.js** (v18.0.0 or higher)
* **npm** (v9.0.0 or higher)
* **Docker Desktop** (To spin up the local PostgreSQL database)

---

### 2. Database Setup (Docker)
FoodBridge comes configured with a PostgreSQL container configuration. To start the database:
1. Open a terminal in the root directory.
2. Run the following command to download and start the database:
   ```bash
   docker-compose up -d
   ```

---

### 3. Backend Service Installation
1. Navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Run database migrations to construct tables:
   ```bash
   npx prisma migrate dev --name init
   ```
4. Run the seed script to populate demo data (Hospitals, Shelters, Users):
   ```bash
   npm run prisma:seed
   ```
5. Start the backend developer server:
   ```bash
   npm run dev
   ```
   *The server starts listening on `http://localhost:5000`.*

---

### 4. Frontend Client Installation
1. Navigate to the `frontend` folder:
   ```bash
   cd ../frontend
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Start the Vite developer server:
   ```bash
   npm run dev
   ```
   *The site launches at `http://localhost:5173`.*

---

## 🔑 Demo Access Logins
You can log into the system immediately using any of these pre-seeded accounts:

| Role | Email | Password |
| :--- | :--- | :--- |
| **System Admin** | `admin@foodbridge.org` | `password123` |
| **Hotel Org Donor** | `grandplaza@hotel.com` | `password123` |
| **Individual Donor** | `sarah@donor.com` | `password123` |
| **NGO Agent** | `hope@ngo.org` | `password123` |
| **Volunteer Rider** | `john@volunteer.com` | `password123` |

*For Volunteers, NGOs, and Hotels created via the signup form, log in as the Admin first (`admin@foodbridge.org`) to toggle their status to `APPROVED` before signing into their accounts.*

---

## 🚴 Active GPS Location Simulation
For local testing of **real-time maps**:
1. Log in as **Volunteer Rider** (`john@volunteer.com`) and accept a distribution task.
2. Open the active job view and click **"Sim GPS Route"** on the dashboard.
3. This triggers a simulated GPS coordinates feed.
4. Log into the **Donor** or **NGO** dashboards in a parallel browser tab to see the rider moving live along the path with estimated time of arrivals (ETA) updates!
