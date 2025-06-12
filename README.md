

# Play Browser Mini Games

**Website:** [playbrowserminigames.com](https://playbrowserminigames.com)

A modern, SEO-optimized platform for free online browser games built with Next.js 15 + React 19 + TypeScript + Tailwind CSS.

## 🎮 Project Overview

Play Browser Mini Games is a comprehensive games aggregation platform that allows users to discover and play thousands of free online games directly in their browser - no downloads required.

### ✨ Key Features

- **9,900+ Games**: Curated collection of high-quality browser games
- **Instant Play**: No downloads or installations required
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **SEO Optimized**: Built for maximum search engine visibility
- **Multi-language Support**: International audience ready
- **Fast Performance**: Optimized for speed and user experience

### 🛠 Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS v4, Lucide Icons
- **Build**: PostCSS, ES6+ with modern bundling
- **SEO**: Structured data, optimized meta tags, sitemap generation

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm/yarn/pnpm

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd play-browser-mini-games

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run test:crawler # Test game data crawler
```

## 📁 Project Structure

```
src/
├── app/                 # Next.js App Router
│   ├── layout.tsx      # Root layout
│   ├── page.tsx        # Homepage
│   └── globals.css     # Global styles
├── components/         # React components
│   ├── layout/         # Layout components (Header, Footer)
│   ├── sections/       # Page sections (Hero, Games)
│   └── ui/             # Reusable UI components
├── lib/               # Utilities and helpers
└── data/              # Game data and configurations
```

## 🎯 Development Roadmap

- [x] **Phase 1**: Environment Setup & Configuration
- [x] **Phase 2**: Data Processing & Game Collection
- [x] **Phase 3**: URL Structure & SEO Foundation
- [x] **Phase 4.1**: Homepage Layout Components ✅
- [ ] **Phase 4.2**: Homepage Functionality
- [ ] **Phase 5**: Game Detail Pages
- [ ] **Phase 6**: Category & Search Pages
- [ ] **Phase 7**: Performance & SEO Optimization

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_SITE_URL=https://playbrowserminigames.com
NEXT_PUBLIC_GAMES_API_URL=your_games_api_url
```

### Image Domains

Configure allowed image domains in `next.config.ts`:

```typescript
images: {
  remotePatterns: [
    {
      protocol: 'https',
      hostname: 'img.gamedistribution.com',
    },
    {
      protocol: 'https', 
      hostname: 'images.unsplash.com',
    },
  ],
}
```

## 📊 SEO & Performance

- **Lighthouse Score**: 95+ (Performance, Accessibility, SEO)
- **Core Web Vitals**: Optimized for Google ranking factors
- **Structured Data**: JSON-LD for rich search results
- **Meta Tags**: Dynamic, game-specific SEO optimization

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🌐 Links

- **Website**: [playbrowserminigames.com](https://playbrowserminigames.com)
- **Documentation**: See `/docs` folder for detailed guides
- **Support**: Create an issue for bug reports or feature requests

---

Built with ❤️ for gamers worldwide | © 2025 Play Browser Mini Games
