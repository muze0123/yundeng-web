#!/usr/bin/env node

import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const defaultProjectRoot = path.resolve(scriptDir, '..');
const mode = process.argv[2];

if (!['--source', '--dist'].includes(mode)) {
  console.error('用法：node scripts/verify-static.mjs --source [项目目录] | --dist [dist目录]');
  process.exit(2);
}

const targetRoot = path.resolve(process.argv[3] || (mode === '--source' ? defaultProjectRoot : path.join(defaultProjectRoot, 'dist')));
const prototypeRoot = path.join(targetRoot, 'Prototype');
const assetsRoot = path.join(targetRoot, 'src', 'assets');
const errors = [];
let checkedReferenceCount = 0;

const requiredFiles = [
  'index.html',
  'Prototype/index.html',
  'Prototype/系统框架.html',
  'Prototype/公共导航.js',
  'Prototype/公共导航.css',
  'Prototype/首页.html',
  'src/assets/styles/global.css'
];

function toRelative(filePath) {
  return path.relative(targetRoot, filePath) || '.';
}

function addError(message) {
  errors.push(message);
}

function isFile(filePath) {
  return fs.existsSync(filePath) && fs.statSync(filePath).isFile();
}

function walk(directory) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const entryPath = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(entryPath) : [entryPath];
  });
}

function stripQueryAndHash(reference) {
  return reference.split('#', 1)[0].split('?', 1)[0];
}

function decodeReference(reference) {
  try {
    return decodeURIComponent(reference);
  } catch {
    return reference;
  }
}

function shouldSkipReference(reference) {
  return !reference
    || reference.startsWith('#')
    || reference.startsWith('//')
    || /^[a-z][a-z0-9+.-]*:/i.test(reference)
    || reference.includes('${')
    || reference.includes('{{')
    || reference.includes('<%');
}

