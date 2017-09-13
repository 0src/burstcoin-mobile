import { Component, OnInit, ViewContainerRef } from "@angular/core";
import { RouterExtensions } from "nativescript-angular/router";
import { ModalDialogService, ModalDialogOptions } from "nativescript-angular/modal-dialog";
import { isAndroid } from "platform";
import { SelectedIndexChangedEventData, TabView, TabViewItem } from "tns-core-modules/ui/tab-view";
import { Label } from "ui/label";
import { Image } from "ui/image"

import { Account, BurstAddress, Currency } from "../../lib/model";
import { AccountService, DatabaseService, MarketService, NotificationService } from "../../lib/services";
import { AddComponent } from "./add/add.component";
import { RemoveComponent } from "./remove/remove.component";

import { registerElement } from "nativescript-angular/element-registry";
registerElement("AccountsRefresh", () => require("nativescript-pulltorefresh").PullToRefresh);


@Component({
    selector: "accounts",
    moduleId: module.id,
    templateUrl: "./accounts.component.html",
    styleUrls: ["./accounts.component.css"]
})
export class AccountsComponent implements OnInit {

    accounts: Account[];

    constructor(
        private accountService: AccountService,
        private databaseService: DatabaseService,
        private marketService: MarketService,
        private modalDialogService: ModalDialogService,
        private notificationService: NotificationService,
        private router: RouterExtensions,
        private vcRef: ViewContainerRef
    ) {
        this.accounts = [];
    }

    ngOnInit(): void {
        this.databaseService.getAllAccounts()
            .then(accounts => {
                this.accounts = accounts;
            })
            .catch(err => {
                console.log("No accounts found: " + err);
            })
    }

    public selectAccount(account: Account) {
        this.notificationService.info("Selected account: " + account.address);
        this.accounts.map(a => a.selected = false);
        this.accountService.selectAccount(account)
            .then(account => {
                this.marketService.setCurrency(this.marketService.currency.value);
            })
    }

    public onTapAddAccount() {
        const options: ModalDialogOptions = {
            viewContainerRef: this.vcRef,
            fullscreen: false,
        };
        this.modalDialogService.showModal(AddComponent, options)
            .then(result => { })
            .catch(error => { });
    }

    public onTapRemoveAccount(account: Account) {
        const options: ModalDialogOptions = {
            viewContainerRef: this.vcRef,
            context: account,
            fullscreen: false,
        };
        this.modalDialogService.showModal(RemoveComponent, options)
            .then(ok => {
                if (ok) {
                    let index = this.accounts.indexOf(account);
                    if (index > -1) {
                       this.accounts.splice(index, 1);
                    }
                    if (this.accounts.length < 1) {
                        this.router.navigate(['start'], { clearHistory: true });
                        return;
                    } else {
                        if (account.selected == true) {
                            this.accountService.selectAccount(this.accounts[0])
                                .then(selected => {
                                    this.marketService.setCurrency(this.marketService.currency.value);
                                    this.notificationService.info("Successfully removed account!");
                                })
                        } else {
                            this.notificationService.info("Successfully removed account!");
                        }
                    }
                }
            })
            .catch(error => console.log(JSON.stringify(error)));
    }

    public refresh(args) {
        var pullRefresh = args.object;
        for (let i = 0; i < this.accounts.length; i++) {
            this.accountService.synchronizeAccount(this.accounts[i])
                .then(account => {
                    if (i == this.accounts.length - 1) {
                        this.marketService.updateCurrency()
                            .then(currency => {
                                pullRefresh.refreshing = false;
                            })
                            .catch(error => {
                                pullRefresh.refreshing = false;
                                this.notificationService.info("Could not fetch currency information!")
                            });
                    }
                })
                .catch(error => {
                    if (i == this.accounts.length - 1) {
                        this.marketService.updateCurrency()
                            .then(currency => {
                                pullRefresh.refreshing = false;
                            })
                            .catch(error => {
                                pullRefresh.refreshing = false;
                                this.notificationService.info("Could not fetch currency information!")
                            });
                    }
                })
        }
    }


}
