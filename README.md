# vtk-pro

A CLI tool to create a new Vite Typescript project with React.

## Installation

For the best experience, use `npx` to run the CLI tool.

```bash
npx vtk-pro my-app
```

```bash
bunx vtk-pro my-app
```

```bash
pnpm dlx vtk-pro my-app
```

```bash
yarn dlx vtk-pro my-app
```

### Dependencies

This project uses the following dependencies:

* Vite Typescript 6.0.1
* React 18.3.1
* Kamey-Components
* TailwindCSS 4.0.0
* React Router 7
* React Query
* Axios
* Ant Design
* clsx
* dayjs
* env-cmd
* React-Icons
* Framer Motion
* Zustand

### Getting Started

Once the project is installed, the following files need to be configured:

1. **tsconfig.app.json**: Typescript configuration file.

* Add these lines:

```json
  "baseUrl": ".",
  "paths": {
    "@/*": ["src/*"]
  }
```

2. **package.json**: NPM configuration file.

* Add these lines:

```json
  "scripts": {
    "build:qa": "env-cmd -f .env.qa vite build",
    "build:prod": "env-cmd -f .env.prod vite build",
  }
```
