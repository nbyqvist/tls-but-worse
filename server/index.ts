import { loadRsaContext, unboxRsaBox, verifyRsaBox, type RsaBox } from '../shared';
import { handleRpc, type RpcRequest } from './rpc';
import express, { type Request, type Response } from 'express';
import { readFile } from 'fs/promises';

const name = (await readFile('/etc/hostname')).toString().trim();
if (name == '' || name.length <= 2) {
  throw new Error('Failed to read self name');
}

const rsaCtx = await loadRsaContext('self_keys/self.key', 'trusted_keys', name);

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    message: 'ok',
  });
});

const sendErr = (res: Response, code: number, message: string) => {
  res.json({ message });
  res.statusCode = code;
};

const validateRsaBox = (rsaBox: Partial<RsaBox> | undefined): boolean => {
  return (
    rsaBox != null &&
    typeof rsaBox.data === 'string' &&
    typeof rsaBox.destId === 'string' &&
    typeof rsaBox.sig === 'string' &&
    typeof rsaBox.sourceId === 'string'
  );
};

app.post('/rpc', async (req: Request<{}, unknown>, res: Response<RsaBox>) => {
  const { selfKey, selfName, trustedKeyIdx } = rsaCtx;
  if (!validateRsaBox(req.body)) {
    sendErr(res, 400, `Malformed request`);
    return;
  }
  const rsaBox = req.body as RsaBox;
  const maybeKey = rsaBox.sourceId in trustedKeyIdx ? trustedKeyIdx[rsaBox.sourceId] : null;
  if (maybeKey == null) {
    sendErr(res, 403, `Key with id ${rsaBox.sourceId} is not trusted`);
    return;
  }

  const verified = verifyRsaBox(rsaBox, maybeKey);
  if (!verified) {
    sendErr(res, 401, `Bad signature`);
    return;
  }

  const rpcRequestRaw = unboxRsaBox<RpcRequest>(rsaBox);

  const result = await handleRpc(rpcRequestRaw);
  const d = Buffer.from(JSON.stringify(result), 'utf8').toString('base64');
  res.json({
    sourceId: selfName,
    destId: rsaBox.sourceId,
    sig: selfKey.sign(d, 'base64'),
    data: d,
  });
});

app.listen(3000);
