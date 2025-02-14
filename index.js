#!/usr/bin/env node
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const projectName = process.argv[2] || 'my-vite-ts';
let targetDir;

// Check if the target is current directory
if (projectName === '.') {
  targetDir = process.cwd();
  // Get the current directory name as project name
  projectName = path.basename(targetDir);
} else {
  // Create project directory if not using current directory
  targetDir = path.join(process.cwd(), projectName);
  fs.mkdirSync(targetDir);
  // Change to project directory
  process.chdir(targetDir);
}
/*
// Create project directory
fs.mkdirSync(projectName);

// Change to project directory
process.chdir(projectName);
*/

// Function to execute commands as promises
function executeCommand(command, args) {
  return new Promise((resolve, reject) => {
    const childProcess = spawn(command, args, {
      stdio: 'inherit',
      shell: true
    });

    childProcess.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with code ${code}`));
      }
    });
  });
}

async function createProject() {
  try {
    // Crear proyecto Vite con react 19.0.0
    // await executeCommand('npm', ['create', 'vite@latest', '.', '--template', 'react-ts', '--', '--y']);
    //Será vite 6.0.11 por problemas con la versión 19.0.0
    await executeCommand('npm', ['create', 'vite@6.0', '.', '--', '--template', 'react-ts']);
    console.log('\x1b[32m✓ Project created with Vite\x1b[0m');

    // Estructura de carpetas
    const folders = [
      'src/api',
      'src/assets/images',
      'src/assets/fonts',
      'src/constants',
      'src/components/errors',
      'src/hooks',
      'src/interfaces',
      'src/layouts',
      'src/pages',
      'src/router',
      'src/router/loaders',
      'src/store',
      'src/shared/components',
      'src/themes',
      'src/utils',
    ];

    // Dentro de createProject, antes de crear las carpetas y archivos:
    const gray = '\x1b[90m';
    const cyan = '\x1b[36m';
    const green = '\x1b[32m';
    const red = '\x1b[31m';
    const reset = '\x1b[0m';
    const bright = '\x1b[1m';

    // Mostrar mensaje de inicio de creación de estructura
    const createFolderStructure = async (folders) => {

      process.stdout.write(`${cyan}⏳ ${bright}Creating project structure ${reset}${gray}${''.padEnd(35)}${reset}`);

      try {
        // Crear carpetas
        folders.forEach((folder, index) => {
          const folderPath = path.join(process.cwd(), folder);

          if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath, { recursive: true });

            if (!folder.includes('assets') && !folder.includes('components/errors') && !folder.includes('themes')) {
              const fileType = ['api', 'hooks', 'interfaces', 'utils'].some(dir => folder.includes(dir)) ? 'index.ts' : 'index.tsx';
              fs.writeFileSync(path.join(folderPath, fileType), '');
            }
          }
        });
        process.stdout.write(`\r${green}✓ Created project structure ${reset}${gray}${''.padEnd(35)}${reset}\n`);
      } catch (error) {
        process.stdout.write(`\r${red}✗ Failed to create project structure ${reset}${gray}${''.padEnd(35)}${reset}\n`);
        throw error;
      }
    };


    // Llamar a la función createFolderStructure
    await createFolderStructure(folders);

    process.stdout.write(`${cyan}⏳ ${bright}Creating files ${reset}${gray}${''.padEnd(40)}${reset}`);

    try {

      fs.writeFileSync(path.join(process.cwd(), '.env'), '');
      fs.writeFileSync(path.join(process.cwd(), '.env.qa'), '');
      fs.writeFileSync(path.join(process.cwd(), '.env.prod'), '');

      //Crear archivo jsconfig.json
      fs.writeFileSync(path.join(process.cwd(), 'jsconfig.json'), `{
      "compilerOptions": {
        "baseUrl": "./src",
        "paths": {
          "@/*": ["*"]
        }
      }
    }`);

      // Crear archivo .gitignore
      fs.writeFileSync(path.join(process.cwd(), '.gitignore'), `
node_modules
dist
build
.cache
.env
.env.local
`);

      // ================== vite.config.ts ==================
      const viteConfigPath = path.join(process.cwd(), 'vite.config.ts');
      if (fs.existsSync(viteConfigPath)) {
        const viteConfigContent = `
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
})
      `;
        fs.writeFileSync(viteConfigPath, viteConfigContent);
      }

      // ================== App.tsx ==================
      const appPath = path.join(process.cwd(), 'src', 'App.tsx');
      if (fs.existsSync(appPath)) {
        const appContent =
          `import { RouterProvider } from 'react-router';
import { ConfigProvider } from 'antd';
import Routes from '@/router';
import { theme } from '@/themes/antdTheme';
function App() {
  return (
    <>
      <ConfigProvider theme={theme}>
        <RouterProvider router={Routes} />
      </ConfigProvider>
    </>
  )
}
export default App`;
        fs.writeFileSync(appPath, appContent);
      }

      // tsconfig.app.json
      const tsconfigAppPath = path.join(process.cwd(), 'tsconfig.app.json');
      if (fs.existsSync(tsconfigAppPath)) {
        const tsconfigAppContent = `
      {
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.app.tsbuildinfo",
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    },

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedSideEffectImports": true
  },
  "include": ["src"]
}
      `;
        fs.writeFileSync(tsconfigAppPath, tsconfigAppContent);
      }

      // ================== page/index.tsx ==================
      const indexPath = path.join(process.cwd(), 'src', 'pages', 'index.tsx');
      if (fs.existsSync(indexPath)) {
        const indexContent =
          `const Home = () => {
  return (
    <div>
      <h1 className="text-4xl font-bold text-center">Hello World</h1>
    </div>
  )
}

