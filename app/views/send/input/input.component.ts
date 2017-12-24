/*
    Copyright 2017 icewave.org
*/

import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { RouterExtensions } from "nativescript-angular/router";
import { ActivatedRoute } from "@angular/router";
import { TranslateService } from "ng2-translate";
import { RadSideDrawerComponent, SideDrawerType } from "nativescript-pro-ui/sidedrawer/angular";
import { RadSideDrawer } from "nativescript-pro-ui/sidedrawer";
import { TextField } from "ui/text-field";
import { BarcodeScanner, ScanOptions } from 'nativescript-barcodescanner';

import { Account, BurstAddress, Transaction } from "../../../lib/model";
import { AccountService, MarketService, NotificationService } from "../../../lib/services";
import { SendService } from "../send.service";

@Component({
    moduleId: module.id,
    selector: "input",
    styleUrls: ["./input.component.css"],
    templateUrl: "./input.component.html"
})
export class InputComponent implements OnInit {
    account: Account;
    balance: string;
    recipientParts: string[];
    amount: number;
    fee: number;
    pin: string;
    total: number;

    @ViewChild("amountField")
    public amountField: TextField;

    @ViewChild(RadSideDrawerComponent)
    public drawerComponent: RadSideDrawerComponent;

    private drawer: RadSideDrawer;

    constructor(
        private accountService: AccountService,
        private barcodeScanner: BarcodeScanner,
        private changeDetectionRef: ChangeDetectorRef,
        private marketService: MarketService,
        private notificationService: NotificationService,
        private router: RouterExtensions,
        private route: ActivatedRoute,
        private sendService: SendService,
        private translateService: TranslateService
    ) {
        if (this.route.snapshot.params['address'] != undefined) {
            this.recipientParts = this.accountService.splitBurstAddress(this.route.snapshot.params['address']);
        } else {
            this.recipientParts = [];
        }
        this.amount = undefined;
        this.fee = 1;
        this.total = 1;
    }

    ngOnInit(): void {
        if (this.accountService.currentAccount.value != undefined) {
            this.account = this.accountService.currentAccount.value;
            this.balance = this.marketService.getPriceBurstcoin(this.account.balance);
        }
    }

    ngAfterViewInit() {
        this.drawer = this.drawerComponent.sideDrawer;
        this.changeDetectionRef.detectChanges();
    }

    public onTapAddContact() {
        console.log("add")
    }

    public onTapContact(contact: string) {
        console.log(contact)
    }

    public onTapContacts() {
        this.drawer.showDrawer();
    }

    public onTapScan() {
        let options: ScanOptions = {
            formats: "QR_CODE"
        }
        this.barcodeScanner.scan(options).then((result) => {
            this.recipientParts = this.accountService.splitBurstAddress(result.text);
            this.amountField.focus()
        }, (errorMessage) => {
            this.translateService.get('NOTIFICATIONS.ERRORS.QR_CODE').subscribe((res: string) => {
                this.notificationService.info(res);
            });
        });
    }

    public onTapVerify() {
        if (this.verifyRecipient()) {
            if (this.verifyAmount()) {
                if (this.verifyFee()) {
                    if (this.verifyTotal()) {
                        this.sendService.setRecipient(this.accountService.constructBurstAddress(this.recipientParts))
                        this.sendService.setAmount(this.amount)
                        this.sendService.setFee(this.fee)
                        this.router.navigate(['/send/verify'])
                    } else {
                        this.translateService.get('NOTIFICATIONS.EXCEED').subscribe((res: string) => {
                            this.notificationService.info(res);
                        });
                    }
                } else {
                    this.translateService.get('NOTIFICATIONS.DECIMAL_FEE').subscribe((res: string) => {
                        this.notificationService.info(res);
                    });
                }
            } else {
                this.translateService.get('NOTIFICATIONS.DECIMAL_AMOUNT').subscribe((res: string) => {
                    this.notificationService.info(res);
                });
            }
        } else {
            this.translateService.get('NOTIFICATIONS.ADDRESS').subscribe((res: string) => {
                this.notificationService.info(res);
            });
        }
    }

    public verifyRecipient(): boolean {
        return this.accountService.isBurstcoinAddress(this.accountService.constructBurstAddress(this.recipientParts))
    }

    public verifyAmount(): boolean {
        return this.amount > 0 && !isNaN(Number(this.amount))
    }

    public verifyFee() {
        return this.fee >= 1 && !isNaN(Number(this.fee))
    }

    public verifyTotal(): boolean {
        return parseFloat(this.amount.toString()) + parseFloat(this.fee.toString()) <= this.account.balance
    }

    public calculateTotal(input: string) {
        let aNumber;
        let fNumber;
        if (this.amount != undefined) {
            aNumber = parseFloat(this.amount.toString());
        }
        if (this.fee != undefined) {
            fNumber = parseFloat(this.fee.toString());
        }
        if (isNaN(aNumber)) {
            aNumber = 0;
        }
        if (isNaN(fNumber)) {
            fNumber = 0;
        }
        if (aNumber + fNumber > this.account.balance) {
            if (input == "amount") {
                this.amount = this.account.balance - fNumber;
            } else {
                this.fee = this.account.balance - aNumber;
            }
        }
        this.total = aNumber + fNumber;
    }

    public formatRecipient() {
        for (let i = 0; i < this.recipientParts.length; i++) {
            this.recipientParts[i] = this.recipientParts[i].toUpperCase()
        }
    }
}
