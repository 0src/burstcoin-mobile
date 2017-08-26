import { Component, OnInit } from "@angular/core";
import { isAndroid } from "platform";
import { SelectedIndexChangedEventData, TabView, TabViewItem } from "tns-core-modules/ui/tab-view";

import { Wallet } from "../lib/model";
import { DatabaseService, NotificationService, WalletService } from "../lib/services";

@Component({
    selector: "TabsComponent",
    moduleId: module.id,
    templateUrl: "./tabs.component.html",
    styleUrls: ["./tabs.component.css"]
})
export class TabsComponent implements OnInit {

    private _title: string;

    constructor(
        private databaseService: DatabaseService,
        private notificationService: NotificationService,
        private walletService: WalletService
    ) {
        this.walletService.importBurstcoinWallet("BURST-LP4T-ZQSJ-9XMS-77A7W", false);

        let wallet = new Wallet();
        wallet.id = "6779331401231193177"
        wallet.type = "offline";
        wallet.address = "BURST-LP4T-ZQSJ-9XMS-77A7W";
        wallet.selected = true;

        setTimeout(x => {
            this.databaseService.saveWallet(wallet)
                .then(success => {
                    console.log(success);
                })
                .catch(err => {
                    console.log(err);
                });
        }, 1000);

    }

    ngOnInit(): void {
        /* ***********************************************************
        * Use the "ngOnInit" handler to initialize data for the whole tab
        * navigation layout as a whole.
        *************************************************************/
    }

    get title(): string {
        return this._title;
    }

    set title(value: string) {
        if (this._title !== value) {
            this._title = value;
        }
    }

    /* ***********************************************************
    * The "getIconSource" function returns the correct tab icon source
    * depending on whether the app is ran on Android or iOS.
    * You can find all resources in /App_Resources/os
    *************************************************************/
    getIconSource(icon: string): string {
        return isAndroid ? "res://" + icon : "res://tabIcons/" + icon;
    }

    /* ***********************************************************
    * Get the current tab view title and set it as an ActionBar title.
    * Learn more about the onSelectedIndexChanged event here:
    * https://docs.nativescript.org/cookbook/ui/tab-view#using-selectedindexchanged-event-from-xml
    *************************************************************/
    onSelectedIndexChanged(args: SelectedIndexChangedEventData) {
        const tabView = <TabView>args.object;
        const selectedTabViewItem = tabView.items[args.newIndex];

        this.title = selectedTabViewItem.title;
    }
}
