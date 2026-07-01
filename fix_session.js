const fs = require('fs');

function findFiles(dir, filter) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = dir + '/' + file;
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(findFiles(file, filter));
        } else if (file.endsWith(filter)) {
            results.push(file);
        }
    });
    return results;
}

const files = findFiles('./src/app/api', '.ts');

for (const file of files) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Check if we need to modify
    if (content.includes('getServerSession()')) {
        // Add import
        if (!content.includes('import { authOptions } from')) {
            content = content.replace("import { getServerSession } from \"next-auth/next\";", "import { getServerSession } from \"next-auth/next\";\nimport { authOptions } from \"@/lib/auth\";");
            content = content.replace("import { getServerSession } from 'next-auth/next';", "import { getServerSession } from 'next-auth/next';\nimport { authOptions } from '@/lib/auth';");
        }
        
        // Replace call
        content = content.replace(/getServerSession\(\)/g, "getServerSession(authOptions)");
        
        fs.writeFileSync(file, content, 'utf8');
        console.log(`Updated: ${file}`);
    }
}
