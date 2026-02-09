import crypto from 'crypto';

// Encrypt sensitive data using AES-256-GCM
export function encryptData(data, encryptionKey = process.env.SESSION_SECRET) {
    try {
        const algorithm = 'aes-256-gcm';
        const key = crypto.scryptSync(encryptionKey, 'salt', 32);
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv(algorithm, key, iv);

        let encrypted = cipher.update(data, 'utf8', 'hex');
        encrypted += cipher.final('hex');

        const authTag = cipher.getAuthTag();

        return {
            iv: iv.toString('hex'),
            encryptedData: encrypted,
            authTag: authTag.toString('hex'),
        };
    } catch (error) {
        console.error('Encryption error:', error);
        throw new Error('Failed to encrypt data');
    }
}

// Decrypt sensitive data using AES-256-GCM
export function decryptData(encryptedObject, encryptionKey = process.env.SESSION_SECRET) {
    try {
        const algorithm = 'aes-256-gcm';
        const key = crypto.scryptSync(encryptionKey, 'salt', 32);
        const decipher = crypto.createDecipheriv(
            algorithm,
            key,
            Buffer.from(encryptedObject.iv, 'hex')
        );

        decipher.setAuthTag(Buffer.from(encryptedObject.authTag, 'hex'));

        let decrypted = decipher.update(encryptedObject.encryptedData, 'hex', 'utf8');
        decrypted += decipher.final('utf8');

        return decrypted;
    } catch (error) {
        console.error('Decryption error:', error);
        throw new Error('Failed to decrypt data');
    }
}

// Hash data for verification
export function hashData(data) {
    return crypto.createHash('sha256').update(data).digest('hex');
}
