/*
    Copyright 2017 icewave.org
*/

import { Component, OnInit, ViewContainerRef } from "@angular/core";
import { ModalDialogService, ModalDialogOptions } from "nativescript-angular/modal-dialog";
import { ListViewEventData } from "nativescript-pro-ui/listview";
import { GestureEventData, SwipeGestureEventData } from "ui/gestures";
import { TranslateService } from 'ng2-translate';

import { Account, Transaction } from "../../../lib/model";
import { Converter } from "../../../lib/util";
import { AccountService, DatabaseService, MarketService, NotificationService, TabsService } from "../../../lib/services";

import { DecryptComponent } from "./decrypt/decrypt.component";

import * as SocialShare from "nativescript-social-share";
import * as utils from "utils/utils";
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
        private modalDialogService: ModalDialogService,
        private notificationService: NotificationService,
        private accountService: AccountService,
        private tabsService: TabsService,
        private translateService: TranslateService,
        private vcRef: ViewContainerRef
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

    public onTap(id: string) {
        utils.openUrl("https://explore.burst.cryptoguru.org/transaction/" + id);
    }

    public onTapDecrypt(transaction: Transaction) {
        const options: ModalDialogOptions = {
            viewContainerRef: this.vcRef,
            context: transaction,
            fullscreen: false,
        };
        this.modalDialogService.showModal(DecryptComponent, options)
            .then(empty => {})
            .catch(error => console.log(JSON.stringify(error)));
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

    public formatRawEncryptedMessage(enc: string) {
        return enc.substring(0, 20) + "...";
    }

    public isBase64(enc: string) {
        return /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{4})$/i.test(enc);
    }

    public onSwipeItem(args: SwipeGestureEventData) {
        if (args.direction == 1) {
            this.tabsService.changeTab(0);
        } else if (args.direction == 2) {
            this.tabsService.changeTab(2);
        }
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
