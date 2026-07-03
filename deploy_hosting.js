const fs = require('fs');
const crypto = require('crypto');
const https = require('https');
const zlib = require('zlib');
const path = require('path');

const keyPath = path.join(__dirname, 'clave-firebase.json');
const siteId = 'wallet-dennis';

// Archivos a desplegar
const filesToDeploy = [
    '/index.html',
    '/app.js',
    '/styles.css'
];

function createJWT(serviceAccount) {
    const header = { alg: 'RS256', typ: 'JWT' };
    const now = Math.floor(Date.now() / 1000);
    const claimSet = {
        iss: serviceAccount.client_email,
        scope: 'https://www.googleapis.com/auth/cloud-platform https://www.googleapis.com/auth/firebase',
        aud: serviceAccount.token_uri,
        iat: now,
        exp: now + 3600
    };

    const base64UrlEncode = (obj) => Buffer.from(JSON.stringify(obj)).toString('base64url');
    const unsignedToken = `${base64UrlEncode(header)}.${base64UrlEncode(claimSet)}`;

    const sign = crypto.createSign('RSA-SHA256');
    sign.update(unsignedToken);
    const signature = sign.sign(serviceAccount.private_key, 'base64url');

    return `${unsignedToken}.${signature}`;
}

function httpsRequest(urlStr, options, postData = null) {
    return new Promise((resolve, reject) => {
        const url = new URL(urlStr);
        const reqOptions = {
            hostname: url.hostname,
            port: url.port || 443,
            path: url.pathname + url.search,
            method: options.method || 'GET',
            headers: options.headers || {}
        };

        const req = https.request(reqOptions, (res) => {
            let data = [];
            res.on('data', chunk => data.push(chunk));
            res.on('end', () => {
                const buffer = Buffer.concat(data);
                const text = buffer.toString('utf8');
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    try {
                        resolve(text ? JSON.parse(text) : {});
                    } catch (e) {
                        resolve(text);
                    }
                } else {
                    reject(new Error(`HTTP ${res.statusCode} en ${urlStr}: ${text}`));
                }
            });
        });

        req.on('error', reject);
        if (postData) {
            req.write(postData);
        }
        req.end();
    });
}

async function deploy() {
    console.log('--- INICIANDO DESPLIEGUE A FIREBASE HOSTING ---');
    if (!fs.existsSync(keyPath)) {
        throw new Error('No se encontró clave-firebase.json');
    }
    const keyData = JSON.parse(fs.readFileSync(keyPath, 'utf8'));

    console.log('1. Autenticando Service Account:', keyData.client_email);
    const jwt = createJWT(keyData);
    const tokenData = await httpsRequest(keyData.token_uri, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }, `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`);
    const accessToken = tokenData.access_token;
    console.log('✓ Token obtenido.');

    console.log(`2. Creando nueva versión en el sitio ${siteId}...`);
    const createVerUrl = `https://firebasehosting.googleapis.com/v1beta1/sites/${siteId}/versions`;
    const versionRes = await httpsRequest(createVerUrl, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        }
    }, JSON.stringify({
        config: {
            headers: [
                { glob: "**/*.js", headers: { "cache-control": "no-cache, no-store, must-revalidate" } },
                { glob: "**/*.html", headers: { "cache-control": "no-cache, no-store, must-revalidate" } }
            ]
        }
    }));
    const versionName = versionRes.name;
    console.log('✓ Versión creada:', versionName);

    console.log('3. Comprimiendo y calculando hash de archivos...');
    const fileMap = {};
    const gzipBuffers = {};

    for (const file of filesToDeploy) {
        const filePath = path.join(__dirname, file.substring(1));
        const content = fs.readFileSync(filePath);
        const gzipped = zlib.gzipSync(content);
        const gzhash = crypto.createHash('sha256').update(gzipped).digest('hex');
        fileMap[file] = gzhash;
        gzipBuffers[gzhash] = gzipped;
        console.log(`   - ${file} (${content.length} bytes) -> gzhash: ${gzhash.substring(0, 12)}...`);
    }

    console.log('4. Solicitando URLs de subida (populateFiles)...');
    const popUrl = `https://firebasehosting.googleapis.com/v1beta1/${versionName}:populateFiles`;
    const popRes = await httpsRequest(popUrl, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        }
    }, JSON.stringify({ files: fileMap }));

    const requiredHashes = popRes.uploadRequiredHashes || [];
    console.log(`✓ Archivos requeridos para subir por Firebase: ${requiredHashes.length}`);

    for (const gzhash of requiredHashes) {
        if (!gzipBuffers[gzhash]) {
            console.warn(`Hash desconocido requerido: ${gzhash}`);
            continue;
        }
        console.log(`   Subiendo hash ${gzhash.substring(0, 12)}...`);
        const uploadUrl = `${popRes.uploadUrl}/${gzhash}`;
        await httpsRequest(uploadUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/octet-stream',
                'Content-Length': gzipBuffers[gzhash].length
            }
        }, gzipBuffers[gzhash]);
    }

    console.log('5. Finalizando la versión...');
    const patchUrl = `https://firebasehosting.googleapis.com/v1beta1/${versionName}?updateMask=status`;
    await httpsRequest(patchUrl, {
        method: 'PATCH',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        }
    }, JSON.stringify({ status: 'FINALIZED' }));
    console.log('✓ Versión finalizada.');

    console.log('6. Publicando lanzamiento (Release)...');
    const releaseUrl = `https://firebasehosting.googleapis.com/v1beta1/sites/${siteId}/releases?versionName=${encodeURIComponent(versionName)}`;
    const releaseRes = await httpsRequest(releaseUrl, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        }
    }, JSON.stringify({}));

    console.log('🎉 ¡DESPLIEGUE COMPLETADO EXITOSAMENTE!');
    console.log(`URL en vivo: https://${siteId}.web.app`);
    console.log(`URL alterna: https://${siteId}.firebaseapp.com`);
}

deploy().catch(err => {
    console.error('❌ Error en el despliegue:', err.message || err);
    process.exit(1);
});
