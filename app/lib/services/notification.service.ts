/*
    Copyright 2017 icewave.org
*/

import { Injectable } from "@angular/core";
import { SnackBar, SnackBarOptions } from "nativescript-snackbar";

@Injectable()
export class NotificationService {
    private snackbar: SnackBar;

    constructor() {
        this.snackbar = new SnackBar();
    }

    public error(error: string): void {
        this.snackbar.simple(error, "#9d0416", "#fefcf8");
    }

    public info(message: string) {
        this.snackbar.simple(message, "#000027", "#fefcf8");
    }
}
