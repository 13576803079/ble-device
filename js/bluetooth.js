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

    
    // Connect Button (search for BLE Devices only if BLE is available)
    connectDeviceButton.addEventListener('click', (event) => {
        if(isIOS()){
            window.location.href = 'https://pgep001.lockly.com/access/oac?btName=' + blueName
            return
        }
        if (isWebBluetoothEnabled()){
            connectToDevice();
        }else{
            alert('Unable to connect to the Bluetooth device. Please try again using Google Chrome or the default browser on your Samsung phone.');
        }
    });

    // Disconnect Button
    // disconnectButton.addEventListener('click', disconnectDevice);

    // Write to the ESP32 LED Characteristic
    // verifyButton.addEventListener('click', () => writeOnCharacteristic(getWriteData()));
    // offButton.addEventListener('click', () => writeOnCharacteristic('A1'));

    // Check if BLE is available in your Browser
    function isWebBluetoothEnabled() {
        if (!navigator.bluetooth) {
            console.log('Web Bluetooth API is not available in this browser!');
            // bleStateContainer.innerHTML = "Web Bluetooth API is not available in this browser/device!";
            return false
        }
        console.log('Web Bluetooth API supported in this browser.');
        return true
    }

    // Connect to BLE Device and Enable Notifications
    function connectToDevice(){
        console.log('Initializing Bluetooth...', blueName);
        bluetoothDevice = null
        navigator.bluetooth.requestDevice({
            filters: [{namePrefix: blueName}],
            optionalServices: [bleService]
        })
        .then(device => {
            console.log('Device Selected:', device.name);
            bluetoothDevice = device
            // bleStateContainer.innerHTML = 'Connected to device ' + device.name;
            // bleStateContainer.style.color = "#24af37";
            device.addEventListener('gattservicedisconnected', onDisconnected);
            $connectStatusImg.style.display = 'none'
            $connectStatus.innerText = 'Connecting'
            $stage.style.display = 'flex'
            retryToDevice()
            // return device.gatt.connect();
        })
        // .then(gattServer =>{
        //     bleServer = gattServer;
        //     console.log("Connected to GATT Server");
        //     return bleServer.getPrimaryService(bleService);
        // })
        // .catch(error => {
        //     console.log('Error: ', error);
        //     if (retries < RETRY_LIMIT) {
        //         retries++;
        //         console.log(`Attempt ${retries} of ${RETRY_LIMIT}`);
        //         // connectToDevice()
        //         retryToDevice()
        //         return
        //     } else {
        //         retries = 0
        //         alert('Unable to connect to the Bluetooth device. Please try again.');
        //         return
        //     }
        // })
        // .then(service => {
        //     bleServiceFound = service;
        //     console.log("Service discovered:", service.uuid);
        //     return service.getCharacteristic(sensorCharacteristic);
        // })
        // .then(characteristic => {
        //     console.log("Characteristic discovered:", characteristic.uuid);
        //     sensorCharacteristicFound = characteristic;
        //     characteristic.addEventListener('characteristicvaluechanged', handleCharacteristicChange);
        //     characteristic.startNotifications();
        //     console.log("Notifications Started.");
        // })
        
    }

    function retryToDevice(){
        return bluetoothDevice.gatt.connect()
        .then(gattServer =>{
            bleServer = gattServer;
            console.log("Connected to GATT Server");
            return bleServer.getPrimaryService(bleService);
        })
        .then(service => {
            bleServiceFound = service;
            console.log("Service discovered:", service.uuid);
            return service.getCharacteristic(sensorCharacteristic);
        })
        .then(characteristic => {
            console.log("Characteristic discovered:", characteristic.uuid);
            sensorCharacteristicFound = characteristic;
            characteristic.addEventListener('characteristicvaluechanged', handleCharacteristicChange);
            characteristic.startNotifications();
            console.log("Notifications Started.");
            document.getElementById("unlockPage").style.display = "block";
            document.getElementById("bluetoothPage").style.display = "none";
            $connectStatus.innerText = ''
            // $connectStatusImg.style.display = 'none'
            $stage.style.display = 'none'
        })
        .catch(error => {
            console.log('Error: ', error);
            if(bluetoothDevice){
                if (retries < RETRY_LIMIT) {
                    retries++;
                    console.log(`Attempt ${retries} of ${RETRY_LIMIT}`);
                    // connectToDevice()
                    var timeoutRetry = setTimeout(() => {
                        clearTimeout(timeoutRetry)
                        retryToDevice()
                    }, 1000)
                    
                } else {
                    retries = 0
                    $connectStatus.innerText = '连接设备失败，请离设备近一点再试一次'
                    $stage.style.display = 'none'
                    alert('Unable to connect to the Bluetooth device. Please try again.');
                }
            }
        })
    }


    function onDisconnected(event){
        console.log('Device Disconnected:', event.target.device.name);
        // bleStateContainer.innerHTML = "Device disconnected";
        // bleStateContainer.style.color = "#d13a30";

        connectToDevice();
    }

    function handleCharacteristicChange(event){
        let value = event.target.value;
        let hexString = '';
        for (let i = 0; i < value.byteLength; i++) {
            hexString += value.getUint8(i).toString(16).padStart(2, '0');
        }
        console.log('收到的数据(bytes):', value);
        console.log('收到的数据(hex):', hexString.toLocaleUpperCase());
        if(isSuccessUnlock(hexString.toLocaleUpperCase())){
            document.querySelector('.unlockSuccess').style.display = 'block'
            document.querySelector('.checkPassword').style.display = 'none'
        }else{
            $resultDesc.innerText = 'Wrong password, please re-enter!';
        }
        // const newValueReceived = new TextDecoder().decode(event.target.value);
        // console.log("Characteristic value changed: ", newValueReceived);
        // retrievedValue.innerHTML = hexString;
        // timestampContainer.innerHTML = getDateTime();
    }

    function isSuccessUnlock(value = 'A1B2C3D40A000AA1009F'){
        console.log(value.substring(16, 18))
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
    let maxWriteValueLength = 20; // 假设每次可以写20个字节，需根据实际情况来设置

    // 将数据分成多个数据块
    function splitDataIntoChunks(data, chunkSize) {
        const chunks = [];
        for (let i = 0; i < data.byteLength; i += chunkSize) {
            chunks.push(data.slice(i, i + chunkSize));
        }
        return chunks;
    }

    // 向特性写数据的函数，使用队列以保持写操作有序
    async function writeDataToDevice(characteristic, data) {
        // // 获取特性的最大写入值长度
        // if (characteristic.properties.writeWithoutResponse) {
        //     maxWriteValueLength = await characteristic.writeValueWithResponse(new Uint8Array()); //测试获取最大长度
        // } else {
        //     maxWriteValueLength = await characteristic.writeValue(new Uint8Array());
        // }
        // console.log(maxWriteValueLength)
        const chunks = splitDataIntoChunks(data, maxWriteValueLength);
        for (const chunk of chunks) {
            console.log(chunk)
            await characteristic.writeValue(chunk);
        }
        console.log(data)
    }

    function writeOnCharacteristic(value){
        if (bleServer && bleServer.connected) {
            bleServiceFound.getCharacteristic(ledCharacteristic)
            .then(characteristic => {
                console.log("Found the LED characteristic: ", characteristic.uuid, characteristic, new TextEncoder('utf-8').encode(value));
                // const data = new Uint8Array([value]);
                // // const data = Uint8Array.of(value)
                // console.log(data, new TextEncoder().encode(value), new TextDecoder().decode(data))  0x01, 0x02, 0x03  new TextEncoder('utf-8').encode(value)
                console.log(value.match(/[\da-f]{2}/gi).map(h => parseInt(h, 16)), new Uint8Array(value.match(/[\da-f]{2}/gi).map(h => parseInt(h, 16))))
                return writeDataToDevice(characteristic, new Uint8Array(value.match(/[\da-f]{2}/gi).map(h => parseInt(h, 16))))
                // return writeDataToDevice(characteristic, new Uint8Array(new TextEncoder('utf-8').encode(value)))
                // return characteristic.writeValue(new Uint8Array(new TextEncoder('utf-8').encode(value)));
            })
            .then(() => {
                // latestValueSent.innerHTML = value;
                console.log("Value written to LEDcharacteristic:", value);
            })
            .catch(error => {
                console.error("Error writing to the LED characteristic: ", error);
            });
        } else {
            console.error ("Bluetooth is not connected. Cannot write to characteristic.")
            // window.alert("Bluetooth is not connected. Cannot write to characteristic. \n Connect to BLE first!")
        }
    }

    function disconnectDevice() {
        console.log("Disconnect Device.");
        if (bleServer && bleServer.connected) {
            if (sensorCharacteristicFound) {
                sensorCharacteristicFound.stopNotifications()
                    .then(() => {
                        console.log("Notifications Stopped");
                        return bleServer.disconnect();
                    })
                    .then(() => {
                        console.log("Device Disconnected");
                        // bleStateContainer.innerHTML = "Device Disconnected";
                        // bleStateContainer.style.color = "#d13a30";

                    })
                    .catch(error => {
                        console.log("An error occurred:", error);
                    });
            } else {
                console.log("No characteristic found to disconnect.");
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
        const encoder = new TextEncoder(); // 创建一个TextEncoder实例  
        const uint8Array = encoder.encode(str); // 将字符串编码为Uint8Array  
        return uint8Array.length; // 返回字节长度  
    }  

    function decimalToHexWithPadding(decimalNumber) {  
        const hexString = decimalNumber.toString(16).toUpperCase();  
        // 使用padStart方法确保字符串长度至少为4，如果不足则前面填充0  
        return hexString.padStart(2, '0');  
        // return hexString
    }  

    function stringToHexString(str) {  
        // 创建一个TextEncoder实例  
        const encoder = new TextEncoder();  
          
        // 将字符串编码为Uint8Array  
        const uint8Array = encoder.encode(str);  
          
        // 将每个字节转换为16进制数，并拼接成一个字符串  
        const hexString = uint8Array.map(byte => byte.toString(16).padStart(2, '0')).join('');  
          
        return hexString;  
      }  

    function getHexByteLength(hexString) {  
        // 确保输入是有效的16进制字符串  
        if (!/^[0-9a-fA-F]+$/.test(hexString)) {  
          throw new Error('Invalid hexadecimal string');  
        }  
          
        // 每两个16进制字符代表一个字节  
        return Math.floor(hexString.length / 2);  
    }  
    function formatNumber(num) {
        // 将数字转换为字符串
        const str = num.toString();
        // 用来存储结果的字符串
        let result = '';
      
        // 遍历字符串中的每个字符
        for (let i = 0; i < str.length; i++) {
          // 检查字符长度，并在单个字符前面添加'0'
          result += (str[i].length === 1) ? ('0' + str[i]) : str[i];
        }
      
        return result;
    }
      
    // getWriteData()
    // console.log(isSuccessUnlock())
    // console.log(getHexByteLength(`A1B2C3D416108ACACAABBCCEEFF01020304`))
    // // const data = "Hello";  
    // const checksum = addCrc8ToLast('16108ACACAABBCCEEFF01020304');  
    // console.log(checksum)
    // console.log(`CRC8 Checksum: 0x${checksum.toString(16).toUpperCase()}, ${checksum}`);

