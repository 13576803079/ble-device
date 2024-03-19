function getPara(val){
    var uri = window.location.search;
    var re = new RegExp("" +val+ "=([^&?]*)", "ig");
    return ( (uri.match(re))?(uri.match(re)[0].substr(val.length+1)):null );
}

function getOacPassword(){
    let $oacList = document.querySelectorAll('.oacPwd')
    let oacPwd = '9632'
    if(getPara('oac')){
        oacPwd = getPara('oac')
    }
    
    $oacList.forEach(item => {
        item.innerText = oacPwd
    })
}

function setUnlockHref(){
    let $url = document.querySelector('.unlock-tip a')
    let btName = ''
    if(getPara('bn')){
        btName = getPara('bn')
        $url.href = `https://13576803079.github.io/ble-device?btName=${btName}`
        $url.innerText = `https://13576803079.github.io/ble-device?btName=${btName}`
    }
    
}

getOacPassword()
setUnlockHref()
