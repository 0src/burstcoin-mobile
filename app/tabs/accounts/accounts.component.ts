import { Component, OnInit } from "@angular/core";
import { isAndroid } from "platform";
import { SelectedIndexChangedEventData, TabView, TabViewItem } from "tns-core-modules/ui/tab-view";
import { Label } from "ui/label";
import { Image } from "ui/image"

import { BurstAddress, Currency, Wallet } from "../../lib/model";

import { DatabaseService, MarketService, NotificationService, WalletService } from "../../lib/services";

@Component({
    selector: "accounts",
    moduleId: module.id,
    templateUrl: "./accounts.component.html",
    styleUrls: ["./accounts.component.css"]
})
export class AccountsComponent implements OnInit {

    wallets: Wallet[];

    constructor(
        private databaseService: DatabaseService,
        private marketService: MarketService,
        private notificationService: NotificationService,
        private walletService: WalletService
    ) {
        this.wallets = [];
    }

    ngOnInit(): void {
        this.walletService.currentWallet.subscribe((wallet: Wallet) => {
            if (wallet != undefined) {
                this.databaseService.getAllWallets()
                    .then(wallets => {
                        this.wallets = wallets;
                        if (this.marketService.currency != undefined) {
                            this.wallets.map(wallet => {
                                wallet.balanceStringBTC = this.marketService.getPriceBTC(wallet.balance);
                                wallet.balanceStringCur = this.marketService.getPriceFiatCurrency(wallet.balance);
                            })
                        }
                    })
                    .catch(err => {
                        console.log("No wallets found: " + err);
                    })
            }
        });

        this.marketService.currency.subscribe((currency: Currency) => {
            if (currency != undefined) {
                this.wallets.map(wallet => {
                    wallet.balanceStringBTC = this.marketService.getPriceBTC(wallet.balance);
                    wallet.balanceStringCur = this.marketService.getPriceFiatCurrency(wallet.balance);
                })
            }
        });
    }


}
