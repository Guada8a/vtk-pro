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

    console.log('\x1b[44m📦 Creating folder structure...\x1b[0m');

    // Estructura de carpetas
    const folders = [
      'src/api',
      'src/assets/images',
      'src/assets/fonts',
      'src/constants',
      'src/components',
      'src/hooks',
      'src/interfaces',
      'src/layouts',
      'src/pages',
      'src/router',
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
        if (!folder.includes('assets')) {
          const fileType = ['api', 'hooks', 'interfaces', 'utils'].some(dir => folder.includes(dir)) ? 'index.ts' : 'index.tsx';
          fs.writeFileSync(path.join(folderPath, fileType), '');
        }
      }
    });

    console.log('\x1b[44m📦 Creating files...\x1b[0m');

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

    // Agregar la base en tsconfig.app.json
    const tsConfigPath = path.join(process.cwd(), 'tsconfig.app.json');

    if (fs.existsSync(tsConfigPath)) {
      try {
        // Leer el archivo existente
        let tsConfigContent = fs.readFileSync(tsConfigPath, 'utf8');
        let tsConfigJson = JSON.parse(tsConfigContent);

        // Solo agregar o actualizar las propiedades que necesitamos
        if (!tsConfigJson.compilerOptions) {
          tsConfigJson.compilerOptions = {};
        }

        tsConfigJson.compilerOptions.baseUrl = ".";
        tsConfigJson.compilerOptions.paths = {
          "@/*": ["src/*"]
        };

        // Guardar el archivo con las modificaciones
        fs.writeFileSync(tsConfigPath, JSON.stringify(tsConfigJson, null, 2));
        console.log('✅ Archivo tsconfig.app.json actualizado correctamente.');
      } catch (error) {
        console.error('Error al procesar el archivo tsconfig.app.json:', error);
      }
    } else {
      console.error('El archivo tsconfig.app.json no existe.');
    }

    // Modificar vite.config.ts si existe
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



    // ================== index.tsx ==================
    console.log('📦 Installing dependencies...');
    // Instalar dependencias
    await executeCommand('npm', ['install']);
    console.log('⏳ Installing axios...');
    await executeCommand('npm', ['install', 'axios']);
    // Instalar antd --save
    console.log('⏳ Installing Ant Design...');
    await executeCommand('npm', ['install', 'antd', 'less', 'less-loader', '--save']);
    // Instalar react-router@latest
    console.log('⏳ Installing react-router@latest...');
    await executeCommand('npm', ['install', 'react-router@latest']);
    // npm install tailwindcss @tailwindcss/vite
    console.log('⏳ Installing tailwindcss...');
    await executeCommand('npm', ['install', 'tailwindcss', '@tailwindcss/vite']);
    // npm install dayjs
    console.log('⏳ Installing dayjs...');
    await executeCommand('npm', ['install', 'dayjs']);
    // npm install kamey-components
    console.log('⏳ Installing kamey-components...');
    await executeCommand('npm', ['install', 'kamey-components@latest']);



    console.log('\x1b[32m🎉 Project created successfully!\x1b[0m');
    console.log('\n\x1b[34m🚀 To get started:\x1b[0m');
    console.log(`\n\x1b[33m📂 1. cd ${projectName}\x1b[0m`);
    console.log('\x1b[35m⚡ 2. npm run dev\x1b[0m');
    console.log('\n\x1b[36mHappy coding! 😃\x1b[0m');

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

createProject();