import { Component, OnInit, NgModule } from "@angular/core";
import { ModalDialogParams } from "nativescript-angular/modal-dialog";
import { Page } from "ui/page";
import { Settings } from "../../../lib/model";
import { DatabaseService } from "../../../lib/services";

// >> passing-parameters
@Component({
    moduleId: module.id,
    templateUrl: "./node.component.html",
    styleUrls: ["./node.component.css"]
})
export class NodeComponent implements OnInit {

    private address: string;

    constructor(
        private databaseService: DatabaseService,
        private params: ModalDialogParams,
        private page: Page
    ) {
        this.address = params.context;
        this.page.on("unloaded", () => {
            // using the unloaded event to close the modal when there is user interaction
            // e.g. user taps outside the modal page
            this.params.closeCallback();
        });
    }

    ngOnInit() {

    }

    public onTapOk() {
        this.params.closeCallback(this.address);
    }

    public onTapReset() {
        let s = new Settings();
        this.address = s.node;
    }
}
