import { Keypair } from "./keypair";
import { Transaction } from "./transaction";

export class Wallet {

    id: string;
    address: string;
    unconfirmedBalance: number;
    balance: number;
    type: string;
    selected: boolean;

    balanceStringBTC: string;
    balanceStringCur: string;

    pinHash: string;
    keypair: Keypair;
    transactions: Transaction[];

    constructor(data: any = {}) {
        this.id = data.id || undefined;
        this.address = data.address || undefined;
        this.balance = data.balance || 0;
        this.unconfirmedBalance = data.unconfirmedBalance || 0;
        this.balanceStringBTC = data.balance || undefined;
        this.balanceStringCur = data.balance || undefined;
        this.type = data.type || "offline";
        this.selected = data.selected || false;
        this.keypair = new Keypair();
        if (data.keypair != undefined) {
            this.pinHash = data.pinHash || undefined;
            this.keypair.publicKey = data.keypair.publicKey || undefined;
            this.keypair.privateKey = data.keypair.privateKey || undefined;
        }
        if (data.transactions != undefined && data.transactions.length > 0) {
            this.transactions = data.transactions;
        } else {
            this.transactions = [];
        }
    }
}
