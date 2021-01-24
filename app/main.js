var _a, _b, _c;
const NodeF = (element) => ({
    element,
    next: null,
    prev: null
});
const linkNodes = (nodes) => (nodes.map((node, i, arr) => (Object.assign(node, {
    next: arr[i + 1],
    prev: arr[i - 1]
}))));
const compose = (...fns) => (arg) => fns.reduceRight((acc, fn) => fn(acc), arg);
const pipe = (...fns) => (arg) => fns.reduce((acc, fn) => fn(acc), arg);
const withConstructor = (constructor) => (obj) => (Object.assign({ __proto__: {
        constructor
    } }, obj));
const ListWrapper = (nodes) => {
    const collection = [...nodes];
    let head = nodes[0];
    let tail = nodes[nodes.length - 1];
    let current = nodes[0];
    return {
        collection,
        getHead: () => head,
        getTail: () => tail,
        getCurrent: () => current,
        setCurrent: (index) => collection[index] ? current = collection[index] : tail.next,
        toNext: () => current.next ? current = current.next : current.next,
        toPrev: () => current.prev ? current = current.prev : current.prev
    };
};
const Controller = (node) => (activeSelector) => {
    let isActive = false;
    return {
        node,
        renderState: () => {
            if (isActive) {
                node.classList.add(activeSelector);
            }
            else {
                node.classList.remove(activeSelector);
            }
        },
        disable: () => isActive = false,
        enable: () => isActive = true
    };
};
const Transformer = (node) => (...acts) => {
    let actions = [...acts];
    return {
        node,
        render() {
            node.style.transform = actions.join('');
            return node;
        },
        getActions: () => actions,
        setActions(...acts) { return actions = [...acts]; },
    };
};
const LinkedList = (nodes) => (ListWrapper(linkNodes([...nodes].map(NodeF))));
const Controllers = (nodes) => (activeSelector) => ([...nodes].map(Controller).map((fn) => fn(activeSelector)));
const Pointers = (nodes) => (activeSelector) => ({
    nodes: Controllers(nodes)(activeSelector),
    prev: null,
    render(index) {
        this.nodes.forEach((point, i) => {
            if (index === i) {
                point.enable();
                point.renderState();
                if (this.prev) {
                    this.prev.disable();
                    this.prev.renderState();
                }
                this.prev = point;
            }
        });
    }
});
const Slider = ({ pages, track, prevBtn, nextBtn, pointers, isVertical }) => {
    const _pages = Object.assign({}, pages);
    const _track = Object.assign({}, track);
    const _prevBtn = Object.assign({}, prevBtn);
    const _nextBtn = Object.assign({}, nextBtn);
    let _pointers;
    if (pointers)
        _pointers = Object.assign({}, pointers);
    if (_pages.collection.length !== 0)
        _nextBtn.enable();
    return {
        prevBtn: _prevBtn,
        nextBtn: _nextBtn,
        pointers: _pointers,
        currentSlide: 1,
        render(slideNum) {
            let page;
            if (slideNum === this.currentSlide + 1) {
                page = _pages.toNext();
            }
            else if (slideNum === this.currentSlide - 1) {
                page = _pages.toPrev();
            }
            else {
                page = _pages.setCurrent(slideNum - 1);
            }
            if (!page)
                return;
            let multiplier = slideNum - 1;
            if (this.currentSlide === _pages.collection.length ||
                this.currentSlide > slideNum) {
                multiplier = this.currentSlide - (this.currentSlide - slideNum + 1);
            }
            _track.setActions(isVertical ?
                `translateY(-${page.element.clientHeight * multiplier}px)` :
                `translateX(-${page.element.clientWidth * multiplier}px)`);
            if (!page.next) {
                nextBtn === null || nextBtn === void 0 ? void 0 : nextBtn.disable();
                nextBtn === null || nextBtn === void 0 ? void 0 : nextBtn.renderState();
            }
            else if (!page.prev) {
                prevBtn === null || prevBtn === void 0 ? void 0 : prevBtn.disable();
                prevBtn === null || prevBtn === void 0 ? void 0 : prevBtn.renderState();
            }
            else {
                nextBtn === null || nextBtn === void 0 ? void 0 : nextBtn.enable();
                nextBtn === null || nextBtn === void 0 ? void 0 : nextBtn.renderState();
                prevBtn === null || prevBtn === void 0 ? void 0 : prevBtn.enable();
                prevBtn === null || prevBtn === void 0 ? void 0 : prevBtn.renderState();
            }
            if (pointers) {
                pointers.render(slideNum - 1);
            }
            this.currentSlide = slideNum;
            return _track.render();
        }
    };
};
const Question = ({ controller, box, controllerAct, boxAct }) => ({
    btn: Controller(controller)(controllerAct),
    answer: Transformer(box)(boxAct)
});
const question = Question({
    controller: document.querySelector('.question__controller'),
    box: document.querySelector('.question__answer'),
    controllerAct: 'question__controller--active',
    boxAct: 'question__answer--active'
});
console.log(question);
const qa = Pointers(document.querySelectorAll('.question__controller'))('question__controller--active');
(_a = document.querySelector('.qa__wrapper')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', (e) => {
    qa.nodes.forEach((btn, i) => {
        if (e.target === btn.node) {
            qa.render(i);
        }
    });
});
const imgSlider = Slider({
    pages: LinkedList(document.querySelectorAll('.slider__img')),
    track: Transformer(document.querySelector('.slider__inner'))(),
    prevBtn: Controller(document.querySelector('.controller--left'))('controller--active'),
    nextBtn: Controller(document.querySelector('.controller--right'))('controller--active'),
});
(_b = document.querySelector('.buttonContainer')) === null || _b === void 0 ? void 0 : _b.addEventListener('click', (e) => {
    if (e.target === imgSlider.prevBtn.node) {
        imgSlider.render(imgSlider.currentSlide - 1);
    }
    else {
        imgSlider.render(imgSlider.currentSlide + 1);
    }
});
const pageSlider = Slider({
    pages: LinkedList(document.querySelectorAll('.page')),
    track: Transformer(document.querySelector('.pageContainer'))(),
    nextBtn: Controller(document.querySelector('.sliderBtn'))('sliderBtn--active'),
    pointers: Pointers(document.querySelectorAll('.menu__link'))('menu__link--active'),
    isVertical: true
});
pageSlider.nextBtn.node.addEventListener('click', () => {
    pageSlider.render(pageSlider.currentSlide + 1);
});
(_c = document.querySelector('.header')) === null || _c === void 0 ? void 0 : _c.addEventListener('click', (e) => {
    var _a;
    (_a = pageSlider.pointers) === null || _a === void 0 ? void 0 : _a.nodes.forEach((pointer, i) => {
        if (e.target === pointer.node) {
            pageSlider.render(i + 1);
        }
    });
});

//# sourceMappingURL=main.js.map
