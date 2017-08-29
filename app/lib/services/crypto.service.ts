import { Injectable } from '@angular/core';
import { Converter } from "../util";
import { PassPhraseGenerator } from "../util/crypto";
import { BurstAddress, Curve25519, Keypair } from "../model";

let CryptoJS = require("crypto-js");
let bigInt = require("big-integer");

@Injectable()
export class CryptoService {

    private ec;
    private passPhraseGenerator: PassPhraseGenerator;

    constructor() {
        this.passPhraseGenerator = new PassPhraseGenerator();
        this.ec = new EC('ed25519');
    }

    /*
    * Generate a passphrase with the help of the PassPhraseGenerator
    * pass optional seed for seeding generation
    */
    public generatePassPhrase(seed: any[] = []): Promise<string> {
        return new Promise((resolve, reject) => {
            this.passPhraseGenerator.reSeed(seed);
            resolve(this.passPhraseGenerator.generatePassPhrase());
        });
    }

    /*
    * Generate the Master Public Key and Master Private Key for a new passphrase
    * Ed25519 sign key pair. Public key can be converted to curve25519 public key (Burst Address)
    * Private Key can be converted to curve25519 private key for checking transactions
    */
    public generateMasterPublicAndPrivateKey(passPhrase: string): Promise<Keypair> {
        return new Promise((resolve, reject) => {
            // Hash the passphrase to get sha word array (32 bytes) which serves
            // as master seed for ed25519 key generation
            let hashedPassPhrase = CryptoJS.SHA256(passPhrase);
            // use nacl ed25519 to generate Master Public Key and Master Private Key from secret passphrase
            // https://ed25519.cr.yp.to/
            // https://nacl.cr.yp.to/
            // https://www.ietf.org/mail-archive/web/cfrg/current/msg04996.html
            let keys = Curve25519.keygen(Converter.convertWordArrayToByteArray(hashedPassPhrase));
            let keypair: Keypair = new Keypair({
                "publicKey" : converters.byteArrayToHexString(keys.p),
                "privateKey": converters.byteArrayToHexString(keys.s)
            });
            console.log(keypair.publicKey);
            console.log(keypair.privateKey);
            resolve(keypair);
        });
    }

    /*
    *   Convert hex string of the public key to the account id
    */
    public getAccountIdFromPublicKey(publicKey: string): Promise<string> {
        return new Promise((resolve, reject) => {
            // hash with SHA 256
            let hash = CryptoJS.SHA256(CryptoJS.enc.Hex.parse(publicKey));
            let bytes = Converter.convertWordArrayToByteArray(hash);
            // slice away first 8 bytes of SHA256 string
            let slice = bytes.slice(0, 8);
            // order it from lowest bit to highest / little-endian first / reverse
            slice = slice.reverse();
            // convert each byte into a number with radix 10
            let numbers = slice.map(byte => byte.toString(10));
            // create a biginteger based on the reversed byte/number array
            let id = bigInt.fromArray(numbers, 256); // base 256 for byte
            resolve(id.toString()); // return big integer in string
        });
    }

    /*
    * Convert the account id to the appropriate Burst address
    */
    public getBurstAddressFromAccountId(id: string): Promise<string> {
        return new Promise((resolve, reject) => {
            // TODO: refactor shitty nxt address resolution
            resolve(BurstAddress.encode(id));
        });
    }

    /*
    * Convert Burst Address back to account id
    */
    public getAccountIdFromBurstAddress(address: string): Promise<string> {
        return new Promise((resolve, reject) => {
            // TODO: refactor shitty nxt address resolution
            resolve(BurstAddress.decode(address));
        });
    }

    /*
    * Encrypt a derived hd private key with a given pin and return it in Base64 form
    */
    public encryptAES(text: string, key: string): Promise<string> {
        return new Promise((resolve, reject) => {
            let encrypted = CryptoJS.AES.encrypt(text, key);
            resolve(encrypted.toString()); // Base 64
        });
    }
    /*
    * Decrypt a derived hd private key with a given pin
    */
    public decryptAES(encryptedBase64: string, key: string): Promise<string> {
        return new Promise((resolve, reject) => {
            let decrypted = CryptoJS.AES.decrypt(encryptedBase64, key);
            resolve(decrypted.toString(CryptoJS.enc.Utf8));
        });
    }

    /*
    *
    */
    public hashSHA256(input: string): string {
        return CryptoJS.SHA256(input).toString();
    }

    /*
    * Sign unsigned transaction bytes from the server
    */
    public signTransactionBytes(bytes: string): Promise<string> {
        return undefined;
    }
}
