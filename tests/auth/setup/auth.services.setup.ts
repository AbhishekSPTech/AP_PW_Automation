import { expect, test as setup } from '@playwright/test';

setup('api authentication', async ({ request }) => {
  // auth steps
  // Uncomment the below line to log the environment tag for debugging
  // console.log(process.env.ENV_TAG);
  const formData = new URLSearchParams();
  formData.append('grant_type', 'client_credentials');
  formData.append('client_secret', '' + process.env.API_CLIENT_SECRET);
  formData.append('client_id', '' + process.env.API_CLIENT_ID);

  //api request to aquire auth token
  const response = await request.post(process.env.AUTH_BASE_URL + '/connect/token', {
    headers:
    {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    data: formData.toString()
  });

  //parse the response for auth token
  const resp = await response.json();
  // Uncomment the below line to log the full response for debugging purposes
  //console.log(resp);
  expect(response.status()).toBe(200);
  const token = resp.access_token;
  // Uncomment the below line to log the token for debugging (avoid exposing in production logs)
  //console.log(token);

  //stores auth token as env variable
  process.env.APIKEY = token;
  console.log('API auth setup complete');
});