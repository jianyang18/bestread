# bestread

[![JavaScript](https://img.shields.io/badge/language-JavaScript-yellow?style=flat-square&logo=javascript)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Next.js](https://img.shields.io/badge/framework-Next.js-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/ui-TailwindCSS-38bdf8?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)

## Overview

**bestread** is an MVC web application for tracking your reading journey. It enables users to add, edit, and manage their book library, complete with onboarding for new users and secure OTP-based authentication. Built with Next.js, Supabase, and a modern UI powered by Radix UI and Tailwind CSS, bestread offers a seamless and customizable book management experience.

## Tech Stack

- **Languages**: JavaScript, CSS
- **Frameworks**: [Next.js](https://nextjs.org/), [Tailwind CSS](https://tailwindcss.com/)
- **UI Libraries**:
  - [Radix UI](https://www.radix-ui.com/)
  - [Lucide React](https://lucide.dev/)
- **Backend & Auth**:
  - [Supabase](https://supabase.com/)
- **Other Key Libraries**:
  - [Zod](https://zod.dev/) (validation)
  - [clsx](https://github.com/lukeed/clsx), [class-variance-authority](https://cva.style/)
  - [sonner](https://sonner.emilkowal.ski/), [@vercel/analytics](https://vercel.com/analytics)

## Prerequisites

- **Node.js** (v16 or higher recommended)
- **npm** or **yarn**
- [Supabase](https://supabase.com/) project and credentials

## Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/jianyang18/bestread.git
   cd bestread
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   ```

3. **Configure Supabase**
   - Create a `.env.local` file in the root directory.
   - Set your Supabase credentials:
     ```
     NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
     ```

4. **(Optional) Configure additional environment variables** as needed.

## Usage

- **Start the development server**

  ```bash
  npm run dev
  # or
  yarn dev
  ```

- **Build for production**

  ```bash
  npm run build
  # or
  yarn build
  ```

- **Start production server**

  ```bash
  npm start
  # or
  yarn start
  ```

- **Lint the codebase**
  ```bash
  npm run lint
  # or
  yarn lint
  ```

Navigate to [http://localhost:3000](http://localhost:3000) to access the app.

## Project Structure

```
.
├── actions/                # Server actions for book management and authentication
│   ├── add-book.action.js
│   ├── delete-book.action.js
│   ├── edit-book.action.js
│   ├── log-out.action.js
│   ├── onboarding.action.js
│   ├── safe-action.js
│   ├── schema.js
│   └── verify-otp.action.js
├── app/                    # Next.js app directory (routing, pages, layouts)
│   ├── [username]/         # User-specific pages
│   ├── add-book/           # Add book page
│   ├── book-tracking-app/  # Main app page
│   ├── login/              # Login page
│   ├── onboarding/         # User onboarding
│   ├── globals.css         # Global styles
│   ├── layout.js           # Root layout
│   └── page.js             # Entry point
├── components/             # Reusable React components
│   ├── add-book-client-page.jsx
│   ├── add-book-dialog.jsx
│   ├── edit-book-dialog.jsx
│   ├── library-view.jsx
│   ├── theme-toggle.jsx
│   └── ui/                 # UI primitives (badge, button, dialog, etc.)
├── lib/
│   ├── supabase/           # Supabase client and server utilities
│   ├── upload-cover.js     # File upload logic
│   └── utils.js
├── public/                 # Static assets
├── middleware.js
├── next.config.mjs
├── package.json
└── ...
```

## API Endpoints

| Method | Endpoint             | Description                    |
| ------ | -------------------- | ------------------------------ |
| POST   | `/add-book`          | Add a new book                 |
| PUT    | `/edit-book`         | Edit an existing book          |
| DELETE | `/delete-book`       | Delete a book                  |
| POST   | `/log-out`           | Log out the user               |
| POST   | `/verify-otp`        | Verify one-time password (OTP) |
| GET    | `/[username]`        | Get user-specific page         |
| GET    | `/add-book`          | Get add book page              |
| GET    | `/book-tracking-app` | Main book tracking app page    |
| GET    | `/login`             | Get login page                 |
| GET    | `/onboarding`        | Get onboarding page            |

## Contributing

Contributions are welcome!  
Please follow the standard GitHub workflow:

1. **Fork** this repository
2. **Create a feature branch** (`git checkout -b feature/your-feature`)
3. **Commit your changes**
4. **Push to your fork** (`git push origin feature/your-feature`)
5. **Open a Pull Request** against the `main` branch

## License

**License not specified.**  
Please contact the repository owner for licensing details.

---

[![README powered by ReadmeAI](https://img.shields.io/badge/README-powered%20by%20ReadmeAI-4c9be8?style=flat-square&logo=markdown)](https://www.readmeai.in)
