import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

const startTestServer = async ({ adminToken } = {}) => {
    const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'jobhunter-admin-auth-'));

    process.env.DATA_DIR = dataDir;
    process.env.FRONTEND_URL = 'http://localhost:5173';
    process.env.SESSION_SECRET = 'test-session-secret-with-at-least-32-characters';
    if (adminToken) {
        process.env.ADMIN_TOKEN = adminToken;
    } else {
        delete process.env.ADMIN_TOKEN;
    }

    const { app } = await import(`../index.js?test=${Date.now()}-${Math.random()}`);
    const server = app.listen(0);
    await new Promise((resolve) => server.once('listening', resolve));

    const address = server.address();
    assert(address && typeof address === 'object');

    return {
        baseUrl: `http://127.0.0.1:${address.port}`,
        dataDir,
        close: async () => {
            await new Promise((resolve, reject) => {
                server.close((error) => error ? reject(error) : resolve());
            });
            fs.rmSync(dataDir, { recursive: true, force: true });
        },
    };
};

test('admin endpoints fail closed when ADMIN_TOKEN is missing', async () => {
    const server = await startTestServer();

    try {
        const response = await fetch(`${server.baseUrl}/api/admin/bugs`);
        assert.equal(response.status, 503);
        assert.match(await response.text(), /ADMIN_TOKEN|Admin access is not configured/);
    } finally {
        await server.close();
    }
});

test('admin endpoints reject missing and invalid bearer tokens', async () => {
    const server = await startTestServer({ adminToken: 'correct-token' });

    try {
        const missing = await fetch(`${server.baseUrl}/api/admin/bugs`);
        assert.equal(missing.status, 401);

        const invalid = await fetch(`${server.baseUrl}/api/admin/bugs`, {
            headers: { Authorization: 'Bearer wrong-token' },
        });
        assert.equal(invalid.status, 403);
    } finally {
        await server.close();
    }
});

test('admin endpoints accept valid bearer token', async () => {
    const server = await startTestServer({ adminToken: 'correct-token' });

    try {
        const response = await fetch(`${server.baseUrl}/api/admin/bugs`, {
            headers: { Authorization: 'Bearer correct-token' },
        });

        assert.equal(response.status, 200);
        assert.deepEqual(await response.json(), { bugs: [] });
    } finally {
        await server.close();
    }
});

test('admin screenshot endpoint requires valid bearer token', async () => {
    const server = await startTestServer({ adminToken: 'correct-token' });
    const screenshotsDir = path.join(server.dataDir, 'screenshots');
    const filename = 'bug_screenshot_11111111-1111-4111-8111-111111111111.png';

    fs.writeFileSync(path.join(screenshotsDir, filename), Buffer.from('not-a-real-png'));

    try {
        const noToken = await fetch(`${server.baseUrl}/api/admin/screenshots/${filename}`);
        assert.equal(noToken.status, 401);

        const invalid = await fetch(`${server.baseUrl}/api/admin/screenshots/${filename}`, {
            headers: { Authorization: 'Bearer wrong-token' },
        });
        assert.equal(invalid.status, 403);

        const valid = await fetch(`${server.baseUrl}/api/admin/screenshots/${filename}`, {
            headers: { Authorization: 'Bearer correct-token' },
        });
        assert.equal(valid.status, 200);
        assert.equal(await valid.text(), 'not-a-real-png');
    } finally {
        await server.close();
    }
});
