var btName = ''
function launchiOSApp(url) {
    window.location = url;

    var appleAppStoreLink = "/dl_lockly.html";
    var now = new Date().valueOf();
    setTimeout(function () {
         window.location = appleAppStoreLink;
    }, 3000);
}

function launchIframeApproach(url) {
       var iframe = document.createElement("iframe");
          iframe.style.border = "none";
          iframe.style.width = "1px";
          iframe.style.height = "1px";
          iframe.onload = function() {
          document.location = url;
       }
          document.body.appendChild(iframe);
   }

function launchWebkitApproach(url, alt) {
       document.location = url;
       timer = setTimeout(function () {
           document.location = alt;
       }, 3000);
   }

function launchAndroidApp(url,ekey,ua) {
       var androidAppStore =  "/dl_lockly.html";
       var intentAppStore = "https%3A%2F%2Fplay.google.com%2Fstore%2Fapps%2Fdetails?id=com.lockly.smartlock";
       var g_intent = "scheme=pglockly;package=com.lockly.smartlock;S.key="+ekey+";S.browser_fallback_url="+intentAppStore+";end"; //see notes below

       if(navigator.userAgent.match(/Chrome/)) {
           var intent = url.replace('pglockly', 'intent') + '#Intent;' + g_intent; //see notes below

           if(ua.match(/SamsungBrowser/)||
              ua.match(/Quark/)||
              ua.match(/Vivo/)||
              ua.match(/Oppo/)||
              ua.match(/Sogou/)||
              ua.match(/QQBrowser/)||
              ua.match(/Miui/)){
                   var tt = setTimeout(function () {
                            document.location = androidAppStore;
               }, 3000);
           }
           document.location = intent;
       }
       else if (navigator.userAgent.match(/Firefox/)) {
           urlAndKey=url+"?key="+ekey;
           launchWebkitApproach(urlAndKey, androidAppStore);
       }
       else {
           urlAndKey=url+"?key="+ekey;
           launchIframeApproach(urlAndKey);
           setTimeout(function () {
                   launchIframeApproach(androidAppStore);
           }, 3000);
       }
   }

function isWeixinBrowser() {
       var ua = navigator.userAgent.toLowerCase();
       return (/micromessenger/.test(ua)) ? true : false;
   }

function isQQBrowser(iOS) {
   var ua = navigator.userAgent;
   //alert(ua);
   if(iOS){
       return (ua.toLowerCase().match(/QQ/i) == "qq") ? true : false;
   }
   else{
       if(ua.toLowerCase().indexOf('mqqbrowser')>-1){
           return true;
       }
       return false;
   }
}

function alertToUseSystemBrowser(){
   var obj=document.getElementById("wechat_guide");
   var timer=null;
   var i=0;
   clearInterval(timer);
   timer=setInterval(function(){
       obj.style.display=i++%2?"none":"block";
       i>8&&clearInterval(timer);
   },100);
}

function getPara(val){
   var uri = window.location.search;
   var re = new RegExp("" +val+ "=([^&?]*)", "ig");
   return ( (uri.match(re))?(uri.match(re)[0].substr(val.length+1)):null );
}

function launchapp() {
   btName = getPara("btName");
//    console.log(ekey)
   document.getElementById("ekey").innerHTML=ekey;
    // var p = getPara("p")
    // console.log(p)
//    var url = location.href
//    var url = 'http://apiserv03c.pin-genie.com/ekey_lr.html?ekey=SBTQX8D3BJ&p=Mar&st=11%3A27%20&et=11%3A27%20'
//     url = url.split('?')[1]
//     url = url.replace(/%20/ig, ' ')
//     url = url.replace(/%3A/ig, ':')
//     url = url.split('&')
//     var obj = {}
//     for(var i = 0;i< url.length;i++){
//         var arr = url[i].split('=');
//         obj[arr[0]] = arr[1];
//     }
//     // console.log(obj)
//     // document.getElementById("ekey").innerHTML = obj.ekey;
//     document.getElementById("rec").innerHTML = obj.p;
//     // if(obj.st)
//     document.getElementById("start").innerHTML = obj.st;
//     document.getElementById("end").innerHTML = obj.et;
    // var url = location.href
    // var url = 'http://apiserv03c.pin-genie.com/ekey_lr.html?ekey=SGCB7W3D8T&p=Wed%20%20Thu&st=5:56%20%E4%B8%8B%E5%8D%88&et=6:55%20%E4%B8%8B%E5%8D%88'
    // url = url.split('?')[1]
    // url = url.replace(/%20/ig, ' ')
    // url = url.replace(/%3A/ig, ':')
    // url = url.split('&')
    // var obj = {}
    // for(var i = 0;i< url.length;i++){
    //     var arr = url[i].split('=');
    //     obj[arr[0]] = arr[1];
    // }
    // // console.log(obj)
    // // document.getElementById("ekey").innerHTML = obj.ekey;
    // document.getElementById("rec").innerHTML = obj.p;
    // // document.getElementById("start").innerHTML = obj.st;
    // // document.getElementById("end").innerHTML = obj.et;
    // document.getElementById("start").innerHTML = decodeURIComponent(obj.st);
    // document.getElementById("end").innerHTML = decodeURIComponent(obj.et);
}

function setStyleSheet(title){
   var link_list = document.getElementsByTagName("link");
   if ( link_list ){
       for ( var i=0;i<link_list.length;i++ ){
           if ( link_list[i].getAttribute("rel").indexOf("style") != -1 ){
               link_list[i].disabled = true;
               if ( link_list[i].getAttribute("title") === title){
                   link_list[i].disabled = false;
               }
           }
       }
   }
};


$(function() {
//    launchapp();
   var iOS = /(iPad|iPhone|iPod)/g.test( navigator.userAgent );
   var iPad = /(iPad)/g.test( navigator.userAgent );
   var box1=document.getElementById("wechat_guide");
   if(isWeixinBrowser() || isQQBrowser(iOS)){
       box1.style.display="block";
   }else{
       box1.style.display="none";
   }
   if(iOS){
       var tip_img = document.getElementById("guide_img");
       tip_img.src="img/tip_ios.png"
   }
   if(iPad){
       //alert("Itis an iPad!!!"+"resolution:"+window.screen.availHeight+"x"+window.screen.width);
       setStyleSheet("iPad");
   }else{
       setStyleSheet("default");
   }

   $('#open-app-link').click( function () {
         var iOS = /(iPad|iPhone|iPod)/g.test( navigator.userAgent );
         if(isWeixinBrowser() || isQQBrowser(iOS)){
             alertToUseSystemBrowser();
             //alert('Please open this page from your system browser!');
         } else if(!iOS) {
             launchAndroidApp('pglockly://com.lockly.smartlock',ekey,navigator.userAgent);
         } else {
             launchiOSApp('https://pgep001.lockly.com/access/oac?btName='+ btName);
         }
    });

   $('#download-app-link').click( function () {
        var iOS = /(iPad|iPhone|iPod)/g.test( navigator.userAgent );
        if(iOS) {
            window.location = 'https://pgep001.lockly.com/access/oac?btName=' + btName;
         }else{
            window.location = "https://play.google.com/store/apps/details?id=com.lockly.smartlock";
         }
   });
});
