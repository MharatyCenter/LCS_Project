/**
 * سكريبت فحص الملفات غير المستخدمة
 * ------------------------------------------------
 * طريقة التشغيل:
 *   1. افتح Terminal في VS Code (من القائمة: Terminal → New Terminal)
 *   2. تأكد إنك في مجلد المشروع الرئيسي (اللي فيه package.json)
 *   3. اكتب: node find_unused_files.js
 *
 * السكريبت هيدور جوه مجلد src بالكامل، ولكل ملف .tsx أو .ts
 * هيتأكد هل فيه أي ملف تاني بيعمل "import" ليه ولا لأ.
 */

const fs = require('fs');
const path = require('path');

const SRC_DIR = path.join(process.cwd(), 'src');

if (!fs.existsSync(SRC_DIR)) {
  console.error('❌ مش لاقي مجلد src في المكان ده. تأكد إنك شغال السكريبت من مجلد المشروع الرئيسي (project).');
  process.exit(1);
}

// الملفات اللي هنعتبرها "نقطة دخول" ومينفعش نحذفها حتى لو محدش بيستوردها مباشرة
const ENTRY_FILES = ['main.tsx', 'App.tsx', 'index.css', 'vite-env.d.ts'];

function walk(dir, fileList = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath, fileList);
    } else if (/\.(tsx?|jsx?)$/.test(entry.name)) {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

const allFiles = walk(SRC_DIR);

// نجمع كل محتوى الملفات مرة واحدة عشان نبحث فيه بسرعة
const fileContents = {};
for (const file of allFiles) {
  fileContents[file] = fs.readFileSync(file, 'utf8');
}

const results = [];

for (const file of allFiles) {
  const baseName = path.basename(file).replace(/\.(tsx?|jsx?)$/, '');
  if (ENTRY_FILES.includes(path.basename(file))) continue;

  let referencedElsewhere = false;
  let referencingFiles = [];

  for (const otherFile of allFiles) {
    if (otherFile === file) continue;
    const content = fileContents[otherFile];
    // بندور على أي سطر import بيشاور على اسم الملف ده (بأي مسار نسبي)
    const importRegex = new RegExp(`from\\s+['"][^'"]*${baseName}['"]`, 'g');
    if (importRegex.test(content)) {
      referencedElsewhere = true;
      referencingFiles.push(path.relative(SRC_DIR, otherFile));
    }
  }

  results.push({
    file: path.relative(SRC_DIR, file),
    used: referencedElsewhere,
    usedBy: referencingFiles,
  });
}

const unused = results.filter(r => !r.used);
const used = results.filter(r => r.used);

console.log('\n========================================');
console.log('✅ ملفات مستخدمة فعلياً (سيبها زي ما هي):');
console.log('========================================');
used.forEach(r => console.log(`  • ${r.file}`));

console.log('\n========================================');
console.log('🗑️  ملفات غير مستخدمة (آمن تحذفها):');
console.log('========================================');
if (unused.length === 0) {
  console.log('  لا يوجد أي ملف غير مستخدم 🎉');
} else {
  unused.forEach(r => console.log(`  • ${r.file}`));
}

console.log('\n(العدد الكلي: ' + results.length + ' ملف، منهم ' + unused.length + ' غير مستخدم)\n');
