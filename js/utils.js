function stringToSeed(s) {
    var data = new Uint8Array(32);
    data.fill(32);
    for (var i = 0; i < s.length; i++){
        data[i] = s.charCodeAt(i);
    }
    return data;
}

function stringToBytes(s) {
    var data = new Uint8Array(s.length);
    for (var i = 0; i < s.length; i++){
        data[i] = s.charCodeAt(i);
    }
    return data;
}

function hexToBytes(str) {
    if (!str) {
        return new Uint8Array();
    }
    var a = [];
    for (var i = 0, len = str.length; i < len; i += 2) {
        a.push(parseInt(str.substr(i, 2), 16));
    }

    return new Uint8Array(a);
}

function bytesToHex(uint8arr) {
    if (!uint8arr) {
        return '';
    }
    var hexStr = '';
    for (var i = 0; i < uint8arr.length; i++) {
        var hex = (uint8arr[i] & 0xff).toString(16);
        hex = (hex.length === 1) ? '0' + hex : hex;
        hexStr += hex;
    }

    return hexStr.toUpperCase();
}

function toLEHex(val, bytes) {
    let be = ('00'.repeat(bytes) + val.toString(16)).slice(-bytes * 2);
    var le = '';
    for (var i = 0; i < be.length; i += 2) {
        le = be.substr(i, 2) + le;
    }
    return le;
}

function leHexToNumber(le) {
    var be = '';
    for (var i = 0; i < le.length; i += 2) {
        be = le.substr(i, 2) + be;
    }
    return Number.parseInt(be, 16);
}