function verifyReference(sourceFile, rawReference) {
  const normalized = rawReference.trim().replace(/^['"]|['"]$/g, '').replaceAll('&amp;', '&');
  if (shouldSkipReference(normalized)) return;

  const referencePath = decodeReference(stripQueryAndHash(normalized));
  if (!referencePath) return;

  const resolved = referencePath.startsWith('/')
    ? path.resolve(targetRoot, `.${referencePath}`)
    : path.resolve(path.dirname(sourceFile), referencePath);

  checkedReferenceCount += 1;
  if (!resolved.startsWith(`${targetRoot}${path.sep}`) && resolved !== targetRoot) {
    addError(`${toRelative(sourceFile)} 引用了发布目录外的路径：${rawReference}`);
    return;
  }
  if (!fs.existsSync(resolved)) {
    addError(`${toRelative(sourceFile)} 缺少本地资源：${rawReference}`);
  }
}

requiredFiles.forEach(relativePath => {
  const absolutePath = path.join(targetRoot, relativePath);
  if (!isFile(absolutePath)) addError(`缺少必需文件：${relativePath}`);
});

const textFiles = [
  ...walk(prototypeRoot),
  ...walk(assetsRoot).filter(filePath => /\.(?:css|js)$/i.test(filePath)),
  path.join(targetRoot, 'index.html')
].filter(filePath => isFile(filePath) && /\.(?:html|css|js)$/i.test(filePath));

const tagPattern = /<[A-Za-z][^>]*>/g;
const attributePattern = /\b(?:src|href|poster)\s*=\s*["']([^"'<>]+)["']/gi;
const cssUrlPattern = /url\(\s*([^)]+?)\s*\)/gi;
const quotedRuntimeReferencePattern = /(["'`])((?:\.{0,2}\/|\/)?[^"'`\r\n<>]*\.(?:html|css|js|png|jpe?g|webp|gif|svg|ico|woff2?|ttf|otf)(?:[?#][^"'`\r\n<>]*)?)\1/gi;
const fullPhonePattern = /(?<!\d)1[3-9]\d{9}(?!\d)/g;
const rawPublicIpPattern = /(?<![\d*])(?:(?:1\d{2}|2[0-4]\d|25[0-5]|[1-9]?\d)\.){3}(?:1\d{2}|2[0-4]\d|25[0-5]|[1-9]?\d)(?![\d*])/g;
const networkFieldPattern = /\b(?:ip|endpoint|proxyInfo)\s*:\s*['"]([^'"]+)['"]/g;
const absoluteLocalPathPattern = /file:\/\/\/(?:Users|home)\/|\/(?:Users|home)\/[A-Za-z0-9._-]+\//g;
const documentationIpRanges = [
  /^192\.0\.2\./,
  /^198\.51\.100\./,
  /^203\.0\.113\./
];
const privateIpRanges = [
  /^10\./,
  /^127\./,
  /^169\.254\./,
  /^172\.(?:1[6-9]|2\d|3[01])\./,
  /^192\.168\./
];

for (const filePath of textFiles) {
  const contents = fs.readFileSync(filePath, 'utf8');
  let match;

  if (filePath.endsWith('.html')) {
    const scriptlessContents = contents.replace(/(<script\b[^>]*>)[\s\S]*?<\/script>/gi, '$1</script>');
    const tagMarkup = scriptlessContents
      .replace(/(<style\b[^>]*>)[\s\S]*?<\/style>/gi, '$1</style>');
    for (const tag of tagMarkup.match(tagPattern) || []) {
      attributePattern.lastIndex = 0;
      while ((match = attributePattern.exec(tag))) verifyReference(filePath, match[1]);
    }
    const styleBlocks = [...scriptlessContents.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)].map(item => item[1]);
    for (const styleBlock of styleBlocks) {
      cssUrlPattern.lastIndex = 0;
      while ((match = cssUrlPattern.exec(styleBlock))) verifyReference(filePath, match[1]);
    }

    const scriptBlocks = [...contents.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)].map(item => item[1]);
    for (const scriptBlock of scriptBlocks) {
      quotedRuntimeReferencePattern.lastIndex = 0;
      while ((match = quotedRuntimeReferencePattern.exec(scriptBlock))) {
        const runtimeReference = match[2];
        // Asset names in data objects (for example `create_form.png`) are
        // resolved by the module at runtime; the onboarding hash manifest
        // validates those files separately.
        if (/\.(?:png|jpe?g|webp|gif|svg|ico)$/i.test(runtimeReference) && !runtimeReference.includes('/')) continue;
        verifyReference(filePath, runtimeReference);
      }
    }
  } else if (filePath.endsWith('.css')) {
    while ((match = cssUrlPattern.exec(contents))) verifyReference(filePath, match[1]);
  } else if (filePath.endsWith('.js')) {
    quotedRuntimeReferencePattern.lastIndex = 0;
    while ((match = quotedRuntimeReferencePattern.exec(contents))) verifyReference(filePath, match[2]);
  }

  const localPathMatches = [...contents.matchAll(absoluteLocalPathPattern)];
  if (localPathMatches.length) addError(`${toRelative(filePath)} 含本机绝对路径`);

  if (filePath.endsWith('.html')) {
    const phoneMatches = [...contents.matchAll(fullPhonePattern)].map(item => item[0]);
    if (phoneMatches.length) addError(`${toRelative(filePath)} 含未脱敏手机号：${[...new Set(phoneMatches)].join('、')}`);

    const networkValues = [...contents.matchAll(networkFieldPattern)].map(item => item[1]);
    const publicIpMatches = networkValues.flatMap(value => [...value.matchAll(rawPublicIpPattern)].map(item => item[0]))
      .filter(ip => !documentationIpRanges.some(pattern => pattern.test(ip)) && !privateIpRanges.some(pattern => pattern.test(ip)));
    if (publicIpMatches.length) addError(`${toRelative(filePath)} 含非文档网段的公网 IP：${[...new Set(publicIpMatches)].join('、')}`);
  }
}

const navigationPath = path.join(prototypeRoot, '公共导航.js');
if (isFile(navigationPath)) {
  const navigation = fs.readFileSync(navigationPath, 'utf8');
  const routePattern = /href:\s*'([^']+\.html)'/g;
  let match;
  while ((match = routePattern.exec(navigation))) verifyReference(navigationPath, match[1]);
  verifyReference(navigationPath, '编辑浏览器.html');
}

const onboardingPath = path.join(prototypeRoot, '新手引导.html');
if (isFile(onboardingPath)) {
  const onboarding = fs.readFileSync(onboardingPath, 'utf8');
  const assetPattern = /(?:asset|inset):'([^']+)'/g;
  let match;
  while ((match = assetPattern.exec(onboarding))) {
    const assetPath = path.join(assetsRoot, '新手引导', match[1]);
    checkedReferenceCount += 1;
    if (!isFile(assetPath)) addError(`新手引导缺少截图资源：src/assets/新手引导/${match[1]}`);
  }
}

const onboardingHashManifestPath = path.join(defaultProjectRoot, 'scripts', 'onboarding-asset-hashes.json');
if (isFile(onboardingHashManifestPath)) {
  const manifest = JSON.parse(fs.readFileSync(onboardingHashManifestPath, 'utf8'));
  const onboardingAssetRoot = path.join(assetsRoot, '新手引导');
  const manifestNames = new Set(Object.keys(manifest));
  if (fs.existsSync(onboardingAssetRoot)) {
    for (const assetPath of walk(onboardingAssetRoot).filter(filePath => /\.(?:png|jpe?g|webp|gif|svg|ico)$/i.test(filePath))) {
      const assetName = path.relative(onboardingAssetRoot, assetPath);
      if (!manifestNames.has(assetName)) addError(`新手引导截图未登记脱敏哈希：src/assets/新手引导/${assetName}`);
    }
  }
  for (const [assetName, expectedHash] of Object.entries(manifest)) {
    const assetPath = path.join(assetsRoot, '新手引导', assetName);
    if (!isFile(assetPath)) {
      addError(`脱敏截图缺失：src/assets/新手引导/${assetName}`);
      continue;
    }
    const actualHash = crypto.createHash('sha256').update(fs.readFileSync(assetPath)).digest('hex');
    if (actualHash !== expectedHash) addError(`脱敏截图哈希不匹配：src/assets/新手引导/${assetName}`);
  }
} else {
  addError('缺少新手引导截图脱敏哈希清单');
}

const indexPath = path.join(prototypeRoot, 'index.html');
if (isFile(indexPath)) {
  const indexContents = fs.readFileSync(indexPath, 'utf8');
  if (/if\s*\(item\.file\s*===\s*'首页\.html'\)\s*return\s*'首页\.html'/.test(indexContents)) {
    addError('Prototype/index.html 的首页卡片绕过了 SystemFrame 路由');
  }
  if (!indexContents.includes("'首页.html':'home'")) addError('Prototype/index.html 缺少首页到 home 的稳定路由映射');
}

const rootIndexPath = path.join(targetRoot, 'index.html');
if (isFile(rootIndexPath) && !fs.readFileSync(rootIndexPath, 'utf8').includes('Prototype/index.html')) {
  addError('根 index.html 未指向 Prototype/index.html');
}

if (mode === '--dist') {
  const forbiddenPaths = ['PRD', '产品分析', '.git', '.github', '.claude', '.codex', '.env', '.env.local', '.mcp.json', 'AGENTS.md', 'claude.md', 'design.md'];
  forbiddenPaths.forEach(relativePath => {
    if (fs.existsSync(path.join(targetRoot, relativePath))) addError(`发布包不应包含：${relativePath}`);
  });

  const allowedRuntimeExtensions = new Set([
    '.html', '.css', '.js', '.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg', '.ico',
    '.woff', '.woff2', '.ttf', '.otf'
  ]);
  for (const filePath of walk(targetRoot)) {
    const relativePath = toRelative(filePath);
    const pathSegments = relativePath.split(path.sep);
    const isAllowedLocation = relativePath === 'index.html'
      || pathSegments[0] === 'Prototype'
      || relativePath.startsWith(`src${path.sep}assets${path.sep}`);
    const hasHiddenSegment = pathSegments.some(segment => segment.startsWith('.'));
    const extension = path.extname(filePath).toLowerCase();
    if (!isAllowedLocation || hasHiddenSegment || !allowedRuntimeExtensions.has(extension)) {
      addError(`发布包包含未获准的文件：${relativePath}`);
    }
  }
}

if (errors.length) {
  console.error(`静态校验失败（${errors.length} 项）：`);
  errors.forEach(error => console.error(`- ${error}`));
  process.exit(1);
}

const runtimeFileCount = [...walk(prototypeRoot), ...walk(assetsRoot), path.join(targetRoot, 'index.html')]
  .filter(isFile).length;
console.log(`静态校验通过：${mode === '--source' ? '源码' : '发布包'} ${runtimeFileCount} 个文件，核对 ${checkedReferenceCount} 个本地引用。`);
