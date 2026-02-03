import dotenv from "dotenv";

dotenv.config({
  path: `.env`
});

const { DefaultAzureCredential } = require("@azure/identity");
const { SecretClient } = require("@azure/keyvault-secrets");

const credential = new DefaultAzureCredential();

// Key Vault Specific Parameters from .env
const vaultName = process.env.KEYVAULT_NAME;
const url = `https://${vaultName}.vault.azure.net`;
const client = new SecretClient(url, credential);

// Try fetch Secrets from Key Vault or throw error
export async function getSecrets(secret_name: string) {
  try {
    const secretbody = await client.getSecret(secret_name)
    return (secretbody.value)
  } catch (error) {
    console.error(error)
    throw error
  }
}