var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
var createNode = function (node) {
    var newNode = {
        DOMNode: node,
        width: node.clientWidth,
        height: node.clientHeight,
        next: null,
        prev: null
    };
    return newNode;
};
// creates array properly linked nodes 
var createList = function () {
    var list = {
        collection: [],
        head: null,
        tail: null,
        current: null
    };
    // list.collection = appendNodes(node, container)
    // list.head = list.collection[0]
    // list.tail = list.collection[list.collection.length - 1]
    // list.current = list.head
    return list;
};
var append = function (slide) { return function (collection) {
    var _collection = __spreadArrays(collection);
    var prev = _collection[collection.length - 1];
    var current = slide;
    current.prev = prev;
    prev.next = current;
    _collection.push(current);
    return _collection;
}; };
var list = createList();
console.log(list);
console.log('hello');
// list.collection = document.querySelector('.img__inner')
// list.collection = Array.from(document.querySelector('.slider__inner')?.childNodes)
// console.log(test)
// interface Slider {
//     list: ILinkedList
//     controllers: IController[] | IController
// }

//# sourceMappingURL=main.js.map