export default Home`;
        fs.writeFileSync(indexPath, indexContent);
      }

      // ================== api/index.ts ==================
      const apiPath = path.join(process.cwd(), 'src', 'api', 'index.ts');
      if (fs.existsSync(apiPath)) {
        const apiContent =
          `import { ApiVersioning } from "kamey-components";

const api = new ApiVersioning("url");
const apiV1 = api.getInstance("v1");

/**
 * api example
 */
export const getExample = async () => {
  const response = await apiV1.get("/example");
  return response.data;
};
`;
        fs.writeFileSync(apiPath, apiContent);
      }

      // ================== router/index.tsx ==================
      const routerPath = path.join(process.cwd(), 'src', 'router', 'index.tsx');
      if (fs.existsSync(routerPath)) {
        const routerContent =
          `import { createHashRouter } from 'react-router';
import { ErrorBoundary } from '@/components/errors/ErrorBoundry';
import { CustomError } from '@/components/errors/CustomError';
import Home from '../pages';

const Routes = createHashRouter([
  {
    path: "/404",
    element: <CustomError />,
    errorElement: <ErrorBoundary />
  },
  {
    path: "/",
    element: (
      <div>
        <h1 className="text-4xl font-bold text-center">Hello World</h1>
      </div>
    ),
    errorElement: <ErrorBoundary />,
    children: [
      {
        path: "/",
        element: <Home />
      }
    ]
  }
], {
  future: {
    v7_relativeSplatPath: true,
    v7_startTransition: true,
    v7_fetcherPersist: true,
    v7_normalizeFormMethod: true,
    v7_skipActionErrorBvalidation: true,
    v7_partialHydration: true,
  }
});

export default Routes;
      `;
        fs.writeFileSync(routerPath, routerContent);
      }

      // ================== CustomError.tsx ==================
      const errorPath = path.join(process.cwd(), 'src', 'components', 'errors', 'CustomError.tsx');
      const errorContent = `
