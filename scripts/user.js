"use strict";

(function (core) {
    class User {
        constructor(displayName = "", emailAddress = "", username = "", password = "") {
            this.displayName = displayName;
            this.emailAddress = emailAddress;
            this.username = username;
            this.password = password;
        }

        get displayName() {
            return this._displayName;
        }

        get emailAddress() {
            return this._emailAddress;
        }

        get username() {
            return this._username;
        }

        set emailAddress(emailAddress) {
            return this._emailAddress = emailAddress;
        }

        set displayName(displayName) {
            return this._displayName = displayName;
        }

        set username(username) {
            return this._username = username;
        }

        toString(){
            return `Display Name: ${this.displayName}
            \nEmail Address: ${this._emailAddress}\nUsername: ${this._username}`;
        }
        toJSON(){
            return{
                DisplayName: this._displayName,
                EmailAddress: this._emailAddress,
                UserName: this._username,
                Password: this._password
            }
        }

        fromJSON(data){
            this._displayName = data.DisplayName;
            this._emailAddress = data.EmailAddress;
            this._username = data.Username;
            this._password = data.password;
        }

        serialize(){
            if(this._displayName !== "" && this._emailAddress !== "" && this._username !== ""){
                return `${this._displayName}, ${this._emailAddress}, ${this._username}`;
            }
            console.error("[ERROR] Failed to serialize. One or more user properties are missing");
            return null;
        }

        deserialize(data){
            let propertyArray = data.split(',');
            this._displayName = propertyArray[0];
            this._emailAddress = propertyArray[1];
            this._username = propertyArray[2];

        }
    }
    core.User = User;
}) (core || (core = {}));