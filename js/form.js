function encodeParam(type, name) {
    switch (type) {
        case 'AccountId':
        case 'Hash': {
            // TODO: better account id
            let v = document.getElementById(name).value;
            if (v.length == 64 && !Number.isNaN(Number.parseInt(v, 16)))
                return v;
            else
                return bytesToHex(nacl.sign.keyPair.fromSeed(stringToSeed(v)).publicKey);
        }
        case 'Balance':
        case 'BlockNumber': {
            // TODO: integer input
            let v = document.getElementById(name).value;
            return toLEHex(+v, 8);
        }
        case 'Proposal': {
            let id = document.getElementById(name).selectedOptions[0].id.split('.');
            let params = CALLS[id[0]].priv_calls[id[1]].params;
            let h = id.map(i => toLEHex(i, 1)).join('');
            params.forEach(p => {
                h += encodeParam(p.type, name + '.params.' + p.name);
            });
            return h;
        }
        case 'VoteThreshold': return document.getElementById(name).value;
        case 'u32':
        case 'VoteIndex':
        case 'PropIndex':
        case 'ReferendumIndex': {
            // TODO: integer input
            let v = document.getElementById(name).value;
            return toLEHex(+v, 4);
        }
        case 'bool': {
            // TODO: checkbox
            let v = document.getElementById(name).value;
            return (v == 'true' || v == 1) ? '01' : '00';
        }
        case 'Vec<bool>': {
            // TODO: dynamic array of checkboxes
            let v = document.getElementById(name).value;
            let h = toLEHex(v.length, 4);
            for (i in v) {
                h += '0' + i;
            }
            return h;
        }
        case 'Vec<u8>': {
            // TODO: upload widget
            let v = document.getElementById(name).value;
            return toLEHex(v.length / 2, 4) + v;
        }
        case 'Vec<KeyValue>': {
            let k = document.getElementById(`${name}_key`).value;
            k = toLEHex(k.length / 2, 4) + k;
            let v = document.getElementById(`${name}_value`).value;
            v = toLEHex(v.length / 2, 4) + v;
            return toLEHex(1, 4) + k + v;
        }
        default: {
            return document.getElementById(name).value;
        }
    }
}

function encodedCall() {
    let id = document.getElementById('call').selectedOptions[0].id.split('.');
    let params = CALLS[id[0]].calls[id[1]].params;
    let h = id.map(i => toLEHex(i, 1)).join('');
    params.forEach(p => {
        h += encodeParam(p.type, 'param_' + p.name);
    });
    return h;
}

function submit() {
    var seed = document.getElementById("seed").value;
    var sender = document.getElementById("pubkey").value;
    var index = document.getElementById("index");
    index = +(index.value == '' ? index.placeholder : index.value);

    let ext = sender + toLEHex(index, 8) + encodedCall();
    let p = nacl.sign.keyPair.fromSeed(stringToSeed(seed));
    let sig = bytesToHex(nacl.sign.detached(hexToBytes(ext), p.secretKey));

    ext += sig;

    let method = "author_submitExtrinsic";
    let params = ['0x' + ext];
    
    req(method, params).then(console.log);
}

// function isValid(value, type) {
//     switch (type) {
//         case 'AccountId': return value.length == 20 && !Number.isNaN(Number.parseInt(value, 16));
//         case 'Balance': return '' + +value == value;
//         default: return true;
//     }
// }

function balanceOf(pubkey) {
    let loc = new Uint8Array([...stringToBytes('sta:bal:'), ...hexToBytes(pubkey)]);
    return req('state_getStorage', ['0x' + toLEHex(XXH.h64(loc.buffer, 0), 8) + toLEHex(XXH.h64(loc.buffer, 1), 8)])
        .then(r => r ? leHexToNumber(r.substr(2)) : 0);
}

function indexOf(pubkey) {
    let loc = new Uint8Array([...stringToBytes('sys:non'), ...hexToBytes(pubkey)]);
    return req('state_getStorage', ['0x' + toLEHex(XXH.h64(loc.buffer, 0), 8) + toLEHex(XXH.h64(loc.buffer, 1), 8)])
        .then(r => r ? leHexToNumber(r.substr(2)) : 0);
}

