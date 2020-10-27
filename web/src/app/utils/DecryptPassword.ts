import * as CryptoJS from 'crypto-js';

export function decryptPassword(encryptedPassword: string) {
  const masterPassword = localStorage.getItem('password');

  if (masterPassword) {
    const key16 = CryptoJS.MD5(masterPassword).toString().substr(0, 16);

    const key = CryptoJS.enc.Utf8.parse(key16);
    const iv = CryptoJS.enc.Utf8.parse(key16);

    return CryptoJS.AES.decrypt(
      encryptedPassword, key, {
        keySize: 16,
        iv,
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7
      }).toString(CryptoJS.enc.Utf8) || 'Decryption Error';
  }
  return 'Decryption Error';
}
