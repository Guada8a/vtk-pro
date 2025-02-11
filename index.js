#!/usr/bin/env node
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const projectName = process.argv[2] || 'my-vite-ts';

console.log('🚀 Initializing Vite TypeScript Project...');

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
            'src/components',
            'src/pages',
            'src/services',
            'src/hooks',
            'src/context',
            'src/utils',
            'src/assets/images',
            'src/assets/styles',
            'src/interfaces',
            'src/constants'
        ];

        // Crear carpetas
        folders.forEach(folder => {
            const folderPath = path.join(process.cwd(), folder);
            if (!fs.existsSync(folderPath)) {
                fs.mkdirSync(folderPath, { recursive: true });
                fs.writeFileSync(path.join(folderPath, 'index.ts'), '');
            }
        });

        console.log('📦 Installing dependencies...');
        
        // Instalar dependencias
        await executeCommand('npm', ['install']);
        await executeCommand('npm', ['install', 'axios']);

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