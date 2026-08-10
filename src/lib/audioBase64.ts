/**
 * Convert a Blob to a base64 string without blowing the call stack.
 * `String.fromCharCode(...new Uint8Array(buf))` throws RangeError on
 * recordings larger than a few hundred KB, which silently kills the
 * click handler ("dead button").
 */
export async function blobToBase64(blob: Blob): Promise<string> {
  const buf = await blob.arrayBuffer();
  const bytes = new Uint8Array(buf);
  const CHUNK = 0x8000;
  let binary = "";
  for (let i = 0; i < bytes.length; i += CHUNK) {
    binary += String.fromCharCode(...bytes.subarray(i, i + CHUNK));
  }
  return btoa(binary);
}
