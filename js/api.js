function req(method, params) {
    return fetch("http://127.0.0.1:9933/", {
        method: 'POST',
        mode: 'cors',
        body: JSON.stringify({
            "jsonrpc": "2.0",
            "id": "1",
            "method": method,
            "params": params
        }),
        headers: new Headers({ 'Content-Type': 'application/json' })
    }).then(r => r.json()).then(r => r.result);
}