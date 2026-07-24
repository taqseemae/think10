const fs = require('fs');
const path = require('path');

const frontendSrc = path.join(__dirname, '../frontend/src');

function walk(dir) {
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...walk(full));
    else if (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts')) files.push(full);
  }
  return files;
}

const files = walk(frontendSrc);
let fixedCount = 0;

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  const original = content;

  // 1. Remove createFileRoute imports (entire line or from named import list)
  content = content.replace(/import\s*\{[^}]*createFileRoute[^}]*\}\s*from\s*["']next\/navigation["'];?\n?/g, (match) => {
    // Extract other named imports that are still valid
    const others = match
      .match(/\{([^}]*)\}/)?.[1]
      .split(',')
      .map(s => s.trim())
      .filter(s => s && !['createFileRoute', 'Outlet', 'useRouterState', 'redirect', 'notFound'].includes(s));
    
    if (!others || others.length === 0) return '';
    
    // Map remaining imports to correct packages
    const nextNavItems = ['useRouter', 'useParams', 'useSearchParams', 'usePathname', 'notFound'];
    const nextLinkItems = ['Link'];
    
    let result = '';
    const navItems = others.filter(i => nextNavItems.includes(i));
    const linkItems = others.filter(i => nextLinkItems.includes(i));
    const unknown = others.filter(i => !nextNavItems.includes(i) && !nextLinkItems.includes(i));
    
    if (navItems.length > 0) result += `import { ${navItems.join(', ')} } from "next/navigation";\n`;
    if (linkItems.length > 0) result += `import Link from "next/link";\n`;
    
    return result;
  });

  // 2. Remove TanStack @tanstack/react-router imports entirely
  content = content.replace(/import\s*\{[^}]*\}\s*from\s*["']@tanstack\/react-router["'];?\n?/g, '');
  content = content.replace(/import\s*\{[^}]*\}\s*from\s*["']@tanstack\/react-start["'];?\n?/g, '');

  // 3. Fix navigate({ to: "/path" }) → router.push("/path")
  content = content.replace(/navigate\(\{\s*to:\s*["']([^"']+)["']\s*\}\)/g, 'router.push("$1")');

  // 4. Remove Route export lines (export const Route = createFileRoute...)
  content = content.replace(/export const Route = createFileRoute\([^;]+\)\s*\(\{[\s\S]*?\}\);?\n?/g, '');

  // 5. Fix <Link to="..."> -> <Link href="...">
  content = content.replace(/<Link\s+to=/g, '<Link href=');

  // 6. Remove Outlet usage (replace with children or nothing)
  content = content.replace(/<Outlet\s*\/>/g, '{children}');
  content = content.replace(/<Outlet>/g, '');
  content = content.replace(/<\/Outlet>/g, '');

  // 7. Remove useRouterState import usages
  content = content.replace(/const\s+\w+\s*=\s*useRouterState\([^;]*\);\n?/g, '');

  // 8. Add 'use client' if hooks used and not already present
  const hasHooks = /use(State|Effect|Router|Auth|Context|DashboardState|AdminState|ConsultantState|Ref|Callback|Memo)\s*\(/.test(content);
  const hasUseClient = content.startsWith('"use client"');
  if (hasHooks && !hasUseClient && !file.endsWith('layout.tsx')) {
    content = '"use client";\n\n' + content;
  }

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    fixedCount++;
    console.log(`✅ Fixed: ${path.relative(frontendSrc, file)}`);
  }
}

console.log(`\nDone! Fixed ${fixedCount} files.`);
