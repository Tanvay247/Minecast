import { File, Web3Storage } from 'web3.storage';

const client = new Web3Storage({
  token: process.env.WEB3_STORAGE_KEY!,
});

export async function uploadToIPFS(buffer: Buffer): Promise<string> {
  const bytes = new Uint8Array(buffer);

  const file = new File([bytes], 'video.mp4', {
    type: 'video/mp4',
  });

  const cid = await client.put([file], {
    wrapWithDirectory: false,
  });

  return cid;
}