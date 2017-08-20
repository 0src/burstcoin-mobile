import { Injectable } from '@angular/core';
import { Converter } from "../util";
import { PassPhraseGenerator } from "../util/crypto";

var CryptoJS = require("crypto-js");
var NaCL = require('tweetnacl')

@Injectable()
export class CryptoService {

    private passPhraseGenerator: PassPhraseGenerator;

    constructor() {
        this.passPhraseGenerator = new PassPhraseGenerator();
    }

    /*
    * Generate a passphrase witth the help of the PassPhraseGenerator
    * pass optional seed for seeding generation
    */
    public generatePassPhrase(seed = undefined): Promise<string> {
        return new Promise((resolve, reject) => {
            this.passPhraseGenerator.reSeed(seed);
            resolve(this.passPhraseGenerator.generatePassPhrase());
        });
    }

    /*
    * Generate the Master Public Key for a new passphrase
    */
    public genneratePublicKey(passPhrase): Promise<string> {
        return new Promise((resolve, reject) => {
            let passPhraseBytes = Converter.hexStringToByteArray(passPhrase);
    		let hashedPassPhraseBytes = CryptoJS.SHA256(passPhraseBytes);
            let keys = NaCL.box.keyPair.fromSecretKey(hashedPassPhraseBytes)
    		resolve(Converter.byteArrayToHexString(keys.PublicKey));
        });
    }
}
