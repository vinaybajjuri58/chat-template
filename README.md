# Next.js Chat Template

This is a fully functional chat application template built with Next.js, React, TypeScript, and Supabase.

## Setup Instructions

1. Clone this repository
2. Install dependencies: `pnpm install`
3. Create a `.env.local` file with the following variables:

   ```
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   NEXT_PUBLIC_SITE_URL=http://localhost:3000

   # OpenAI Configuration
   OPENAI_API_KEY=your-openai-api-key
   OPENAI_MODEL=gpt-3.5-turbo
   OPENAI_SYSTEM_PROMPT="You are a helpful assistant."
   OPENAI_TEMPERATURE=0.7
   OPENAI_MAX_TOKENS=2000
   OPENAI_TIMEOUT=30000
   OPENAI_MAX_RETRIES=3
   ```

4. Get your Supabase credentials:

   - NEXT_PUBLIC_SUPABASE_URL: Your Supabase project URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY: Your public anon key
   - SUPABASE_SERVICE_ROLE_KEY: Your service role key (required for admin operations)
   - NEXT_PUBLIC_SITE_URL: Your site URL (for email verification links)
   - OPENAI_TEMPERATURE: Controls randomness (0-1)
   - OPENAI_MAX_TOKENS: Maximum response length
   - OPENAI_TIMEOUT: Request timeout in milliseconds (default: 30000)
   - OPENAI_MAX_RETRIES: Number of retry attempts (default: 3)

   You can find these in your Supabase dashboard under Project Settings > API.

5. Get your OpenAI API key:

   - OPENAI_API_KEY: Your OpenAI API key
   - OPENAI_MODEL: The model to use (default: gpt-3.5-turbo)
   - OPENAI_SYSTEM_PROMPT: Custom system prompt for the AI
   - OPENAI_TEMPERATURE: Controls randomness (0-1)
   - OPENAI_MAX_TOKENS: Maximum response length
   - OPENAI_TIMEOUT: Request timeout in milliseconds (default: 30000)
   - OPENAI_MAX_RETRIES: Number of retry attempts (default: 3)

   You can find your API key in the [OpenAI dashboard](https://platform.openai.com/api-keys).

6. Run the development server: `pnpm dev`
7. Open [http://localhost:3000](http://localhost:3000) to see the app

## Using pnpm

This project uses [pnpm](https://pnpm.io/) as the package manager. Here are some common commands:

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Run linting
pnpm lint
```

If you don't have pnpm installed, you can install it using:

```bash
npm install -g pnpm
```

## Getting Started

First, run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
