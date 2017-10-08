import { Component, OnInit } from "@angular/core";
import { isAndroid } from "platform";
import { ListViewEventData } from "nativescript-telerik-ui/listview";
import { GestureEventData } from "ui/gestures";
import { TranslateService } from 'ng2-translate';

import { Account, Transaction } from "../../lib/model";
import { Converter } from "../../lib/util";

import { AccountService, DatabaseService, MarketService, NotificationService } from "../../lib/services";

import * as SocialShare from "nativescript-social-share";
let clipboard = require("nativescript-clipboard");

@Component({
    selector: "transactions",
    moduleId: module.id,
    templateUrl: "./transactions.component.html",
    styleUrls: ["./transactions.component.css"]
})
export class TransactionsComponent implements OnInit {

    transactions: Transaction[];
    ownId: string;

    constructor(
        private databaseService: DatabaseService,
        private marketService: MarketService,
        private notificationService: NotificationService,
        private accountService: AccountService,
        private translateService: TranslateService
    ) {
        this.ownId = "";
        this.transactions = [];
    }

    ngOnInit(): void {
        this.accountService.currentAccount.subscribe((account: Account) => {
            if (account != undefined) {
                this.transactions = account.transactions;
                this.ownId = this.accountService.currentAccount.value.id;
            }
        });
    }

    public onDoubleTap(address: string) {
        clipboard.setText(address);
        this.translateService.get('NOTIFICATIONS.COPIED', {value: address}).subscribe((res: string) => {
            this.notificationService.info(res);
        });
    }

    public onLongPress(address: string) {
        SocialShare.shareText(address);
    }

    public convertTimestamp(timestamp: number) {
        return Converter.convertTimestampToDateString(timestamp);
    }

    public refresh(args) {
        let listView = args.object;
        let account = this.accountService.currentAccount.value;
        this.accountService.synchronizeAccount(account)
            .then(account => {
                this.transactions = account.transactions;
                this.accountService.setCurrentAccount(account);
                this.marketService.updateCurrency()
                    .then(currency => {
                        listView.notifyPullToRefreshFinished();
                    })
                    .catch(error => {
                        listView.notifyPullToRefreshFinished();
                        this.translateService.get(error.message).subscribe((res: string) => {
                            this.notificationService.info(res);
                        });
                    });
                listView.notifyPullToRefreshFinished();
            })
            .catch(error => {
                this.translateService.get(error.message).subscribe((res: string) => {
                    this.notificationService.info(res);
                });
                listView.notifyPullToRefreshFinished();
            })
    }
}
