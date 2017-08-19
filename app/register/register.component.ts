import { Component, OnInit, ViewChild, ElementRef } from "@angular/core";
import { isAndroid } from "platform";
import { SelectedIndexChangedEventData, TabView, TabViewItem } from "tns-core-modules/ui/tab-view";
import { Label } from "ui/label";
import { Progress } from "ui/progress";
import { TouchGestureEventData } from "ui/gestures";

import { CryptoService } from "../lib/services";

@Component({
    selector: "register",
    moduleId: module.id,
    templateUrl: "./register.component.html",
    styleUrls: ["./register.component.css"]
})
export class RegisterComponent implements OnInit {

    private readonly seedLimit: number = 50;
    private step: number;
    private seed: any[];
    private passPhrase: string;

    /*
    Step 0: Loading screen
    Step 1: Start screen
    Step 2: Seed creation
    Step 3: Passphrase display
    Step 4:
    */

    constructor(private cryptoService: CryptoService) {
        this.step = 1;
        this.seed = [];
    }

    ngOnInit(): void {

    }

    public onTapStart(e) {
        // start seed process
        this.step = 2;
    }

    public onTouch(args: TouchGestureEventData) {
        // take seed from seed Area
        this.seed.push([args.getX(), args.getY(), new Date()]);
        if (this.seed.length >= this.seedLimit) {
            // set to loading screen while passphrase creation
            this.step = 0;
            this.cryptoService.generatePassPhrase(this.seed)
                .then(phrase => {
                    this.passPhrase = phrase;
                    this.step = 3;
                }
            );
        }
    }

}
