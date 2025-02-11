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
    // Crear proyecto Vite
    await executeCommand('npm', ['create', 'vite@latest', '.', '--template', 'react-ts', '--', '--y']);

    console.log('📦 Creating folder structure...');

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
    const tsConfigPath = path.join(process.cwd(), 'tsconfig.json');

    const tsConfig = JSON.parse(fs.readFileSync(tsConfigPath, 'utf8'));
    tsConfig.compilerOptions.baseUrl = './src';
    tsConfig.compilerOptions.paths = {
      '@/*': ['*']
    };

    fs.writeFileSync(tsConfigPath, JSON.stringify(tsConfig, null, 2));

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


    console.log('📦 Installing dependencies...');
    //Mostar mensaje de instalación de dependencias
    console.log('⏳ Installing dependencies...');
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

    console.log('✅ Project created successfully!');
    console.log('\nTo get started:');
    console.log(`1. cd ${projectName}`);
    console.log('2. npm run dev');

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

createProject();