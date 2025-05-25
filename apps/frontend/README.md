# Whisper Wellness - Frontend

A modern React 19.1 application built with Vite, TypeScript, and Tailwind CSS.

## 🚀 Tech Stack

- ⚡ [Vite](https://vitejs.dev/) - Next Generation Frontend Tooling
- ⚛️ [React 19.1](https://react.dev/) - A JavaScript library for building user interfaces
- 💅 [Tailwind CSS](https://tailwindcss.com/) - A utility-first CSS framework
- 🏗️ [TypeScript](https://www.typescriptlang.org/) - TypeScript is a typed superset of JavaScript
- 🧪 [Vitest](https://vitest.dev/) - A Vite-native test runner
- 🧰 [ESLint](https://eslint.org/) - Find and fix problems in your JavaScript code
- 💅 [Stylelint](https://stylelint.io/) - A mighty, modern linter that helps you avoid errors and enforce conventions in your styles

## 📦 Dependencies

### Core
- `react`: ^19.1.0
- `react-dom`: ^19.1.0
- `@types/react`: ^19.0.0
- `@types/react-dom`: ^19.0.0

### Styling
- `tailwindcss`: ^3.4.1
- `autoprefixer`: ^10.4.16
- `postcss`: ^8.4.31
- `tailwind-merge`: ^2.2.1
- `@tailwindcss/typography`: ^0.5.10
- `tailwindcss-animate`: ^1.0.7

### Development
- `vite`: ^5.1.0
- `@vitejs/plugin-react`: ^4.2.1
- `vite-tsconfig-paths`: ^4.3.1
- `typescript`: ^5.3.3

### Testing
- `vitest`: ^1.2.2
- `@testing-library/react`: ^15.0.6
- `@testing-library/jest-dom`: ^6.4.2
- `@testing-library/user-event`: ^14.5.2
- `jsdom`: ^24.0.0

### Linting
- `eslint`: ^8.55.0
- `eslint-plugin-react-hooks`: ^4.6.0
- `eslint-plugin-react-refresh`: ^0.4.5
- `@typescript-eslint/eslint-plugin`: ^7.0.0
- `@typescript-eslint/parser`: ^7.0.0
- `stylelint`: ^16.2.1
- `stylelint-config-standard`: ^36.0.0
- `stylelint-order`: ^6.0.3

## 🛠️ Prerequisites

- Node.js 18+ (LTS recommended)
- npm 9+ or pnpm 8+ or yarn 1.22+
- Git

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/your-username/whisper-wellness.git
cd whisper-wellness/apps/frontend
```

### 2. Install dependencies

Using npm:
```bash
npm install
```

Or using pnpm (recommended):
```bash
pnpm install
```

### 3. Start the development server

```bash
npm run dev
```

This will start the development server at http://localhost:3001

> **Note:** If port 3001 is in use, you can specify a different port by modifying the `dev` script in `package.json` or by running `npx vite --port <your-port>`

## 🏗️ Project Structure

```
src/
├── assets/            # Static assets
├── components/         # Reusable UI components
├── hooks/              # Custom React hooks
├── lib/                # Utility functions and configurations
├── pages/              # Page components
├── styles/             # Global styles and CSS modules
├── test/               # Test utilities and configurations
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
├── App.tsx             # Main application component
├── main.tsx            # Application entry point
└── vite-env.d.ts       # Vite environment type definitions
```

## 📝 Available Scripts

- `npm run dev` - Start the development server (runs on port 3001 by default)
- `npm run build` - Build for production
- `npm run preview` - Preview the production build
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run type-check` - Run TypeScript type checking

## 🎨 Styling

This project uses Tailwind CSS for styling. The configuration is set up in `tailwind.config.js` and PostCSS is configured in `postcss.config.js`.

#### CSS Linting

CSS linting is configured via `.stylelintrc.json`. The following Tailwind directives are intentionally ignored:
- `@tailwind`
- `@apply`

#### Customization

To customize the design system, edit the `tailwind.config.js` file:

### Adding a new color

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#3B82F6',
          light: '#60A5FA',
          dark: '#2563EB',
        },
      },
    },
  },
};
```

## 🧪 Testing

Tests are written using Vitest and React Testing Library. Test files should be named `*.test.tsx` or `*.spec.tsx`.

### Example Test

```tsx
// src/components/Button.test.tsx
import { render, screen } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders the button with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
});
```

## 🔧 Configuration

### Vite

Configuration file: `vite.config.ts`

### TypeScript

Configuration file: `tsconfig.json`

### ESLint

Configuration file: `.eslintrc.js`

### Stylelint

Configuration file: `.stylelintrc.json`

## 🔄 Environment Variables

Create a `.env` file in the root of the frontend directory:

```env
VITE_API_URL=http://localhost:3000/api
VITE_APP_TITLE=Whisper Wellness
```

Access environment variables in your code:

```ts
const apiUrl = import.meta.env.VITE_API_URL;
```

## 🚀 Deployment

### Building for Production

```bash
npm run build
```

This will create a `dist` directory with the production build.

### Previewing the Production Build

```bash
npm run preview
```

## 📚 Learn More

- [Vite Documentation](https://vitejs.dev/guide/)
- [React Documentation](https://react.dev/learn)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs/installation)
- [Vitest Documentation](https://vitest.dev/guide/)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
