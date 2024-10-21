import NodeRsa from 'node-rsa';
import { readFile, readdir } from 'fs/promises';

export interface RsaBox {
  destId: string;
  sourceId: string;
  sig: string;
  data: string;
}

export const intoRsaBox = (a: unknown, destId: string, sourceId: string, key: NodeRsa): RsaBox => {
  const data = Buffer.from(JSON.stringify(a), 'utf8').toString('base64');
  return {
    destId,
    sourceId,
    sig: key.sign(data).toString('base64'),
    data,
  };
};

export const verifyRsaBox = (r: RsaBox, key: NodeRsa): boolean => {
  return key.verify(r.data, Buffer.from(r.sig, 'base64'));
};

export const unboxRsaBox = <T>(r: RsaBox): T => {
  const { data } = r;
  return { ...JSON.parse(Buffer.from(data, 'base64').toString('utf8')) } as T;
};

export interface RsaContext {
  selfName: string;
  selfKey: NodeRsa;
  trustedKeyIdx: Record<string, NodeRsa>;
}

export const loadRsaContext = async (
  selfKeyPath: string,
  trustedKeysPath: string,
  selfName: string,
): Promise<RsaContext> => {
  const selfKeyString = await readFile(selfKeyPath);
  const selfKey = new NodeRsa().importKey(selfKeyString);
  const trustedKeyIdx: Record<string, NodeRsa> = {};
  const trustedKeys = await readdir(trustedKeysPath);

  for (const keyFileName of trustedKeys) {
    if (keyFileName.length < 3) {
      continue;
    }
    const keyName = keyFileName.replace('.key.pub', '');
    const keyString = await readFile(`trusted_keys/${keyFileName}`);
    const key = new NodeRsa().importKey(keyString);
    trustedKeyIdx[keyName] = key;
  }

  return {
    selfName,
    selfKey,
    trustedKeyIdx,
  };
};
