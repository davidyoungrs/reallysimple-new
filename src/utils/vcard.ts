import VCard from 'vcard-creator';
import type { CardData } from '../types';

export const generateVCard = (data: CardData): string => {
    const myVCard = new VCard();

    // Split name more robustly or just use provided if we had structured fields.
    // robust-ish fallback:
    const parts = data.fullName.trim().split(/\s+/);
    const firstName = parts[0] || '';
    const lastName = parts.slice(1).join(' ') || '';

    myVCard
        .addName(lastName, firstName, '', '', '')
        .addCompany(data.company)
        .addJobtitle(data.jobTitle)
        .addNote(data.bio);

    // Add social links and contacts
    data.socialLinks.forEach((link) => {
        const platform = link.platform.toLowerCase();

        if (platform === 'email') {
            myVCard.addEmail(link.url.replace(/^mailto:/i, ''), 'WORK');
        } else if (platform === 'phone') {
            myVCard.addPhoneNumber(link.url.replace(/^tel:/i, ''), 'WORK');
        } else {
            // For other links, add as URL with the platform name as type or label if possible.
            // vcard-creator addURL(url, type)
            // 'type' is usually 'WORK', 'HOME' etc, but can sometimes be a custom label depending on client support.
            myVCard.addURL(link.url, platform.toUpperCase());
        }
    });

    // Try to add photo if it's a valid URL (vCard 4.0 supports external URLs, older versions might not)
    // We'll add it and hope the client supports it.
    if (data.avatarUrl) {
        myVCard.addPhoto(data.avatarUrl, 'JPEG');
    }

    return myVCard.toString();
};

export const downloadVCard = (data: CardData) => {
    const vcardString = generateVCard(data);
    const blob = new Blob([vcardString], { type: 'text/vcard;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${data.fullName.replace(' ', '_')}.vcf`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
