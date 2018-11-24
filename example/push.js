const tooc = require('../');

const obj = new tooc({
    field1: {
        field12: null,
        arr: [1, 2, {
            d: 'ool',
        }],
    },
});

console.dir(obj.get('field1.arr[1]'));
obj.push('field1.arr', 123)
console.dir(obj.get('field1.arr'));