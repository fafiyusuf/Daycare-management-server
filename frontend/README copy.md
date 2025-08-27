# Next.js TypeScript Tailwind Starter

A modern, production-ready starter template built with Next.js 15, TypeScript, and Tailwind CSS.

## Features

- ⚡ **Next.js 15** - The React framework with App Router
- 🔷 **TypeScript** - Full type safety and excellent IDE support
- 🎨 **Tailwind CSS** - Utility-first CSS framework
- 📱 **Responsive Design** - Mobile-first approach
- 🛠️ **Modern Tooling** - ESLint, PostCSS, and more
- 📦 **pnpm** - Fast, disk space efficient package manager
- 🚀 **Production Ready** - Optimized build and deployment

## Getting Started

### Prerequisites

- Node.js 18.17 or later
- pnpm (recommended) or npm/yarn

### Installation

1. Clone or download this project
2. Install dependencies:

\`\`\`bash
pnpm install
\`\`\`

3. Run the development server:

\`\`\`bash
pnpm dev
\`\`\`

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

\`\`\`
src/
├── app/                 # Next.js App Router pages
│   ├── layout.tsx      # Root layout
│   └── page.tsx        # Home page
├── components/         # Reusable components
│   ├── ui/            # Base UI components
│   ├── Hero.tsx       # Hero section
│   ├── FeatureCards.tsx
│   └── Footer.tsx
├── lib/               # Utility functions
│   └── utils.ts
├── styles/            # Global styles
│   └── globals.css
└── types/             # TypeScript type definitions
    └── index.ts
\`\`\`

## Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm type-check` - Run TypeScript compiler check

## Customization

### Tailwind Configuration

Customize your design system in `tailwind.config.js`:

- Colors, fonts, spacing
- Custom animations and keyframes
- Component classes in `globals.css`

### TypeScript Configuration

The project includes path aliases configured in `tsconfig.json`:

- `@/*` - Maps to `src/*`
- `@/components/*` - Maps to `src/components/*`
- `@/lib/*` - Maps to `src/lib/*`

## Deployment

This project is ready to deploy on Vercel, Netlify, or any platform that supports Next.js.

### Deploy on Vercel

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy with zero configuration

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## License

MIT License - feel free to use this starter for your projects!