import { FC, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { BiErrorCircle, BiHome } from 'react-icons/bi';
import { IoMdArrowRoundBack } from 'react-icons/io';
import { motion } from 'framer-motion';

interface CustomErrorProps {
title?: string;
status?: string;
message?: string;
subtitle?: string;
redirectTo?: string;
primaryColor?: keyof typeof colorMap;
showHomeButton?: boolean;
}

// The color mapping has been simplified to focus on light theme colors
const colorMap = {
'azure': {
  primary: '#cb2256',
  secondary: '#df4372',
  gradient: 'from-azure-500 to-azure-600'
},
'orange_web': {
  primary: '#b6cd32',
  secondary: '#c5d75b',
  gradient: 'from-orange_web-500 to-orange_web-600'
},
'raisin-black': {
  primary: '#272727',
  secondary: '#525252',
  gradient: 'from-raisin-black-500 to-raisin-black-600'
},
'emerald': {
  primary: '#4c3c3d',
  secondary: '#775d5f',
  gradient: 'from-emerald-500 to-emerald-600'
}
} as const;

export const CustomError: FC<CustomErrorProps> = ({
title = 'Lo sentimos, ocurrió un error',
status = '404',
subtitle = 'Página no encontrada',
redirectTo,
message = '',
primaryColor = 'azure',
showHomeButton = true
}) => {
const navigate = useNavigate();

useEffect(() => {
  document.title = \`Error \${status} | \${title}\`;
}, [status, title]);

const handleNavigation = (path?: string) => {
  if (path) {
    navigate(path);
  } else if (typeof redirectTo === 'string') {
    navigate(redirectTo);
  } else {
    navigate(-1);
  }
};

const handleKeyPress = (event: React.KeyboardEvent, path?: string) => {
  if (event.key === 'Enter' || event.key === ' ') {
    handleNavigation(path);
  }
};

return (
  <motion.main 
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.5 }}
    className="min-h-screen flex items-center justify-center p-4"
  >
    <div className="max-w-5xl w-full bg-white/90 backdrop-blur-xs rounded-2xl shadow-2xl p-8 border border-emerald-200">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Main Content Section */}
        <motion.section 
          initial={{ y: 20 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.2 }}
          className="order-2 lg:order-1 space-y-8"
        >
          <div className="space-y-4">
            <motion.h2 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-4xl md:text-5xl font-bold text-raisin-black-500 leading-tight"
            >
              {title}
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-xl text-emerald-500"
            >
              {subtitle}
            </motion.p>
          </div>

          {/* Show error */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex items-center gap-4 text-raisin-black-500 text-lg"
          >
            <span className="text-raisin-black-600 font-bold">Código:</span>
            <span className="text-raisin-black-700">{status}</span><br />
            <span className="text-raisin-black-600 font-bold">Motivo:</span>
            <span className="text-raisin-black-700">{message}</span>
          </motion.div>

          {/* Action Buttons */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleNavigation()}
              onKeyPress={(e) => handleKeyPress(e)}
              className={\`flex items-center justify-center gap-2 px-6 py-3.5 text-white rounded-xl transition-all duration-300 hover:shadow-lg focus:outline-hidden focus:ring-2 focus:ring-offset-2 text-lg bg-\${primaryColor}-500 hover:bg-\${primaryColor}-600\`}
              aria-label="Regresar a la página anterior"
            >
              <IoMdArrowRoundBack className="text-xl transition-transform group-hover:-translate-x-1" />
              <span>Regresar</span>
            </motion.button>

            {showHomeButton && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleNavigation('/')}
                onKeyPress={(e) => handleKeyPress(e, '/')}
                className={\`flex items-center justify-center gap-2 px-6 py-3.5 text-lg border-2 rounded-xl transition-all duration-300 hover:shadow-lg focus:outline-hidden focus:ring-2 focus:ring-offset-2 border-\${primaryColor}-500 text-\${primaryColor}-500\`}
                aria-label="Ir al inicio"
              >
                <BiHome className="text-xl" />
                <span>Ir al inicio</span>
              </motion.button>
            )}
          </motion.div>
        </motion.section>

        {/* Error Illustration */}
        <motion.section 
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
          className="order-1 lg:order-2 flex justify-center items-center"
        >
          <div className="relative inline-block group">
            <BiErrorCircle 
              className={\`text-[200px] md:text-[300px] transition-all duration-300 group-hover:scale-105 text-\${primaryColor}-500 opacity-10\`}
            />
            <motion.div 
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <h1 
                className={\`text-7xl md:text-9xl font-black bg-linear-to-r \${colorMap[primaryColor].gradient} text-transparent bg-clip-text select-none\`}
              >
                {status}
              </h1>
            </motion.div>
          </div>
        </motion.section>
      </div>
    </div>
  </motion.main>
);
};
`;
      if (fs.existsSync(errorPath)) {
        fs.writeFileSync(errorPath, errorContent, 'utf-8');
      } else {
        // Crear archivo CustomError.tsx
        fs.writeFileSync(errorPath, errorContent, 'utf-8');
      }

      // ================== ErrorBoundry.tsx ==================
      const errorBoundryPath = path.join(process.cwd(), 'src', 'components', 'errors', 'ErrorBoundry.tsx');
      const errorBoundryContent = `
import { useRouteError, Navigate } from 'react-router';
import { CustomError } from '@/components/errors/CustomError';

interface RouterError {
message: string;
status?: number;
}

export const ErrorBoundary = () => {
// Type assertion here since useRouteError can return unknown
const error = useRouteError() as RouterError;

console.log(error.message);

if (error.message === 'No hay token') {
  return <Navigate to="/login" replace />;
}

if (error.message === 'No tienes permisos para acceder a esta ruta') {
  return (
    <CustomError 
      title="Error"
      status={error.status?.toString()}
      message={error.message}
      subtitle="No autorizado"
      redirectTo="/dashboard"
    />
  );
}

return (
  <CustomError 
    title="Error"
    status={error.status?.toString()}
    message={error.message}
    subtitle="Algo salió mal"
    redirectTo="/"
  />
);
};
`;
      if (fs.existsSync(errorBoundryPath)) {
        fs.writeFileSync(errorBoundryPath, errorBoundryContent, 'utf-8');
      } else {
        // Crear archivo ErrorBoundry.tsx
        fs.writeFileSync(errorBoundryPath, errorBoundryContent, 'utf-8');
      }

      // ================== themes/antdTheme.ts ==================
      const antdThemePath = path.join(process.cwd(), 'src', 'themes', 'antdTheme.ts');
      const antdThemeContent =
        `export const theme = {
  token: {
    // ==== [ Typography ] ====
    // fontFamily: 'Montserrat, sans-serif',
    borderRadius: 12,
    // fontSize: '16px',
    // ==== [ Colors ] ====
    colorPrimary: '#202636',
    colorSuccess: '#00bd69ff',
    colorTextBase: '#333333ff',
    colorBgBase: '#fff',
  },
  components: {
    Table: {
      headerBg: "#36405cff",
      headerColor: "#FFFFFF",
      headerSortActiveBg: "#36405cff",
      headerSortHoverBg: "#36405cff",
    }
  }
};
`;
      if (fs.existsSync(antdThemePath)) {
        fs.writeFileSync(antdThemePath, antdThemeContent, 'utf-8');
      } else {
        // Crear archivo antdTheme.ts
        fs.writeFileSync(antdThemePath, antdThemeContent, 'utf-8');
      }

      // ================== hooks/useFetchQuery.ts ==================
      const useFetchQueryPath = path.join(process.cwd(), 'src', 'hooks', 'useFetchQuery.ts');
      const useFetchQueryContent =
        `/**
 * Use Fetch Query Hook
 * @param queryKey - The query key.
 * @param queryFn - The query function.
 * @param config - The query configuration.
 * @returns The query result.
 * @template TData - The query data type.
 * @template TError - The query error type.
 * @example
 * const { data, isLoading, error } = useQueryFetch({
 *  queryKey: ['tramites'],
 * queryFn: getTramites,
 * config: {
 * onError: (error: Error) => {
 * notification.error({
 * message: 'Error al cargar trámites',
 * description: error.message,
 * });
 * }
 * }
 * });
 * @see https://tanstack.com/query/latest/docs/framework/react/overview
 */
import { useQuery, useMutation, useQueryClient, QueryKey } from '@tanstack/react-query';

type QueryConfig<TData, TError> = {
  enabled?: boolean;
  retry?: boolean | number;
  staleTime?: number;
  cacheTime?: number;
  onSuccess?: (data: TData) => void;
  onError?: (error: TError) => void;
};

type MutationConfig<TData, TError, TVariables> = {
  onSuccess?: (data: TData) => void;
  onError?: (error: TError) => void;
  onMutate?: (variables: TVariables) => void;
  onSettled?: (data: TData | undefined, error: TError | null) => void;
};

export const useQueryFetch = <TData, TError = Error>({
  queryKey,
  queryFn,
  config = {}
}: {
  queryKey: QueryKey;
  queryFn: () => Promise<TData>;
  config?: QueryConfig<TData, TError>;
}) => {
  return useQuery<TData, TError>({
    queryKey,
    queryFn,
    ...config
  });
};

export const useMutationFetch = <TData, TError = Error, TVariables = unknown>({
  queryKey,
  mutationFn,
  config = {}
}: {
  queryKey: QueryKey;
  mutationFn: (variables: TVariables) => Promise<TData>;
  config?: MutationConfig<TData, TError, TVariables>;
}) => {
  const queryClient = useQueryClient();

  return useMutation<TData, TError, TVariables>({
    mutationFn,
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
    ...config
  });
};`;

      if (fs.existsSync(useFetchQueryPath)) {
        fs.writeFileSync(useFetchQueryPath, useFetchQueryContent, 'utf-8');
      } else {
        // Crear archivo useFetchQuery.ts
        fs.writeFileSync(useFetchQueryPath, useFetchQueryContent, 'utf-8');
      }

      process.stdout.write(`\r${green}✓ Created files ${reset}${gray}${''.padEnd(40)}${reset}\n`);
    } catch (error) {
      process.stdout.write(`\r${red}✗ Failed to create files ${reset}${gray}${''.padEnd(40)}${reset}\n`);
      throw error;
    }

    const dependencies = [
      'axios',
      'antd',
      'react-router@latest',
      'tailwindcss @tailwindcss/vite',
      'dayjs',
      'kamey-components@latest',
      'framer-motion',
      'react-icons',
      'env-cmd',
      '@tanstack/react-query',
      'clsx',
      'zustand'
    ];

    const COLORS = {
      gray: '\x1b[90m',
      cyan: '\x1b[36m',
      green: '\x1b[32m',
      red: '\x1b[31m',
      reset: '\x1b[0m',
      bright: '\x1b[1m',
      yellow: '\x1b[33m'
    };

    const spinners = {
      dots: {
        frames: ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"],
        interval: 80
      },
      line: {
        frames: ["-", "\\", "|", "/"],
        interval: 130
      },
      star: {
        frames: ["✶", "✸", "✹", "✺", "✹", "✷"],
        interval: 70
      }
    };

    const createSpinner = (type = 'dots') => {
      let currentFrame = 0;
      const spinner = spinners[type];

      return {
        frame: () => spinner.frames[currentFrame],
        next: () => {
          currentFrame = (currentFrame + 1) % spinner.frames.length;
          return spinner.frames[currentFrame];
        },
        interval: spinner.interval
      };
    };

    const installDependency = async (dep, index, total) => {
      const { gray, cyan, green, red, reset } = COLORS;
      const spinner = createSpinner('dots');
      let spinnerInterval;

      // Inicia el mensaje con el spinner
      process.stdout.write(`${gray}[${cyan}${index + 1}/${total}${gray}] ${reset}`);

      // Inicia el spinner
      spinnerInterval = setInterval(() => {
        process.stdout.cursorTo(0);
        process.stdout.write(`${spinner.next()} ${gray}[${cyan}${index + 1}/${total}${gray}] ${reset}Installing ${cyan}${dep}${reset}...`);
      }, spinner.interval);

      try {
        await executeCommand('npm', ['install', '--silent', ...dep.split(' ')]);
        clearInterval(spinnerInterval);
        process.stdout.cursorTo(0);
        process.stdout.clearLine(0);
        console.log(`${green}✓${reset} ${gray}[${green}${index + 1}/${total}${gray}] ${green}Installed ${cyan}${dep}${reset}`);
        return true;
      } catch (error) {
        clearInterval(spinnerInterval);
        process.stdout.cursorTo(0);
        process.stdout.clearLine(0);
        console.log(`${red}✗${reset} ${gray}[${red}${index + 1}/${total}${gray}] ${red}Failed to install ${cyan}${dep}${reset}`);
        return false;
      }
    };

    const main = async () => {
      const { green, red, cyan, bright, reset } = COLORS;

      console.log(`\n${bright}📦 Installing dependencies...${reset}\n`);

      let failures = 0;

      for (let i = 0; i < dependencies.length; i++) {
        const success = await installDependency(dependencies[i], i, dependencies.length);
        if (!success) failures++;
      }

      if (failures === 0) {
        console.log('\n' + '─'.repeat(50));
        console.log(`${green}✨ All dependencies installed successfully! ${reset}`);
        console.log('─'.repeat(50));

        console.log(`\n${bright}Next steps:${reset}`);
        console.log(`  cd ${bright}${projectName}${reset}`);
        console.log(`  ${bright}npm run dev${reset}`);

        console.log(`\n${cyan}Happy coding! 🚀${reset}\n`);
      } else {
        console.log(`\n${red}❌ Installation failed${reset}`);
        console.log(`${red}→ ${failures} package(s) could not be installed${reset}\n`);
        process.exit(1);
      }
    };

    main().catch(error => {
      console.error(`\n${COLORS.red}❌ Installation failed:${COLORS.reset}`, error);
      process.exit(1);
    });
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

createProject();