const sym = Symbol('tooc');

const freeze = (obj) => {
    return Object.keys(obj).forEach(prop =>
        !(obj[prop] instanceof Object) || Object.isFrozen(obj[prop]) ? null : freeze(obj[prop])
    ) || Object.freeze(obj);
}

const equals = (obj, source) => {
    return Object.keys(source).every(key => 
        obj.hasOwnProperty(key) && (
            !(obj[key] instanceof Object) && obj[key] === source[key] || 
            obj[key] instanceof Object && equals(obj[key], source[key])
        )
    );
}

const clone = (obj) => {
    const copy = Object.assign({}, obj);
    Object.keys(copy).forEach(key =>
        (copy[key] = obj[key] instanceof Object ? clone(obj[key]) : obj[key])
    );
    return Array.isArray(obj) ? (copy.length = obj.length) && Array.from(copy) : copy;
};

function tooc(_data = {}, _options = {}) {

    if(!_data instanceof Object)
        throw new Error('Data is not object');

    const data = clone(_data);
    const options = Object.freeze(_options);

    const getArray = (_path = "") => {
        const path = _path
            .replace(/\[([^\[\]]*)\]/g, '.$1.')
            .split('.')
            .filter(t => t.trim() !== '');

        const adder = path.reduce((acc, next) => acc && acc[next], data);

        if(!Array.isArray(adder))
            throw new Error('Path is not array');

        return adder;
   }

    const out = {
        [sym]: true,
    }

    out.get = (_path = "") => {
        if(!_path instanceof String)
            throw new Error('Path is not string');

        return _path
            .replace(/\[([^\[\]]*)\]/g, '.$1.')
            .split('.')
            .filter(t => t.trim() !== '')
            .reduce((acc, next) => acc && acc[next], data);
    }

    out.equals = (_source) => {
        let source;
        if(_source[sym])
            source = _source.get();
        else if(_source instanceof Object)
            source = _source;
        else
            throw new Error('Source is not tooc instance or object');

        return equals(data, source) && equals(source, data);
    }

    out.set = (_path, _value) => {
        let value;
        if(_value instanceof Object)
            value = clone(_value);
        else
            value = _value;

        const path = _path
            .replace(/\[([^\[\]]*)\]/g, '.$1.')
            .split('.')
            .filter(t => t.trim() !== '');

        const key = path.pop();
        const item = path.reduce((acc, next) => acc && acc[next], data);

        if(item instanceof Object)
            item[key] = value;
        else
            throw new Error('Can not set data');
    }

    out.push = (path, _value) => {
        let value;
        if(_value instanceof Object)
            value = clone(_value);
        else
            value = _value;

        const arr = getArray(path);
        arr.push(value);
    }

    out.pop = (path, _value) => {
        let value;
        if(_value instanceof Object)
            value = clone(_value);
        else
            value = _value;

        const arr = getArray(path);
        arr.pop(value);
    }

    return Object.freeze(out);

}

module.exports = tooc;