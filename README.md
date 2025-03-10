<p align="center"> <img src="https://github.com/meghrajjare5273/projectree/assets/your-logo.png" alt="ProjecTree Logo" width="150"/> </p> <h1 align="center">🌳 ProjecTree</h1> <p align="center"> <strong>Your digital hub for connecting with fellow college students and sharing memorable campus experiences.</strong> </p> <p align="center"> <a href="https://github.com/meghrajjare5273/projectree/actions"> <img src="https://img.shields.io/github/workflow/status/meghrajjare5273/projectree/CI" alt="Build Status"/> </a> <a href="https://github.com/meghrajjare5273/projectree/blob/main/LICENSE"> <img src="https://img.shields.io/github/license/meghrajjare5273/projectree" alt="License"/> </a> <a href="https://vercel.com/meghrajjare5273/projectree"> <img src="https://img.shields.io/badge/Deployed%20on-Vercel-000000.svg" alt="Deployed on Vercel"/> </a> </p> <p align="center"> <img src="https://github.com/meghrajjare5273/projectree/assets/demo.gif" alt="ProjecTree Demo" width="600"/> </p>


🚀 Features
👤 User Profiles: Customize your profile with a bio, social links, and profile image.
💡 Projects: Showcase your personal or team projects with images, tags, and descriptions.
🎉 Events: Share and explore campus events like hackathons, workshops, and tech fests.
🔐 Authentication: Secure sign-up and sign-in with email/password, GitHub, or Google.
💬 Social Interaction: Comment on projects and events to engage with the community.
📱 Responsive Design: Enjoy a seamless experience on both desktop and mobile devices.
🔍 SEO Optimized: Built-in metadata and sitemap for better search engine visibility.
🛠️ Tech Stack
Framework: Next.js 15.2.0
Language: TypeScript
Database: PostgreSQL with Prisma 6.4.1
Authentication: Better Auth (GitHub & Google)
Styling: Chakra UI, Tailwind CSS, DaisyUI
File Storage: Vercel Blob
UI Components: Radix UI, Shadcn UI
Icons: Lucide React, React Icons
Deployment: Optimized for Vercel


📸 Screenshots
<p align="center"> <img src="https://github.com/meghrajjare5273/projectree/assets/homepage.png" alt="Homepage" width="400"/> <img src="https://github.com/meghrajjare5273/projectree/assets/profile.png" alt="User Profile" width="400"/> </p> <p align="center"> <img src="https://github.com/meghrajjare5273/projectree/assets/project.png" alt="Project Showcase" width="400"/> <img src="https://github.com/meghrajjare5273/projectree/assets/event.png" alt="Event Page" width="400"/> </p>
🏁 Getting Started
Prerequisites
Node.js: Version 20.x or higher
pnpm: Recommended package manager (npm/yarn/bun also supported)
PostgreSQL: A running PostgreSQL instance
Environment Variables: Create a .env file with:
text

Collapse

Wrap

Copy
DATABASE_URL=postgresql://user:password@localhost:5432/projectree
BETTER_AUTH_URL=http://localhost:3000
GOOGLE_AUTH_CLIENT_ID=your-google-client-id
GOOGLE_AUTH_CLIENT_SECRET=your-google-client-secret
GITHUB_AUTH_CLIENT_ID=your-github-client-id
GITHUB_AUTH_CLIENT_SECRET=your-github-client-secret
BLOB_READ_WRITE_TOKEN=your-vercel-blob-token
SITE_URL=http://localhost:3000
Installation
Clone the repository:
bash

Collapse

Wrap

Copy
git clone https://github.com/meghrajjare5273/projectree.git
cd projectree
Install dependencies:
bash

Collapse

Wrap

Copy
pnpm install
Set up the database:
bash

Collapse

Wrap

Copy
npx prisma migrate dev --name init
Running the Development Server
Start the development server with Turbopack:

bash

Collapse

Wrap

Copy
pnpm dev
Open http://localhost:3000 to see the app in action. Edit src/app/page.tsx to see live updates.

📂 Project Structure
text

Collapse

Wrap

Copy
projectree/
├── README.md              # Project documentation
├── prisma/                # Prisma schema and migrations
│   └── schema.prisma      # Database schema
├── public/                # Static assets
│   └── manifest.json      # Web app manifest
├── src/                   # Source code
│   ├── app/               # Next.js app directory (pages, API routes)
│   ├── components/        # Reusable React components
│   ├── lib/              # Utility functions and configurations
│   └── types/            # TypeScript type definitions
├── next.config.ts         # Next.js configuration
├── package.json           # Dependencies and scripts
├── tsconfig.json          # TypeScript configuration
└── postcss.config.mjs     # PostCSS configuration (Tailwind)


🔌 API Endpoints
/api/auth/[...all]: Authentication (sign-in, sign-up, etc.)
/api/events: Manage events (GET, POST, PUT, DELETE)
/api/profile: Update and fetch user profile (PUT, GET)
/api/projects: Manage projects (GET, POST, PUT, DELETE)
/api/upload: Upload images to Vercel Blob (POST)
/api/users/[username]: Fetch user profile and posts (GET)
🗄️ Database Schema
The database schema is defined in prisma/schema.prisma and includes:

User: Profile details, social links, and authentication data.
Project: Student projects with images, tags, and comments.
Event: Campus events with dates, locations, and images.
Comment: Comments on projects and events.
Explore the database visually with:

bash

Collapse

Wrap

Copy
npx prisma studio
🚀 Deployment
Deploying on Vercel is straightforward:

Push the repository to GitHub.
Import the project into Vercel.
Set environment variables in the Vercel dashboard.
Click "Deploy"!
For more details, check the Next.js deployment docs.

🤝 Contributing
We welcome contributions! To get started:

Fork the repository.
Create a feature branch (git checkout -b feature/your-feature).
Commit your changes (git commit -m "Add your feature").
Push to the branch (git push origin feature/your-feature).
Open a pull request.
For inspiration and feedback, visit the Next.js GitHub repository.

📜 License
This project is licensed under the MIT License. See the LICENSE file for details.

<p align="center"> <strong>Happy coding, and welcome to the ProjecTree community! 🌳</strong> </p> <p align="center"> <a href="https://github.com/meghrajjare5273/projectree/stargazers"> <img src="https://img.shields.io/github/stars/meghrajjare5273/projectree?style=social" alt="GitHub stars"/> </a> <a href="https://github.com/meghrajjare5273/projectree/network"> <img src="https://img.shields.io/github/forks/meghrajjare5273/projectree?style=social" alt="GitHub forks"/> </a> </p>