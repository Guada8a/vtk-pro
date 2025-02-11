#!/usr/bin/env node
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Obtener el nombre del proyecto de los argumentos
const projectName = process.argv[2] || 'my-vite-ts';

console.log('🚀 Initializing Vite TypeScript Project...');

// Crear el directorio del proyecto
fs.mkdirSync(projectName);

// Cambiar al directorio del proyecto
process.chdir(projectName);

// Crear proyecto con Vite
exec('npm create vite@latest . -- --template react-ts', (error, stdout, stderr) => {
    if (error) {
        console.error(`Error creating Vite project: ${error}`);
        return;
    }

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
    
    // Instalar dependencias básicas y axios
    exec('npm install && npm install axios', (error, stdout, stderr) => {
        if (error) {
            console.error(`Error installing dependencies: ${error}`);
            return;
        }

        console.log('✅ Project created successfully!');
        console.log('\nTo get started:');
        console.log(`1. cd ${projectName}`);
        console.log('2. npm install');
        console.log('3. npm run dev');
    });
});