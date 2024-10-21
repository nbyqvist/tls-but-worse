import { intoRsaBox, loadRsaContext, unboxRsaBox, verifyRsaBox, type RsaBox } from '../shared';

const name = 'client_0';
const destId = 'server_0';
const { selfKey, trustedKeyIdx } = await loadRsaContext('self_keys/self.key', 'trusted_keys', name);

const data = {
  command: 'ls',
  args: ['-al'],
};

const b = intoRsaBox(data, destId, name, selfKey);

const res = await fetch('http://localhost:3000/rpc', {
  body: JSON.stringify(b),
  headers: {
    'Content-Type': 'application/json',
  },
  method: 'POST',
});

const unverifiedResponse = (await res.json()) as RsaBox;
const verified = verifyRsaBox(unverifiedResponse, trustedKeyIdx[destId]);
if (verified) {
  console.log('Verified');
} else {
  console.log('Unverified');
}
const a = unboxRsaBox(unverifiedResponse);
console.log(a);
