import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const globalCss = read('src/assets/styles/global.css');
const publicCss = read('Prototype/公共导航.css');
const design = read('design.md');
const index = read('Prototype/index.html');
const designSystem = read('Prototype/设计系统.html');
const onboarding = read('Prototype/新手引导.html');
const accountSettings = read('Prototype/账号设置.html');
const publicJs = read('Prototype/公共导航.js');

const normalizeFontStack = (value) => value.replace(/\s+/g, ' ').replace(/\s*,\s*/g, ',').trim();
const fontDeclaration = globalCss.match(/--font-sans:\s*([^;]+);/)?.[1];
assert.equal(
  normalizeFontStack(fontDeclaration || ''),
  '-apple-system,BlinkMacSystemFont,"PingFang SC","Hiragino Sans GB","Microsoft YaHei","Helvetica Neue",Helvetica,Arial,sans-serif',
);
assert.doesNotMatch(globalCss, /Source Han Sans SC|@font-face/);
assert.match(globalCss, /body\s*\{[^}]*font-family:\s*var\(--font-sans\)\s*!important;/);
assert.match(globalCss, /-webkit-font-smoothing:\s*antialiased/);
assert.match(globalCss, /-moz-osx-font-smoothing:\s*grayscale/);
assert.match(publicCss, /^@import\s+url\(["']\.\.\/src\/assets\/styles\/global\.css\?v=20260821a["']\);/m);
assert.doesNotMatch(design, /Source Han Sans SC/);
assert.match(index, /href=["']\.\.\/src\/assets\/styles\/global\.css\?v=20260821a["']/);
assert.match(designSystem, /href=["']\.\.\/src\/assets\/styles\/global\.css\?v=20260821a["']/);
assert.match(onboarding, /href=["']\.\.\/src\/assets\/styles\/global\.css\?v=20260821a["']/);
assert.match(designSystem, /new URL\(['"]\.\.\/src\/assets\/styles\/global\.css\?v=20260821a['"], document\.baseURI\)/);
assert.match(accountSettings, /font:\s*700 11px\/1 ['"]JetBrains Mono['"]/);
assert.match(publicJs, /ASSET_VERSION\s*=\s*['"]20260821a['"]/);

const backendPages = fs.readdirSync(path.join(root, 'Prototype'))
  .filter((file) => file.endsWith('.html'))
  .map((file) => path.join('Prototype', file));
for (const file of backendPages) {
  const source = read(file);
  assert.match(source, /(?:公共导航\.css|\.\.\/src\/assets\/styles\/global\.css)\?v=20260821a/);
  if (source.includes('公共导航.css')) {
    assert.match(source, /公共导航\.css\?v=20260821a/);
  }
  if (source.includes('公共导航.js')) {
    assert.match(source, /公共导航\.js\?v=20260821a/);
  }
}

console.log('font contract passed');
