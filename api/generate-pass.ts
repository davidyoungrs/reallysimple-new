import { db } from '../src/db/index.js';
import { businessCards } from '../src/db/schema.js';
import { eq } from 'drizzle-orm';
import { PKPass } from 'passkit-generator';
import fs from 'fs';
import path from 'path';

// Load certs from local file system (in a real app these would be secrets/env vars)
const CERT_DIR = path.join(process.cwd(), 'certs');

import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Check if it's a standard Request object or Node request
    if (req.method !== 'GET') {
        return res.status(405).send('Method not allowed');
    }

    const host = req.headers.host || 'localhost';
    const protocol = req.headers['x-forwarded-proto'] || 'http';
    const url = new URL(req.url || '', `${protocol}://${host}`);
    const slug = url.searchParams.get('slug') || req.query.slug as string;

    if (!slug) {
        return res.status(400).send('Missing slug');
    }

    try {
        // 1. Fetch Card Data
        const cards = await db
            .select()
            .from(businessCards)
            .where(eq(businessCards.slug, slug))
            .limit(1);

        if (cards.length === 0) {
            return res.status(404).send('Card not found');
        }

        const card = cards[0];
        const data = card.data as any;

        // 2. Create Pass
        // PRIORITY: Check Environment Variables first (Production/Cloudflare)
        // FALLBACK: Read from local filesystem (Local Dev)

        // Helper to get cert content
        const getCertContent = (envVar: string, fileName: string) => {
            if (process.env[envVar]) {
                // Handle potential escaped newlines in env vars
                return process.env[envVar]!.replace(/\\n/g, '\n');
            }
            // Fallback to local file
            if (fs.existsSync(path.join(CERT_DIR, fileName))) {
                return fs.readFileSync(path.join(CERT_DIR, fileName), 'utf8');
            }
            throw new Error(`Missing certificate: ${fileName} or env var ${envVar}`);
        };

        const certs = {
            wwdr: getCertContent('WALLET_WWDR_CERT', 'wwdr.pem'),
            signerCert: getCertContent('WALLET_SIGNER_CERT', 'signerCert.pem'),
            signerKey: getCertContent('WALLET_SIGNER_KEY', 'signerKey.pem'),
        };

        const pass = await PKPass.from(
            {
                model: path.join(process.cwd(), 'certs', 'model.pass'),
                certificates: certs,
            },
            {
                serialNumber: card.uid,
                description: 'Digital Business Card',
                logoText: 'Really Simple Apps',
                organizationName: 'Really Simple Apps',
                passTypeIdentifier: 'pass.com.reallysimpleapps.card',
                teamIdentifier: '8V4W89YADM',
                backgroundColor: 'rgb(255,255,255)',
                foregroundColor: 'rgb(0,0,0)',
                labelColor: 'rgb(0,0,0)',
            }
        );

        pass.type = 'storeCard';

        // Add Fields - access the array directly and push? 
        // Checking library source/types: it seems strictly typed or array.
        // pass.primaryFields is an array in some versions.
        // Let's safe check and push.

        pass.primaryFields.push({
            key: 'name',
            label: 'Name',
            value: data.fullName || data.name || 'Your Name',
        });

        if (data.jobTitle) {
            pass.secondaryFields.push({
                key: 'role',
                label: 'Role',
                value: data.jobTitle,
            });
        }

        if (data.company) {
            pass.secondaryFields.push({
                key: 'company',
                label: 'Company',
                value: data.company,
            });
        }

        // Add QR Code
        const publicUrl = `${protocol}://${host}/card/${slug}?src=wallet`;
        pass.setBarcodes({
            format: 'PKBarcodeFormatQR',
            message: publicUrl,
            messageEncoding: 'utf-8',
        });

        // 3. Generate Stream
        // 5. Generate and Send
        console.log('Generating pass buffer...');
        const buffer = pass.getAsBuffer();
        console.log('Buffer generated. Size:', buffer.length);

        res.setHeader('Content-Type', 'application/vnd.apple.pkpass');
        res.setHeader('Content-Disposition', `attachment; filename=${slug}.pkpass`);
        res.status(200).send(buffer);

    } catch (error: any) {
        console.error('Pass Generation Error:', error);
        return res.status(500).send(`Error generating pass: ${error.message}`);
    }
}
