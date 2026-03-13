# PitGO 🚀

PitGO is a modern web application built with **Laravel**, **React**, and **PostgreSQL**. Designed with premium aesthetics and high performance in mind.

## ✨ Tech Stack
- **Backend:** Laravel 12
- **Frontend:** React (powered by Vite)
- **Database:** PostgreSQL
- **Styling:** Tailwind CSS v4

---

## 🛠️ Installation Guide

Follow these steps to set up the project locally:

### 1. Prerequisite
Ensure you have the following installed:
- [PHP 8.2+](https://www.php.net/)
- [Composer](https://getcomposer.org/)
- [Node.js & npm](https://nodejs.org/)
- [PostgreSQL](https://www.postgresql.org/)

### 2. Clone the Repository
```bash
git clone https://github.com/monsalman/PitGO.git
cd PitGO
```

### 3. Backend Setup
Install PHP dependencies:
```bash
composer install
```

Copy the `.env.example` to `.env`:
```bash
cp .env.example .env
```

Generate the application key:
```bash
php artisan key:generate
```

### 4. Database Configuration
Open `.env` and configure your PostgreSQL settings:
```dotenv
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=pitgo_db
DB_USERNAME=your_username
DB_PASSWORD=your_password
```

Create the database in PostgreSQL if it doesn't exist:
```bash
createdb pitgo_db
```

Run migrations:
```bash
php artisan migrate
```

### 5. Frontend Setup
Install npm dependencies:
```bash
npm install
```

Build the assets or run the development server:
```bash
# Build for production
npm run build

# OR Run development server
npm run dev
```

### 6. Run the Application
Start the Laravel development server:
```bash
php artisan serve
```
Visit `http://127.0.0.1:8000` to see the application.

---