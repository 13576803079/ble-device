// crc8.js  
function crc8(data, polynomial) {  
    let crc = 0;  
    const length = data.length;  
  
    for (let i = 0; i < length; i++) {  
        crc ^= data.charCodeAt(i);  
  
        for (let j = 0; j < 8; j++) {  
            if (crc & 0x80) {  
                crc = (crc << 1) ^ polynomial;  
            } else {  
                crc <<= 1;  
            }  
        }  
    }  
  
    return crc & 0xFF;  
}  

const u8cCrcHalfTab = [0x0, 0x31, 0x62, 0x53, 0xC4, 0xF5, 0xA6, 0x97, 0xB9, 0x88, 0xDB, 0xEA, 0x7D, 0x4C, 0x1F, 0x2E];

function addCrc8ToLast(pu8Data) {
    const lenCrc = pu8Data.length - 1;
    const srr = new Uint8Array(lenCrc);
    for (let i = 0; i < lenCrc; i++) {
        srr[i] = pu8Data[i];
    }
    
    const crc8 = getCRC8ByStr(pu8Data)
    pu8Data += decimalToHexWithPadding(crc8);
    return pu8Data
}

function getCrc8Data(pu8Data) {
    let u8CrcData = 0;
    pu8Data.forEach(u8Data => {
        let u8Temp = (u8CrcData >> 4) ^ (u8Data >> 4); //MSB
        u8CrcData = (u8CrcData << 4) & 0xFF;
        u8CrcData ^= u8cCrcHalfTab[u8Temp];

        u8Temp = (u8CrcData >> 4) ^ (u8Data & 0x0F); //LSB
        u8CrcData = (u8CrcData << 4) & 0xFF;
        u8CrcData ^= u8cCrcHalfTab[u8Temp];
    });
    u8CrcData &= 0xFF;
    return u8CrcData;
}

function getCRC8ByStr(cStr) {
    if (!cStr) {
        return 0;
    }
    const len = cStr.length / 2;
    const cShort = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        const cTempStr = cStr.substring(i * 2, i * 2 + 2);
        cShort[i] = parseInt(cTempStr, 16);
    }
    return getCrc8Data(cShort);
}
  

  
