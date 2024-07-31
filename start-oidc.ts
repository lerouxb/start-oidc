// assuming you're on arm64 mac:
// docker run -e EXPERIMENTAL_DOCKER_DESKTOP_FORCE_QEMU=1 --network host --platform linux/amd64 --rm -v .:/start-oidc -w /start-oidc node:20 bash -c 'npm i && npx ts-node start-oidc.ts "http://localhost:38231"'
// where http://localhost:38231 is the issuer, so change according to your OIDC Mock Provider config
// This requires host networking enabled in docker for mac/windows which requires sign in to docker.

//import type { MongoCluster } from '@mongodb-js/compass-test-server';
import { startTestServer } from '@mongodb-js/compass-test-server';
import createDebug from 'debug';
createDebug.enable('mongodb-runner');

//let cluster: MongoCluster;

async function start(issuer: string) {
  const serverOidcConfig = {
    issuer,
    clientId: 'testServer',
    requestScopes: ['mongodbGroups'],
    authorizationClaim: 'groups',
    audience: 'resource-server-audience-value',
    authNamePrefix: 'dev',
  };

  const args = [
    '--setParameter',
    'authenticationMechanisms=SCRAM-SHA-256,MONGODB-OIDC',
    // enableTestCommands allows using http:// issuers such as http://localhost
    '--setParameter',
    'enableTestCommands=true',
    '--setParameter',
    `oidcIdentityProviders=${JSON.stringify([serverOidcConfig])}`,
    '--bind_ip_all',
    '--port',
    '27017',
  ];

  //if (serverSatisfies('>= 8.1.0-rc0', true)) {
    // Disable quiescing of JWKSet fetches to match the pre-8.0 behavior.
    //args.push('--setParameter', 'JWKSMinimumQuiescePeriodSecs=0');
  //}

  console.log('starting server with config', JSON.stringify(args, null, 2));

  const cluster = await startTestServer({
    version: 'latest-enterprise',
    logDir: '/start-oidc',
    args
  });
  console.log('connection string:', cluster.connectionString);
}

/*
async function stop() {
  await cluster?.close();
}
*/

const issuer = process.argv[2];

console.log('issuer', issuer);

start(issuer)
  .then(() => console.log('started'))
  .catch((err: any) => console.error(err?.stack));