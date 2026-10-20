/**
 * Script kiểm tra: so sánh tất cả endpoint trong routes với các URL
 * được gọi từ frontend (web, admin, react-native client).
 *
 * Chạy: node scripts/check-endpoints.js
 */

const fs = require('fs');
const path = require('path');

const SERVER = path.join(__dirname, '..');
const ROOT = path.join(SERVER, '..');

// Dùng array để giữ được cả auth.js và oauth.js (cùng mount /api/auth)
const MOUNTS = [
    ['/api/auth', 'auth.js'],
    ['/api/auth', 'oauth.js'],
    ['/api/users', 'users.js'],
    ['/api/products', 'products.js'],
    ['/api/categories', 'categories.js'],
    ['/api/orders', 'orders.js'],
    ['/api/coupons', 'coupons.js'],
    ['/api/payments', 'payments.js'],
    ['/api/admin', 'admin.js'],
    ['/api/branches', 'branches.js'],
    ['/api/product-items', 'productItems.js'],
    ['/api/rentals', 'rentals.js'],
    ['/api/buyback', 'buyback.js'],
    ['/api/posts', 'posts.js'],
    ['/api/consignments', 'consignments.js'],
    ['/api/admin/dashboard', 'dashboard.js'],
];

// Chuẩn hóa: bỏ query string, :param và ${param} -> *
const normalize = (p) => {
    let s = String(p).split('?')[0].trim().replace(/\/+$/, '');
    s = s.replace(/\$\{[^}]+\}/g, '*');      // ${slug}
    s = s.replace(/:[a-zA-Z_]+/g, '*');      // :slug
    return s || '/';
};

const parseRoutes = () => {
    const seen = new Map();

    for (const [mount, file] of MOUNTS) {
        const full = path.join(SERVER, 'src', 'routes', file);
        if (!fs.existsSync(full)) continue;

        const src = fs.readFileSync(full, 'utf8');
        const re = /router\.(get|post|put|patch|delete)\(\s*['"`]([^'"`]*)['"`]/g;
        let m;
        while ((m = re.exec(src)) !== null) {
            const method = m[1].toUpperCase();
            const fullPath = normalize(mount + m[2]);
            const key = method + ' ' + fullPath;

            // Một endpoint có thể được đăng ký nhiều lần (vd /api/admin/dashboard)
            if (!seen.has(key)) {
                seen.set(key, { method, path: fullPath, files: [file] });
            } else {
                seen.get(key).files.push(file);
            }
        }
    }

    return [...seen.values()];
};

const collectCalls = () => {
    const calls = [];
    const targets = [
        { file: path.join(SERVER, 'public', 'index.html'), label: 'web' },
        { file: path.join(SERVER, 'public', 'admin', 'index.html'), label: 'admin' },
        { file: path.join(SERVER, 'public', 'admin', 'login.html'), label: 'admin-login' },
        { file: path.join(ROOT, 'client', 'src', 'config', 'api.ts'), label: 'mobile' },
    ];

    for (const t of targets) {
        if (!fs.existsSync(t.file)) continue;
        const src = fs.readFileSync(t.file, 'utf8');
        const rel = path.relative(ROOT, t.file);

        // api('/foo/bar') — admin panel helper
        const reApi = /\bapi\(\s*['"`]([^'"`]*)['"`]/g;
        let m;
        while ((m = reApi.exec(src)) !== null) {
            calls.push({ label: t.label, raw: m[1], file: rel, line: lineOf(src, m.index) });
        }

        // ${API_URL}/foo  và  ${API_BASE}/foo
        const reTpl = /\$\{(?:API_URL|API_BASE|API)\}([^'"`\s]*)/g;
        while ((m = reTpl.exec(src)) !== null) {
            calls.push({ label: t.label, raw: m[1], file: rel, line: lineOf(src, m.index) });
        }

        // API_URL}/foo  (trong object config, không có $ phía trước)
        const reUrl = /API_URL\}([A-Za-z0-9_\/\-]*)/g;
        while ((m = reUrl.exec(src)) !== null) {
            if (m[1]) {
                calls.push({ label: t.label, raw: m[1], file: rel, line: lineOf(src, m.index) });
            }
        }
    }

    // Loại trùng (cùng label + raw + line)
    const uniq = new Map();
    for (const c of calls) {
        const k = `${c.label}|${c.raw}|${c.line}`;
        if (!uniq.has(k)) uniq.set(k, c);
    }
    return [...uniq.values()];
};

function lineOf(src, idx) {
    return src.slice(0, idx).split('\n').length;
}

const main = () => {
    const routes = parseRoutes();
    const calls = collectCalls();

    const seenCalls = new Set();
    const problems = [];

    for (const call of calls) {
        if (!call.raw || !call.raw.startsWith('/')) continue;

        const key = call.label + '|' + call.raw;
        if (seenCalls.has(key)) continue;
        seenCalls.add(key);

        const full = call.raw.startsWith('/api') ? call.raw : '/api' + call.raw;
        const target = normalize(full);
        const match = routes.find(r => r.path === target);

        if (!match) {
            problems.push({ ...call, reason: 'KHÔNG TỒN TẠI trên backend' });
        }
    }

    console.log(`\n📋 Backend: ${routes.length} endpoints`);
    console.log(`📞 Frontend: ${calls.length} lời gọi\n`);
    console.log('='.repeat(72));

    if (problems.length === 0) {
        console.log('✅ Tất cả endpoint frontend đều tồn tại trên backend!');
    } else {
        console.log(`❌ ${problems.length} endpoint không khớp:\n`);
        for (const p of problems) {
            console.log(`  ${p.file}:${p.line}  [${p.label}]  ${p.raw}`);
            console.log(`      ↳ ${p.reason}\n`);
        }
    }
    console.log('='.repeat(72));
    process.exitCode = problems.length ? 1 : 0;
};

main();