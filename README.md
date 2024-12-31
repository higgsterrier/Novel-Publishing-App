# Novel Publishing App

A modern web application for publishing and managing novels, built with Next.js and MongoDB.

## Features

- User authentication and authorization
- Novel publishing and management
- Responsive and modern UI using Tailwind CSS
- MongoDB database integration
- Secure API endpoints

## Tech Stack

- **Frontend:**
  - Next.js 14
  - React 18
  - Tailwind CSS
  - Radix UI Components
  - Lucide React Icons

- **Backend:**
  - Next.js API Routes
  - MongoDB with Mongoose
  - JWT Authentication
  - bcryptjs for password hashing

## Getting Started

### Prerequisites

- Node.js (v20 or later)
- npm or yarn
- MongoDB database

### Installation

1. Clone the repository:
```bash
git clone [your-repo-url]
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the root directory and add your environment variables:
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

4. Run the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

- `/src/app` - Next.js app router pages and API routes
- `/src/components` - Reusable React components
- `/src/lib` - Utility functions and configurations
- `/src/models` - MongoDB/Mongoose models

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.