    // import { crc8 } from './crc8'
    var deviceName ='LOCKLYTB000083';
    // var bleService = '19b10000-e8f2-537e-4f6c-d104768a1214';
    var bleService = '0000fff0-0000-1000-8000-00805f9b34fb'
    var ledCharacteristic = '0000fff1-0000-1000-8000-00805f9b34fb';
    var sensorCharacteristic= '0000fff4-0000-1000-8000-00805f9b34fb';
    var deviceWrite = 'A1B2C3D42800A87A5038240EC962EBA757DE77FBDD25711967851FE8ACD28A3147D1365C75EAF723'
    var oacCommand = 'A1B2C3D416106000000000000'

    //Global Variables to Handle Bluetooth
    var bluetoothDevice;
    var bleServer;
    var bleServiceFound;
    var sensorCharacteristicFound;
    const RETRY_LIMIT = 3; // 定义重试次数
    let retries = 0; // 初始化重试次数

    var connectDeviceButton = document.getElementById('connectDeviceButton')
    var verifyButton = document.getElementById('verifyButton')
    const inputs = document.querySelectorAll('.code-input');
    let inputValue = ''
    const $dialog = document.querySelector('.dialog-warpper')
    const $connectError = document.querySelector('.connectError')
    const $connectLost = document.querySelector('.connectLost')
    const $communicationError = document.querySelector('.communicationError')
    const $retryBtn = document.querySelector('.reconnectBtn')

    function openDialog(error){
        if($dialog.style.display == 'block'){
            return
        }
        $dialog.style.display = 'block'
        if(error == 'connectError'){
            $connectError.style.display = 'block'
            $connectLost.style.display = 'none'
            $communicationError.style.display = 'none'
        }else if(error == 'connectLost'){
            $connectLost.style.display = 'block'
            $connectError.style.display = 'none'
            $communicationError.style.display = 'none'
        }else{
            $communicationError.style.display = 'block'
            $connectError.style.display = 'none'
            $connectLost.style.display = 'none'
        }
                    
    }
    function closeDialog(){
        $dialog.style.display = 'none'
        $connectError.style.display = 'none'
        $connectLost.style.display = 'none'
        $communicationError.style.display = 'none'
    }

    // Connect Button (search for BLE Devices only if BLE is available)
    verifyButton.addEventListener('click', (event) => {
        checkPassword()
    });
    function checkPassword(){
        if(password.length == 4){
            $resultDesc.innerText = ''
            connectToDevice()
        }else{
            $resultDesc.innerText = 'Please enter access code'
        }
    }

    // Check if BLE is available in your Browser
    function isWebBluetoothEnabled() {
        if (!navigator.bluetooth) {
            return false
        }
        return true
    }

    // Connect to BLE Device and Enable Notifications
    function connectToDevice(){
        // bluetoothDevice = null
        if(bluetoothDevice && password.length == 4){
            writeOnCharacteristic(getWriteData(password))
            return
        }
        
        navigator.bluetooth.requestDevice({
            filters: [{namePrefix: blueName}],
            optionalServices: [bleService]
        })
        .then(device => {
            
            bluetoothDevice = device
            window.localStorage.setItem(blueName, device.id)
            device.addEventListener('gattservicedisconnected', onDisconnected);
            handleVerityLoading(true, 'Pairing...')
            retryToDevice()
        })
    }

    function handleVerityLoading(loading, status){
        if(loading){
            $verifyBtnText.innerText = status
            verifyButton.classList.add('disabledButton')
            $modal.style.display = 'block'
        }else{
            if($modal.style.display == 'block' && status == 'timeout'){
                openDialog('connectLost')
            }
            $modal.style.display = 'none'
            verifyButton.classList.remove('disabledButton')
            $verifyBtnText.innerText = 'Unlock'
        }
    }

    function retryToDevice(){
        return bluetoothDevice.gatt.connect()
        .then(gattServer =>{
            bleServer = gattServer;
            return bleServer.getPrimaryService(bleService);
        })
        .then(service => {
            bleServiceFound = service;
            return service.getCharacteristic(sensorCharacteristic);
        })
        .then(characteristic => {
            sensorCharacteristicFound = characteristic;
            characteristic.addEventListener('characteristicvaluechanged', handleCharacteristicChange);
            characteristic.startNotifications();
            
            let timeout = setTimeout(() => {
                clearTimeout(timeout)
                writeOnCharacteristic(getWriteData(password))
            }, 1000)

            
            
        })
        .catch(error => {
            if(bluetoothDevice){
                if (retries < RETRY_LIMIT) {
                    retries++;
                    var timeoutRetry = setTimeout(() => {
                        clearTimeout(timeoutRetry)
                        retryToDevice()
                    }, 1000)
                    
                } else {
                    retries = 0
                    bluetoothDevice = null
                    handleVerityLoading(false)
                    openDialog('connectError')
                    // alert('Unable to connect to the Bluetooth device. Please try again.');
                }
            }
        })
    }


    function onDisconnected(event){
        connectToDevice();
    }

    function handleCharacteristicChange(event){
        let value = event.target.value;
        let hexString = '';
        for (let i = 0; i < value.byteLength; i++) {
            hexString += value.getUint8(i).toString(16).padStart(2, '0');
        }
        handleVerityLoading(false)
        
        if(!isSuccessUnlock(hexString.toLocaleUpperCase())){
            $resultDesc.innerText = 'Please enter the correct access code.';
        }
        clearPassword()
    }

    function isSuccessUnlock(value = 'A1B2C3D40A000AA1009F'){
        return value.substring(16, 18) == '00' ? true : false
    }

    async function writeData(characteristic, data) {
        let offset = 0;
        let bytesPerWrite = 20;
        
        while (offset < data.byteLength) {
            let chunk = data.slice(offset, offset + bytesPerWrite);
            await characteristic.writeValue(chunk);
            offset += bytesPerWrite;
        }
    }
    let maxWriteValueLength = 20;

    function splitDataIntoChunks(data, chunkSize) {
        const chunks = [];
        for (let i = 0; i < data.byteLength; i += chunkSize) {
            chunks.push(data.slice(i, i + chunkSize));
        }
        return chunks;
    }

    async function writeDataToDevice(characteristic, data) {
        const chunks = splitDataIntoChunks(data, maxWriteValueLength);
        for (const chunk of chunks) {
            await characteristic.writeValue(chunk);
        }
    }

    function writeOnCharacteristic(value){
        if (bleServer && bleServer.connected) {
            let timeoutFinish = setTimeout(() => {
                clearTimeout(timeoutFinish)
                handleVerityLoading(false, 'timeout')
            }, 12000)
            handleVerityLoading(true, 'Unlocking...')
            bleServiceFound.getCharacteristic(ledCharacteristic)
            .then(characteristic => {
                return writeDataToDevice(characteristic, new Uint8Array(value.match(/[\da-f]{2}/gi).map(h => parseInt(h, 16))))
            })
            .then(() => {
                
            })
            .catch(error => {
                bluetoothDevice = null
                openDialog('communicationError')
            });
        } else {
            bluetoothDevice = null
            openDialog('communicationError')
        }
    }

    function disconnectDevice() {
        if (bleServer && bleServer.connected) {
            if (sensorCharacteristicFound) {
                sensorCharacteristicFound.stopNotifications()
                    .then(() => {
                        return bleServer.disconnect();
                    })
                    .then(() => {
        
                    })
                    .catch(error => {
                        
                    });
            } else {
                
            }
        } else {
            // Throw an error if Bluetooth is not connected
            // console.error("Bluetooth is not connected.");
            // window.alert("Bluetooth is not connected.")
        }
    }
    disconnectDevice()

    function getWriteData(oacPw = '6354'){
        let writeValue = 'A1B2C3D4'
        writeValue = addCrc8ToLast(`A1B2C3D41500A108ACACAABBCCDDEEFF${stringToHexString(oacPw)}`) 
        return writeValue
    }

    function getUtf8ByteLength(str) {  
        const encoder = new TextEncoder(); 
        const uint8Array = encoder.encode(str);   
        return uint8Array.length; 
    }  

    function decimalToHexWithPadding(decimalNumber) {  
        const hexString = decimalNumber.toString(16).toUpperCase();  
        return hexString.padStart(2, '0');  
        // return hexString
    }  

    function stringToHexString(str) {  
        
        const encoder = new TextEncoder();  
          
        const uint8Array = encoder.encode(str);  
          
        const hexString = uint8Array.map(byte => byte.toString(16).padStart(2, '0')).join('');  
          
        return hexString;  
      }  

    function getHexByteLength(hexString) {  
        if (!/^[0-9a-fA-F]+$/.test(hexString)) {  
          throw new Error('Invalid hexadecimal string');  
        }  
          
        return Math.floor(hexString.length / 2);  
    }  
    function formatNumber(num) {
        const str = num.toString();
        
        let result = '';
      
        for (let i = 0; i < str.length; i++) {
          result += (str[i].length === 1) ? ('0' + str[i]) : str[i];
        }
      
        return result;
    }
      