function updateInput() {
    let seed = document.getElementById("seed").value;
    let p = nacl.sign.keyPair.fromSeed(stringToSeed(seed));
    let pubkey = p.publicKey.reduce((memo, i) => memo + ('0' + i.toString(16)).slice(-2), '');
    document.getElementById("pubkey").value = pubkey;
    balanceOf(pubkey).then(b => document.getElementById("pubkey_bal").innerHTML = b);
    indexOf(pubkey).then(b => document.getElementById("index").placeholder = b);
}

function updateExtrinsic() {
    var seed = document.getElementById("seed").value;
    var sender = document.getElementById("pubkey").value;
    var index = document.getElementById("index");
    index = +(index.value == '' ? index.placeholder : index.value);

    let ext = sender + toLEHex(index, 8) + encodedCall();

    document.getElementById("inner").value = ext;

    let p = nacl.sign.keyPair.fromSeed(stringToSeed(seed));
    let sig = bytesToHex(nacl.sign.detached(hexToBytes(ext), p.secretKey));
    document.getElementById("sig").value = sig;
    ext += sig;

    document.getElementById("signed").innerHTML = ext;
}

function updateProposal(name) {
    let id = document.getElementById(name).selectedOptions[0].id.split('.');
    document.getElementById(name + '.params').innerHTML = paramsFor(id, name);
    updateExtrinsic();
}

function paramsFor(id, name) {
    let params = CALLS[id[0]].priv_calls[id[1]].params;
    let h = '';
    params.forEach(p => {
        h += `<div>${p.name}: ${inputFor(p.type, name + '.params.' + p.name)}</div>`;
    });
    return h;
}

function inputFor(type, name) {
    switch (type) {
        case 'Proposal': {
            var id = null;
            var h = `<div><select id="${name}" onchange="updateProposal('${name}')">`;
            CALLS.forEach((mod, mi) => {
                if (mod.priv_calls.length > 0) {
                    h += `<optgroup label=${mod.name}>`;
                    mod.priv_calls.forEach((call, ci) => {
                        if (!id) id = [mi, ci];
                        h += `<option id="${mi}.${ci}">${call.name}</option>`;
                    });
                    h += `</optgroup>`;
                }
            });
            h += `</select><div id="${name}.params">`;
            h += paramsFor(id, name);
            h += `</div></div>`;
            return h;
        }
        case 'VoteThreshold': {
            return `<select id="${name}" onchange="updateExtrinsic()">
            <option value="00">Super-majority approve</option>
            <option value="01">Not super-majority against</option>
            <option value="02">Simple majority</option>
            </select>`;
        }
        case 'Vec<KeyValue>': {
            return `<input id="${name}_key" onkeyup="updateExtrinsic()"></input> = <input id="${name}_value" onkeyup="updateExtrinsic()"></input>`;
        }
        default: return `<input id="${name}" onkeyup="updateExtrinsic()"></input>`;
    }
}

function updateCall() {
    let id = document.getElementById('call').selectedOptions[0].id.split('.');
    let params = CALLS[id[0]].calls[id[1]].params;
    let h = '';
    //if (isValid(this.value, '${p.type}') { this.validity.badInput = false; updateExtrinsic(); } else this.validity.badInput = true;
    params.forEach(p => {
        h += `<div>${p.name}: ${inputFor(p.type, 'param_' + p.name)}</div>`;
    });
    document.getElementById('params').innerHTML = h;
    updateExtrinsic();
}

function updateCalls() {
    let h = '';
    CALLS.forEach((mod, mi) => {
        if (mod.calls.length > 0) {
            h += `<optgroup label=${mod.name}>`;
            mod.calls.forEach((call, ci) => {
                h += `<option id="${mi}.${ci}">${call.name}</option>`;
            });
            h += `</optgroup>`;
        }
    })
    document.getElementById('call').innerHTML = h;
    updateCall();
}