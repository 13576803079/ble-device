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


getOacPassword()