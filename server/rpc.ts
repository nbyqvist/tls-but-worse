import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export const handleRpc = async (rpc: RpcRequest): Promise<RpcResult> => {
  const subprocess = await execAsync(`${rpc.command} ${rpc.args.join(' ')}`);

  return {
    status: 0,
    ...subprocess,
  };
};

export interface RpcRequest {
  command: string;
  args: Array<string>;
}

export interface RpcResult {
  status: number;
  stdout: string;
  stderr: string;
}
