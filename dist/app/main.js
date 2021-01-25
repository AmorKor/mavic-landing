var _a, _b;
const compose = (...fns) => (arg) => fns.reduceRight((acc, fn) => fn(acc), arg);
const pipe = (...fns) => (arg) => fns.reduce((acc, fn) => fn(acc), arg);
const withConstructor = (constructor) => (obj) => (Object.assign({ __proto__: {
        constructor
    } }, obj));
const NodeF = (element) => ({
    element,
    next: null,
    prev: null
});
const linkNodes = (nodes) => (nodes.map((node, i, arr) => (Object.assign(node, {
    next: arr[i + 1],
    prev: arr[i - 1]
}))));
const LinkedList = (nodes) => (props) => {
    const collection = linkNodes([...nodes].map(NodeF));
    let head = collection[0];
    let tail = collection[collection.length - 1];
    let current = collection[0];
    return Object.assign(Object.assign({}, props), { getHead: () => head, getTail: () => tail, getCurrent: () => current, getNodes: () => collection, setCurrent: (index) => collection[index] ? current = collection[index] : tail.next, toNext: () => current.next ? current = current.next : current.next, toPrev: () => current.prev ? current = current.prev : current.prev });
};
const Controller = ({ node, activeSel }) => (props) => {
    let isEnabled = node.classList.contains(activeSel) ? true : false;
    return Object.assign(Object.assign({}, props), { getElement: () => node, getState: () => isEnabled ? 'active' : 'disabled', renderState: (isActive) => {
            if (isActive) {
                node.classList.add(activeSel);
            }
            else {
                node.classList.remove(activeSel);
            }
            isEnabled = isActive;
        } });
};
const Transformer = ({ node, acts }) => (porps) => {
    let actions = [...acts];
    return Object.assign(Object.assign({}, porps), { render() {
            node.style.transform = actions.join('');
            return node;
        }, getElement: () => node, setActions(...acts) { return actions = [...acts]; } });
};
const Pointers = ({ nodes, activeSel }) => (props) => {
    const collection = [...nodes].map((node) => (Controller({ node, activeSel })({})));
    let prev = null;
    return Object.assign(Object.assign({}, props), { getControllers: () => collection, renderState(index) {
            collection.forEach((controller, i) => {
                if (index === i) {
                    controller.renderState(true);
                    if (prev) {
                        prev.renderState(false);
                    }
                    prev = controller;
                }
            });
        } });
};
const Slider = ({ pages, track, prevBtn, nextBtn, pointers, isVertical, }) => ({ prevActive, nextActive, pointerActive, }) => pipe(withConstructor(Slider))({
    pages: LinkedList(pages)({}),
    track: Transformer({ node: track, acts: [''] })({}),
    prevBtn: prevBtn ? Controller({ node: prevBtn, activeSel: prevActive })({}) : null,
    nextBtn: nextBtn ? Controller({ node: nextBtn, activeSel: nextActive })({}) : null,
    pointers: pointers ? Pointers({ nodes: pointers, activeSel: pointerActive })({}) : null,
    currentSlide: 1,
    moveTo(slideNum) {
        var _a, _b, _c, _d, _e, _f;
        let page;
        if (slideNum === this.currentSlide + 1) {
            page = this.pages.toNext();
        }
        else if (slideNum === this.currentSlide - 1) {
            page = this.pages.toPrev();
        }
        else {
            page = this.pages.setCurrent(slideNum - 1);
        }
        if (!page)
            return;
        let multiplier = slideNum - 1;
        if (this.currentSlide === this.pages.getNodes().length ||
            this.currentSlide > slideNum) {
            multiplier = this.currentSlide - (this.currentSlide - slideNum + 1);
        }
        this.track.setActions(isVertical ?
            `translateY(-${page.element.clientHeight * multiplier}px)` :
            `translateX(-${page.element.clientWidth * multiplier}px)`);
        this.track.render();
        if (!page.next) {
            (_a = this.nextBtn) === null || _a === void 0 ? void 0 : _a.renderState(false);
            (_b = this.prevBtn) === null || _b === void 0 ? void 0 : _b.renderState(true);
        }
        else if (!page.prev) {
            (_c = this.prevBtn) === null || _c === void 0 ? void 0 : _c.renderState(false);
            (_d = this.nextBtn) === null || _d === void 0 ? void 0 : _d.renderState(true);
        }
        else {
            (_e = this.nextBtn) === null || _e === void 0 ? void 0 : _e.renderState(true);
            (_f = this.prevBtn) === null || _f === void 0 ? void 0 : _f.renderState(true);
        }
        if (pointers) {
            this.pointers.renderState(slideNum - 1);
        }
        this.currentSlide = slideNum;
        return page;
    }
});
const imgSlider = Slider({
    pages: document.querySelectorAll('.slider__img'),
    track: document.querySelector('.slider__inner'),
    prevBtn: document.querySelector('.controller--left'),
    nextBtn: document.querySelector('.controller--right'),
})({
    prevActive: 'controller--active',
    nextActive: 'controller--active'
});
const pageSlider = Slider({
    pages: document.querySelectorAll('.page'),
    track: document.querySelector('.pageContainer'),
    nextBtn: document.querySelector('.sliderBtn'),
    pointers: document.querySelectorAll('.menu__link'),
    isVertical: true,
})({
    nextActive: 'sliderBtn--active',
    pointerActive: 'menu__link--active',
});
const background = Controller({
    node: document.querySelector('.background'),
    activeSel: 'background--main'
})({});
console.log(imgSlider);
console.log(pageSlider);
(_a = document.querySelector('.buttonContainer')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', (e) => {
    var _a;
    if (e.target === ((_a = imgSlider.prevBtn) === null || _a === void 0 ? void 0 : _a.getElement())) {
        imgSlider.moveTo(imgSlider.currentSlide - 1);
    }
    else {
        imgSlider.moveTo(imgSlider.currentSlide + 1);
    }
});
pageSlider.nextBtn.getElement().addEventListener('click', () => {
    pageSlider.moveTo(pageSlider.currentSlide + 1);
    background.renderState(true);
});
(_b = document.querySelector('.header')) === null || _b === void 0 ? void 0 : _b.addEventListener('click', (e) => {
    var _a;
    (_a = pageSlider.pointers) === null || _a === void 0 ? void 0 : _a.getControllers().forEach((pointer, i) => {
        if (e.target === pointer.getElement()) {
            pageSlider.moveTo(i + 1);
            if (pageSlider.currentSlide > 1) {
                background.renderState(true);
            }
            else {
                background.renderState(false);
            }
        }
    });
});

//# sourceMappingURL=main.js.map
