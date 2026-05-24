# 🚀 DevPulse - Internal Tech Issue & Feature Tracker

[![Node.js](https://img.shields.io/badge/Node.js-24.x-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-latest-blue.svg)](https://www.typescriptlang.org/)
[![Express.js](https://img.shields.io/badge/Express.js-4.x-lightgrey.svg)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16.x-blue.svg)](https://www.postgresql.org/)
[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black.svg)](https://vercel.com/)

> **A collaborative platform for software teams to report bugs, suggest features, and coordinate resolutions.**

## 🌐 Live Demo

**API Base URL:** [https://dev-pulse-chi-five.vercel.app](https://dev-pulse-chi-five.vercel.app)

## 📋 Table of Contents

- [Features](#-features)
- [Technology Stack](#%EF%B8%8F-technology-stack)
- [Database Schema](#-database-schema)
- [API Endpoints](#-api-endpoints)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Deployment](#-deployment)
- [Project Structure](#-project-structure)
- [Error Handling](#-error-handling)
- [Contributing](#-contributing)
- [License](#-license)

## ✨ Features

### User Management
- 🔐 **Secure Authentication** with JWT tokens
- 👥 **Role-Based Access Control** (Contributor & Maintainer)
- 📝 **User Registration & Login** with password encryption (bcrypt)

### Issue Tracking
- 🐛 **Create Issues** (Bug reports & Feature requests)
- 📊 **View All Issues** with sorting & filtering
- 🔍 **Single Issue Details** with reporter information
- ✏️ **Update Issues** (role-based permissions)
- 🗑️ **Delete Issues** (Maintainer only)

### Security
- 🔒 Passwords never exposed in responses
- 🛡️ Protected endpoints require valid JWT
- ✅ Role verification before privileged operations

## 🛠️ Technology Stack

| Category | Technology | Version |
|----------|-----------|---------|
| **Runtime** | Node.js | 24.x LTS |
| **Language** | TypeScript | Latest |
| **Framework** | Express.js | 4.x |
| **Database** | PostgreSQL | 16.x |
| **Database Driver** | pg (native) | Latest |
| **Authentication** | JWT + bcrypt | Latest |
| **Deployment** | Vercel | - |

### Key Libraries
- `jsonwebtoken` - JWT generation & verification
- `bcrypt` - Password hashing (10 salt rounds)
- `pg` - PostgreSQL database driver
- `dotenv` - Environment variable management
- `cors` - Cross-origin resource sharing


## 🗄️ Database Schema

### Table: `users`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | SERIAL | PRIMARY KEY | Auto-incrementing unique identifier |
| `name` | VARCHAR(100) | NOT NULL | Full display name |
| `email` | VARCHAR(255) | NOT NULL, UNIQUE | Login email address |
| `password` | VARCHAR(255) | NOT NULL | Encrypted password (bcrypt hash) |
| `role` | VARCHAR(20) | NOT NULL, DEFAULT 'contributor' | Role: contributor or maintainer |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Account creation timestamp |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Last update timestamp |

### Table: `issues`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | SERIAL | PRIMARY KEY | Auto-incrementing identifier |
| `title` | VARCHAR(150) | NOT NULL | Short descriptive headline |
| `description` | TEXT | NOT NULL | Detailed explanation (min 20 chars) |
| `type` | VARCHAR(20) | NOT NULL | Type: bug or feature_request |
| `status` | VARCHAR(20) | NOT NULL, DEFAULT 'open' | Status: open, in_progress, resolved |
| `reporter_id` | INTEGER | NOT NULL | References users.id |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Creation timestamp |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Last update timestamp |

**Note:** Foreign key constraints are validated at the application level as per requirements.

## 🌐 API Endpoints

### 🔐 Authentication Routes

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `POST` | `/api/auth/signup` | Public | Register a new user account |
| `POST` | `/api/auth/login` | Public | Authenticate & receive JWT token |

### 📝 Issue Routes

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `POST` | `/api/issues` | Authenticated | Create a new issue |
| `GET` | `/api/issues` | Public | Get all issues (with sorting/filtering) |
| `GET` | `/api/issues/:id` | Public | Get single issue details |
| `PATCH` | `/api/issues/:id` | Authenticated | Update an issue |
| `DELETE` | `/api/issues/:id` | Maintainer only | Delete an issue |

### 📊 Query Parameters (GET /api/issues)

| Parameter | Values | Default |
|-----------|--------|---------|
| `sort` | `newest`, `oldest` | `newest` |
| `type` | `bug`, `feature_request` | (none) |
| `status` | `open`, `in_progress`, `resolved` | (none) |

## 🚀 Getting Started

### Prerequisites

- Node.js (24.x or higher)
- PostgreSQL (16.x or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/saifhossainjibon/DevPulse.git
cd DevPulse