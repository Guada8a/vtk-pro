#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function createProject() {
    try {
        // Crear proyecto con Vite + TypeScript
        console.log('📦 Creando proyecto con Vite + TypeScript...');
        execSync('npm create vite@latest . -- --template react-ts', { stdio: 'inherit' });

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

        console.log('📁 Creando estructura de carpetas...');
        folders.forEach(folder => {
            const folderPath = path.join(process.cwd(), folder);
            if (!fs.existsSync(folderPath)) {
                fs.mkdirSync(folderPath, { recursive: true });
                // Crear archivo index.ts en cada carpeta
                fs.writeFileSync(path.join(folderPath, 'index.ts'), '');
            }
        });

        console.log('✅ Proyecto creado exitosamente!');
        console.log('\nPara comenzar:');
        console.log('1. npm install');
        console.log('2. npm run dev');

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

createProject();