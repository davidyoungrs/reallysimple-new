import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleAuth } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import { db } from '../src/db';
import { businessCards } from '../src/db/schema';
import { eq } from 'drizzle-orm';

// ... (Environment variables check remains the same)

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // ... (CORS headers remain the same)

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (!ISSUER_ID || !SERVICE_ACCOUNT_EMAIL || !PRIVATE_KEY) {
        console.error("Missing Google Wallet credentials");
        return res.status(500).json({ error: 'Missing server configuration (Google Wallet)' });
    }

    const { slug } = req.body;

    if (!slug) {
        return res.status(400).json({ error: 'Missing slug' });
    }

    try {
        console.log(`Generating Google Wallet pass for slug: ${slug}`);

        // 1. Fetch Card Data
        // uses 'businessCards' table, not 'cards'
        const cardData = await db.select().from(businessCards).where(eq(businessCards.slug, slug)).limit(1);

        if (!cardData || cardData.length === 0) {
            return res.status(404).json({ error: 'Card not found' });
        }

        const record = cardData[0];
        const card = record.data as any; // Cast JSONB data to any or specific type if available

        const classId = `${ISSUER_ID}.contact-tree-standard-v1`;
        const objectId = `${ISSUER_ID}.${slug}-${Date.now()}`; // Unique object ID

        const newPass = {
            iss: SERVICE_ACCOUNT_EMAIL,
            aud: 'google',
            typ: 'savetowallet',
            iat: Math.floor(Date.now() / 1000),
            origins: [],
            payload: {
                genericObjects: [
                    {
                        id: objectId,
                        classId: classId,
                        genericType: 'GENERIC_TYPE_UNSPECIFIED',
                        hexBackgroundColor: card.color_primary || '#4f46e5',
                        logo: {
                            sourceUri: {
                                uri: card.logo_url || 'https://contact-tree.vercel.app/icon.png',
                            },
                            contentDescription: {
                                defaultValue: {
                                    language: 'en-US',
                                    value: 'LOGO',
                                },
                            },
                        },
                        cardTitle: {
                            defaultValue: {
                                language: 'en-US',
                                value: card.company || 'Digital Card',
                            },
                        },
                        header: {
                            defaultValue: {
                                language: 'en-US',
                                value: card.first_name + ' ' + card.last_name,
                            },
                        },
                        subheader: {
                            defaultValue: {
                                language: 'en-US',
                                value: card.job_title || 'Digital Business Card',
                            },
                        },
                        textModulesData: [
                            {
                                header: 'Phone',
                                body: card.phone_numbers ? String(card.phone_numbers[0]?.value || '') : '',
                                id: 'phone',
                            },
                            {
                                header: 'Email',
                                body: card.email || '',
                                id: 'email',
                            },
                            {
                                header: 'Website',
                                body: `https://contact-tree.vercel.app/card/${slug}`,
                                id: 'website',
                            }
                        ],
                        barcode: {
                            type: 'QR_CODE',
                            value: `https://contact-tree.vercel.app/card/${slug}`,
                            alternateText: 'Scan to View',
                        },
                    },
                ],
                // IMPORTANT: We define the class inline so we don't need to make an API call to create it first.
                // This makes the process stateless and faster.
                genericClasses: [
                    {
                        id: classId,
                        classTemplateInfo: {
                            cardTemplateOverride: {
                                cardRowTemplateInfos: [
                                    {
                                        twoItems: {
                                            startItem: {
                                                firstValue: {
                                                    fields: [
                                                        {
                                                            fieldPath: 'object.textModulesData["phone"]',
                                                        },
                                                    ],
                                                },
                                            },
                                            endItem: {
                                                firstValue: {
                                                    fields: [
                                                        {
                                                            fieldPath: 'object.textModulesData["email"]',
                                                        },
                                                    ],
                                                },
                                            },
                                        },
                                    },
                                    {
                                        oneItem: {
                                            item: {
                                                firstValue: {
                                                    fields: [
                                                        {
                                                            fieldPath: 'object.textModulesData["website"]',
                                                        },
                                                    ],
                                                },
                                            }
                                        }
                                    }
                                ],
                            },
                        },
                    },
                ],
            },
        };

        // 3. Sign the JWT
        // Ensure privateKey corresponds to the service account email
        const token = jwt.sign(newPass, PRIVATE_KEY as string, {
            algorithm: 'RS256',
        });

        const saveUrl = `https://pay.google.com/gp/v/save/${token}`;

        return res.status(200).json({ saveUrl });

    } catch (error: any) {
        console.error('Error generating Google Wallet pass:', error);
        return res.status(500).json({ error: 'Failed to generate pass', details: error.message });
    }
}
