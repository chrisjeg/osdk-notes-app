import { input } from '@inquirer/prompts';
import {readFileSync, writeFileSync} from 'fs';
const scope = "@jegs-sick-note-app";

console.log("Before continuing, ensure that you've installed the marketplace zip provided into your AIP instance")
const foundryUrl = await input({ message: 'Enter your Palantir Foundry URL:', validate: (url) => {
    if (!url.startsWith('https://')) {
        return 'URL must start with "https://"';
    }
    // Should be of the format https://<foundry-url>.palantirfoundry.com, can end in a slash
    const urlRegex = /^https:\/\/[a-zA-Z0-9-]+\.palantirfoundry\.com\/?$/;
    if (!urlRegex.test(url)) {
        return 'Invalid Foundry URL, should be of the format https://<foundry-url>.palantirfoundry.com';
    }
    return true;
} });
const foundryUrlWithoutTailSlash = foundryUrl.replace(/\/$/, '');

console.log(`⚠️ Open your browser and navigate to ${foundryUrlWithoutTailSlash}/workspace/developer-console/ and open "Take Note" to get your Application RID, Client ID and Registry URL.`);
const applicationRid = await input({ message: 'Enter your Application RID:' });
const clientId = await input({ message: 'Enter your Client ID:' });
const registryUrl = await input({ message: 'Enter your Registry URL:', validate: (url) => {
    const urlRegex = new RegExp(`^${foundryUrlWithoutTailSlash}/artifacts/api/repositories/[a-zA-Z0-9-.]+/contents/release/npm$`);
    if (!urlRegex.test(url)) {
        return `Invalid Registry URL, should be of the format ${foundryUrlWithoutTailSlash}/artifacts/api/repositories/<artifacts-rid>/contents/release/npm`;
    }
    return true;
} });

console.log(`✏️ Writing authentication configuration to .npmrc file `);
writeFileSync('.npmrc', `
${registryUrl.substring(6)}/:_authToken=\${FOUNDRY_TOKEN}
${scope}:registry=${registryUrl}
`);

// Create .env.development file and .env.production file
console.log(`✏️ Writing oauth redirect configuration to .env.development file `);
writeFileSync('.env.development', `
VITE_FOUNDRY_API_URL=${foundryUrlWithoutTailSlash}
VITE_FOUNDRY_REDIRECT_URL=http://localhost:8080/auth/callback
VITE_FOUNDRY_CLIENT_ID=${clientId}
`);

console.log("Modifying foundry.config.json file");
const foundryConfig = readFileSync('foundry.config.json', 'utf8');
const foundryConfigJson = JSON.parse(foundryConfig);
foundryConfigJson.foundryUrl = foundryUrlWithoutTailSlash;
foundryConfigJson.site.application = applicationRid;
writeFileSync('foundry.config.json', JSON.stringify(foundryConfigJson, null, 2));

const sdkGenerationUrl = `${foundryUrlWithoutTailSlash}/workspace/developer-console/app/${applicationRid}/sdk/generation?packageType=npm`;
console.log(`🤩 Almost complete! Navigate to ${sdkGenerationUrl}, select the latest version and copy the "Installation instructions"`);