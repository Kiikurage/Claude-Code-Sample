# @app/web

Web frontend application built with React.

## Overview

This is a React-based web application that demonstrates the usage of shared utilities from `@app/common`. The application displays a simple "Hello World" message along with example user data formatted using common utilities.

## Features

- React 18 with TypeScript
- Vite for fast development and optimized production builds
- Integration with `@app/common` for shared utilities and types
- Type-safe development with strict TypeScript configuration
- Unit tests using Bun's built-in test runner
- Hot Module Replacement (HMR) for instant updates during development

## Project Structure

```
packages/web/
├── src/
│   ├── App.tsx           # Main React component
│   ├── index.tsx         # React application entry point
│   ├── utils.ts          # Utility functions using @app/common
│   └── index.test.ts     # Unit tests
├── public/               # Static assets
├── index.html            # HTML entry point (Vite requirement)
├── vite.config.ts        # Vite configuration
├── package.json          # Package configuration
├── tsconfig.json         # TypeScript configuration
└── README.md            # This file
```

## Installation

Install dependencies from the project root:

```bash
bun install
```

## Development

### Running the Development Server

Start the Vite development server with hot module replacement:

```bash
cd packages/web
bun run dev
```

The application will automatically open in your browser at `http://localhost:3000`.

### Building for Production

Build the application for production:

```bash
cd packages/web
bun run build
```

The optimized production build will be generated in the `dist/` directory.

### Preview Production Build

Preview the production build locally:

```bash
cd packages/web
bun run preview
```

The preview server will start at `http://localhost:4173`.

### Running Tests

Run tests for this package:

```bash
cd packages/web
bun test
```

Or run all tests from the project root:

```bash
bun test
```

### Linting

Check code quality:

```bash
cd packages/web
bun run lint
```

### Clean Build Artifacts

Remove the build output directory:

```bash
cd packages/web
bun run clean
```

## Dependencies

- **@app/common**: Shared utilities and types (workspace dependency)
- **react**: React library for building user interfaces
- **react-dom**: React DOM rendering

## Development Dependencies

- **vite**: Fast development server and build tool
- **@vitejs/plugin-react**: Official Vite plugin for React
- **@types/bun**: TypeScript types for Bun runtime
- **@types/react**: TypeScript types for React
- **@types/react-dom**: TypeScript types for React DOM

## Usage Example

The application demonstrates how to use shared utilities from `@app/common`:

```typescript
import { formatUserName, type User, isValidEmail } from "@app/common";

const user: User = {
  id: "1",
  name: "John Doe",
  email: "john@example.com",
  createdAt: new Date(),
};

const formatted = formatUserName(user);
const isValid = isValidEmail(user.email);
```

## Testing

The package includes comprehensive unit tests that verify:

- User creation with valid email addresses
- Email validation using `@app/common` utilities
- Unique ID generation for users
- Integration with shared types and functions

## Available Scripts

- `bun run dev` - Start the Vite development server
- `bun run build` - Build the application for production
- `bun run preview` - Preview the production build locally
- `bun run test` - Run unit tests
- `bun run lint` - Check code quality with Biome
- `bun run check` - Check code quality (alias for lint)
- `bun run clean` - Remove build artifacts

## Future Enhancements

- Implement routing (React Router)
- Add more components and features
- Add CSS/styling solution (CSS Modules, Tailwind, etc.)
- Configure additional Vite plugins as needed
