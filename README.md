# Simple CRM Application

A full-stack CRM (Customer Relationship Management) application built with Node.js, Express, TypeScript, React, and Supabase.

## Features

- User authentication and role-based access control
- Customer management
- Contact management
- Sales opportunity tracking
- Task management
- Reporting

## Tech Stack

- **Backend**: Node.js, Express, TypeScript
- **Frontend**: React, TypeScript, Bootstrap
- **Database**: PostgreSQL via Supabase
- **Authentication**: JWT (JSON Web Tokens)

## Local Development

### Prerequisites

- Node.js (v18 or later)
- npm
- Supabase account

### Backend Setup

1. Clone the repository
2. Navigate to the project directory
3. Copy `.env.example` to `.env` and update with your Supabase credentials
4. Install dependencies:

```bash
npm install
```

5. Start the development server:

```bash
npm run dev
```

### Frontend Setup

1. Navigate to the frontend directory:

```bash
cd frontend
```

2. Install dependencies:

```bash
npm install
```

3. Start the frontend development server:

```bash
npm start
```

## Deployment

The application is configured for easy deployment to cloud platforms. You can deploy to Render.com, Vercel, Railway, Heroku, or any other platform that supports Node.js applications.

### Deployment to Render.com

1. Create a new Web Service on Render.com
2. Connect your GitHub repository
3. Configure the service:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
4. Add the required environment variables from your `.env` file
5. Deploy

### Deployment to Heroku

1. Create a Heroku account and install the Heroku CLI
2. Login to Heroku:

```bash
heroku login
```

3. Create a new Heroku app:

```bash
heroku create your-app-name
```

4. Add the required environment variables:

```bash
heroku config:set SUPABASE_URL=your-supabase-url
heroku config:set SUPABASE_KEY=your-supabase-anon-key
heroku config:set JWT_SECRET=your-secure-jwt-secret
heroku config:set ADMIN_EMAIL=admin@example.com
heroku config:set ADMIN_PASSWORD=YourSecurePassword123!
heroku config:set NODE_ENV=production
```

5. Push to Heroku:

```bash
git push heroku main
```

## Environment Variables

The following environment variables are required:

- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_KEY`: Your Supabase anon key
- `JWT_SECRET`: Secret key for JWT token generation
- `ADMIN_EMAIL`: Email for the initial admin user
- `ADMIN_PASSWORD`: Password for the initial admin user
- `PORT` (optional): Port for the server to listen on (defaults to 3000)
- `NODE_ENV`: Set to 'production' for production deployments

## License

MIT 