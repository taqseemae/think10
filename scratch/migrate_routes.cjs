const fs = require('fs');
const path = require('path');

const srcRoutes = path.join(__dirname, '../src/routes');
const destApp = path.join(__dirname, '../frontend/src/app');

// Ensure destination exists
if (!fs.existsSync(destApp)) {
  fs.mkdirSync(destApp, { recursive: true });
}

const files = fs.readdirSync(srcRoutes).filter(f => f.endsWith('.tsx') || f.endsWith('.ts'));

files.forEach(file => {
  if (file === '__root.tsx') return; // skip
  
  let content = fs.readFileSync(path.join(srcRoutes, file), 'utf8');
  
  // 1. Determine destination path
  let destPath = '';
  if (file === 'index.tsx') {
    destPath = path.join(destApp, 'page.tsx');
  } else if (file === 'sitemap[.]xml.ts') {
    destPath = path.join(destApp, 'sitemap.xml', 'route.ts');
  } else {
    // e.g. admin.index.tsx -> admin/page.tsx
    // admin.consultants.tsx -> admin/consultants/page.tsx
    // admin.tsx -> admin/layout.tsx
    const parts = file.replace('.tsx', '').split('.');
    
    let isLayout = false;
    let isIndex = false;
    
    if (parts.length === 1) {
      // admin.tsx -> if there's admin.index.tsx, it's a layout.
      if (fs.existsSync(path.join(srcRoutes, `${parts[0]}.index.tsx`))) {
        destPath = path.join(destApp, parts[0], 'layout.tsx');
      } else {
        // e.g. about.tsx -> about/page.tsx
        destPath = path.join(destApp, parts[0], 'page.tsx');
      }
    } else if (parts[parts.length - 1] === 'index') {
      destPath = path.join(destApp, ...parts.slice(0, -1), 'page.tsx');
    } else {
      // replace $slug with [slug]
      const nextParts = parts.map(p => p.startsWith('$') ? `[${p.slice(1)}]` : p);
      destPath = path.join(destApp, ...nextParts, 'page.tsx');
    }
  }

  // 2. Transform content for TSX components
  if (destPath.endsWith('.tsx')) {
    // Extract component name from Route
    const routeMatch = content.match(/component:\s*([A-Za-z0-9_]+)/);
    let componentName = routeMatch ? routeMatch[1] : null;
    
    // Remove Route export
    content = content.replace(/export\s+const\s+Route\s*=\s*createFileRoute[\s\S]*?\}\);\n?/g, '');
    
    // Replace imports
    content = content.replace(/@tanstack\/react-router/g, 'next/navigation');
    content = content.replace(/import\s*\{\s*Link\s*\}\s*from\s*['"]next\/navigation['"]/g, "import Link from 'next/link'");
    
    // Replace useNavigate with useRouter
    content = content.replace(/useNavigate/g, 'useRouter');
    
    // Convert <Link to="..."> to <Link href="...">
    content = content.replace(/<Link\s+to=/g, '<Link href=');

    if (componentName) {
      // Check if the component is already exported
      if (!content.includes(`export default ${componentName}`) && !content.match(new RegExp(`export\\s+default\\s+(function|const|let|var)\\s+${componentName}`))) {
        content += `\nexport default ${componentName};\n`;
      }
    } else {
        // Find main component heuristically
        const funcMatch = content.match(/function\s+([A-Z][A-Za-z0-9_]+)/);
        if (funcMatch) {
            content += `\nexport default ${funcMatch[1]};\n`;
        }
    }
  }

  // Write file
  const destDir = path.dirname(destPath);
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }
  fs.writeFileSync(destPath, content);
});

console.log('Migration complete');
