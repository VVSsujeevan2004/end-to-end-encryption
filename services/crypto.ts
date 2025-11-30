// A wrapper around the Web Crypto API to simulate the RSA/AES architecture

// Convert ArrayBuffer to Hex String
export const bufferToHex = (buffer: ArrayBuffer): string => {
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};

// Convert String to ArrayBuffer
const str2ab = (str: string): ArrayBuffer => {
  const buf = new ArrayBuffer(str.length);
  const bufView = new Uint8Array(buf);
  for (let i = 0, strLen = str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
};

// Convert ArrayBuffer to Base64
export const bufferToBase64 = (buffer: ArrayBuffer): string => {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
};

// Mock RSA Key Generation (For demo speed, we use smaller keys or simulate if native is too slow, 
// but WebCrypto is fast enough for 2048 usually).
export const generateKeyPair = async (): Promise<CryptoKeyPair> => {
  return window.crypto.subtle.generateKey(
    {
      name: "RSA-OAEP",
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256",
    },
    true,
    ["encrypt", "decrypt"]
  );
};

// Generate AES Key for a session
export const generateAESKey = async (): Promise<CryptoKey> => {
  return window.crypto.subtle.generateKey(
    {
      name: "AES-GCM",
      length: 256,
    },
    true,
    ["encrypt", "decrypt"]
  );
};

// Encrypt message with AES-GCM
export const encryptMessage = async (key: CryptoKey, message: string): Promise<{ iv: string, ciphertext: string }> => {
  const encoded = new TextEncoder().encode(message);
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  
  const encrypted = await window.crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    key,
    encoded
  );

  return {
    iv: bufferToBase64(iv.buffer),
    ciphertext: bufferToBase64(encrypted)
  };
};

// Decrypt message
export const decryptMessage = async (key: CryptoKey, ciphertext: string, ivStr: string): Promise<string> => {
  const iv = Uint8Array.from(atob(ivStr), c => c.charCodeAt(0));
  const data = Uint8Array.from(atob(ciphertext), c => c.charCodeAt(0));

  const decrypted = await window.crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    key,
    data
  );

  return new TextDecoder().decode(decrypted);
};

// Hash data for forensic logging (integrity check)
export const hashData = async (data: string): Promise<string> => {
  const msgUint8 = new TextEncoder().encode(data);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgUint8);
  return bufferToHex(hashBuffer);
};