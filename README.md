# Craft Management Mini App

A React TypeScript application for managing employees with authentication, built with Tailwind CSS, Headless UI, and Redux Toolkit.

## Features

- 🔐 JWT Authentication (Login)
- 👥 Employee Management (CRUD operations)
- 🔍 Filtering by email, name, phone number, department
- 📄 Pagination support
- 🎨 Modern UI with Tailwind CSS and Headless UI
- 📱 Responsive design
- 🛡️ Protected routes (Admin only for employee management)

## Tech Stack

- React 18
- TypeScript
- Vite
- Redux Toolkit
- React Router
- Axios
- Tailwind CSS
- Headless UI
- Heroicons

## Prerequisites

- Node.js (v20.19.0 or >=22.12.0)
- npm or yarn
- Backend API running on `http://localhost:3000`

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```env
VITE_API_BASE_URL=http://localhost:3000/api
```

3. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173` (or the port Vite assigns).

## Project Structure

```
src/
├── components/
│   ├── auth/           # Authentication components
│   ├── common/         # Reusable UI components
│   ├── employees/      # Employee management components
│   └── layout/         # Layout components
├── pages/              # Page components
├── services/           # API services
├── store/              # Redux store and slices
├── types/              # TypeScript type definitions
└── utils/              # Utility functions
```

## Usage

1. Start the backend API server (see backend README)
2. Login with admin credentials
3. Navigate to Employee Management
4. Perform CRUD operations on employees
5. Use filters and pagination to manage large datasets

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Environment Variables

- `VITE_API_BASE_URL` - Backend API base URL (default: `http://localhost:3000/api`)

## License

ISC
