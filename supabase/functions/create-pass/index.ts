import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { PKPass } from "npm:passkit-generator";
import { Buffer } from "node:buffer";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const { fullName, jobTitle, company, email, bio } = await req.json();

        if (!fullName || !email) {
            console.error("Missing required fields: fullName or email");
            throw new Error("Missing required fields: Name and Email are mandatory.");
        }

        console.log(`Generating pass for: ${fullName} (${email})`);

        // Retrieve certificates and keys from environment variables
        const wwdrCert = Deno.env.get("APPLE_WWDR_CERT");
        const signerCert = Deno.env.get("APPLE_SIGNER_CERT");
        const signerKey = Deno.env.get("APPLE_SIGNER_KEY");
        const signerKeyPassphrase = Deno.env.get("APPLE_SIGNER_KEY_PASSPHRASE");
        const teamIdentifier = Deno.env.get("APPLE_TEAM_ID");
        const passTypeIdentifier = Deno.env.get("APPLE_PASS_TYPE_ID");

        if (!wwdrCert || !signerCert || !signerKey || !teamIdentifier || !passTypeIdentifier) {
            console.error("Missing configuration secrets");
            throw new Error("Server configuration error: Missing Apple Wallet certificates.");
        }

        // Decode certs from Base64
        const wwdrBuffer = Buffer.from(wwdrCert, 'base64');
        const signerCertBuffer = Buffer.from(signerCert, 'base64');
        const signerKeyBuffer = Buffer.from(signerKey, 'base64');

        // Initialize the pass
        // Ideally pass a complete template model here if customized.
        const pass = new PKPass(
            {
                model: 'https://github.com/passkit-generator/example-pass-model', // Placeholder
                certificates: {
                    wwdr: wwdrBuffer,
                    signerCert: signerCertBuffer,
                    signerKey: signerKeyBuffer,
                    signerKeyPassphrase: signerKeyPassphrase,
                },
            },
            {
                serialNumber: crypto.randomUUID(),
                description: `Business Card for ${fullName}`,
            }
        );

        pass.type = 'generic';
        pass.teamIdentifier = teamIdentifier;
        pass.passTypeIdentifier = passTypeIdentifier;

        // Set Fields
        pass.primaryFields.push({
            key: 'fullname',
            label: 'Name',
            value: fullName,
        });

        pass.secondaryFields.push({
            key: 'job',
            label: 'Job Title',
            value: jobTitle || 'N/A',
        });

        pass.auxiliaryFields.push({
            key: 'company',
            label: 'Company',
            value: company || 'N/A',
        });

        pass.backFields.push({
            key: 'bio',
            label: 'Bio',
            value: bio || '',
        });

        console.log("Pass structure created, generating buffer...");

        // Generate the .pkpass buffer
        const buffer = await pass.getAsBuffer();

        console.log("Buffer generated successfully");

        return new Response(buffer, {
            headers: {
                ...corsHeaders,
                'Content-Type': 'application/vnd.apple.pkpass',
                'Content-Disposition': `attachment; filename="${fullName.replace(/\s+/g, '_')}.pkpass"`,
            },
        });

    } catch (error: any) {
        console.error("Error generating pass:", error);
        return new Response(JSON.stringify({ error: error.message || 'Unknown error' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        });
    }
});
