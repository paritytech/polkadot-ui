function interpretRustCalls(s) {
    return s.split('\n')
        .map(s => s.trim())
        .filter(s => !s.startsWith('//') && !s.length == 0)
        .map(s => s.match(/fn ([a-z_]*)\((aux,? ?)?(.*)\) = ([0-9]+);/))
        .map(([_0, name, _2, p, index], i) => {
            let params = p.length == 0 ? [] : p.split(',').map(p => {
                let m = p.match(/([a-z_]*): *([A-Za-z][A-Za-z<>:0-9]+)/);
                let name = m[1];
                var type = m[2].replace('T::', '');
                type = type.match(/^Box<.*>$/) ? type.slice(4, -1) : type;
                return { name, type };
            });
            if (i != index) throw "Bad index";
            return { name, params };
        });
}