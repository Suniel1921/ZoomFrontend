// Simple encryption/decryption for demo purposes
// In production, use a proper encryption library and secure key management

const ENCRYPTION_KEY = 'your-secure-encryption-key';

export function encrypt(text: string): string {
  try {
    // Convert string to UTF-8 encoded base64 first
    const utf8Bytes = new TextEncoder().encode(text);
    const base64 = btoa(String.fromCharCode(...utf8Bytes));
    
    // Simple XOR encryption
    const encrypted = base64
      .split('')
      .map(char => 
        String.fromCharCode(char.charCodeAt(0) ^ ENCRYPTION_KEY.charCodeAt(0))
      )
      .join('');
    
    return btoa(encrypted);
  } catch (error) {
    console.error('Encryption failed:', error);
    return text;
  }
}

export function decrypt(encryptedText: string): string {
  try {
    // Reverse the encryption process
    const decoded = atob(encryptedText);
    const decrypted = decoded
      .split('')
      .map(char => 
        String.fromCharCode(char.charCodeAt(0) ^ ENCRYPTION_KEY.charCodeAt(0))
      )
      .join('');
    
    // Convert base64 back to UTF-8 string
    const base64Decoded = atob(decrypted);
    const utf8Bytes = new Uint8Array([...base64Decoded].map(c => c.charCodeAt(0)));
    return new TextDecoder().decode(utf8Bytes);
  } catch (error) {
    console.error('Decryption failed:', error);
    return encryptedText;
  }
}