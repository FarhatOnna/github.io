"use strict";

(function (){
    if(!sessionStorage.getItem("user")){
        console.log("[AUTHGUARD] Unauthoriszed access detected. Redirecting to login page");
        location.href = "login.html";
    }
})();