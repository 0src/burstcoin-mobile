import { Component, OnInit, NgModule } from "@angular/core";
import { ModalDialogParams } from "nativescript-angular/modal-dialog";
import { Page } from "ui/page";

import * as utils from "utils/utils";

// >> passing-parameters
@Component({
    moduleId: module.id,
    templateUrl: "./about.component.html",
    styleUrls: ["./about.component.css"]
})
export class AboutComponent implements OnInit {

    constructor(private params: ModalDialogParams, private page: Page) {
        this.page.on("unloaded", () => {
            // using the unloaded event to close the modal when there is user interaction
            // e.g. user taps outside the modal page
            this.params.closeCallback();
        });
    }

    ngOnInit() {

    }

    public onTapDocumentation() {
        utils.openUrl("https://cgebe.github.io/burstcoin-wallet/")
    }

    public onTapTwitter() {
        utils.openUrl("https://twitter.com/PoC_Consortium")
    }
}