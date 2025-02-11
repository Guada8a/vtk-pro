#!/usr/bin/env node
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const projectName = process.argv[2] || 'my-vite-ts';
// Crear el directorio del proyecto
fs.mkdirSync(projectName);

// Cambiar al directorio del proyecto
process.chdir(projectName);

// Función para ejecutar comandos como promesas
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
    await executeCommand('npm', ['init', 'vite@6.0', '.', '--template', 'react-ts', '--', '--y']);

    console.log('📂 Creating folder structure...');

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

    // Crear carpetas
    folders.forEach(folder => {
      const folderPath = path.join(process.cwd(), folder);
      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
        if (!folder.includes('assets') && !folder.includes('components/errors')) {
          const fileType = ['api', 'hooks', 'interfaces', 'utils'].some(dir => folder.includes(dir)) ? 'index.ts' : 'index.tsx';
          fs.writeFileSync(path.join(folderPath, fileType), '');
        }
      }
    });

    console.log('📄 Creating files...');

    // Crear en raíz lo siguiente: // - .env, .env.qa, .env.prod, .gitignore

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
.cache
.env
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
import { theme } from '@/theme/antdTheme';
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

    // ================== theme/antdTheme.ts ==================
    const antdThemePath = path.join(process.cwd(), 'src', 'theme', 'antdTheme.ts');
    const antdThemeContent = 
`export const theme = {
  token: {
    // ==== [ Typography ] ====
    fontFamily: 'Montserrat, sans-serif',
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
    ];
    
    console.log('📦 Starting dependencies installation...\n');
    
    const installDependency = async (dep) => {
      process.stdout.write(`⏳ Installing ${dep.padEnd(30)}`);
      try {
        await executeCommand('npm', ['install', '--silent', ...dep.split(' ')]);
        console.log('✅');
      } catch (error) {
        console.log('❌');
        throw error;
      }
    };
    
    (async () => {
      try {
        for (const dep of dependencies) {
          await installDependency(dep);
        }
        console.log('\n✨ All dependencies have been successfully installed!\n');
      } catch (error) {
        console.log('\n❌ Installation error:', error);
      }
    })();

    console.log('\x1b[32m🎉 Project created successfully!\x1b[0m');
    console.log(`\n\x1b[33m📂 1. cd ${projectName}\x1b[0m`);
    console.log('\x1b[35m⚡ 2. npm run dev\x1b[0m');
    console.log('\n\x1b[36mHappy coding! 😃\x1b[0m');

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

createProject();