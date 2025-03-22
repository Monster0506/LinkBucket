# LinkBucket

LinkBucket is a web application that allows users to save and manage their favorite links in a clean, organized interface. It's built with Express.js for the backend and vanilla JavaScript for the frontend, using Supabase as the database.

## Features

- 🔗 Save links with custom titles
- 🎨 Clean, responsive card-based interface
- 🔄 Real-time link management (add/remove)
- 🔒 Basic authentication system
- 📱 Mobile-friendly design
- 🌐 URL validation and normalization

## Tech Stack

- Backend: Node.js with Express
- Frontend: HTML, CSS, JavaScript
- Database: Supabase
- Styling: Bootstrap 5 + Custom CSS
- Icons: Font Awesome
- Deployment: Vercel

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (Node Package Manager)
- A Supabase account and project

### Installation

1. Clone the repository:
```bash
git clone https://github.com/monster0506/LinkBucket.git
cd LinkBucket
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with your Supabase credentials:
```plaintext
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
```

4. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Database Setup

Create a table named `links` in your Supabase project with the following schema:

```sql
create table links (
  id uuid primary key,
  url text not null,
  title text,
  timestamp timestamptz default now(),
  user_id text
);
```

## Project Structure

```plaintext
LinkBucket/
├── public/
│   ├── javascripts/
│   │   └── main.js
│   ├── stylesheets/
│   │   └── style.css
│   └── index.html
├── routes/
│   ├── index.js
│   └── users.js
├── app.js
├── package.json
└── vercel.json
```

## API Endpoints

- `POST /api/links` - Add a new link
- `GET /api/links` - Get all links
- `DELETE /api/links/:id` - Delete a specific link
- `POST /api/register` - Register a new user
- `POST /api/login` - Login user
- `POST /api/logout` - Logout user

## Deployment

The project is configured for deployment on Vercel. The `vercel.json` file includes the necessary configuration for serverless deployment.

To deploy:

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Deploy:
```bash
vercel
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is open source and available under the [MIT License](LICENSE).
