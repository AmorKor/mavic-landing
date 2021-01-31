var _a, _b, _c, _d, _e, _f, _g;
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
    return Object.assign(Object.assign({}, props), { getElement: () => node, getState: () => isEnabled, renderState: (isActive) => {
            if (isActive) {
                node.classList.add(activeSel);
            }
            else {
                node.classList.remove(activeSel);
            }
            isEnabled = isActive;
        } });
};
const Transformer = ({ node, action, value }) => (porps) => (Object.assign(Object.assign({}, porps), { render() {
        node.style.transform = `${action}(${value})`;
        return node;
    }, getElement: () => node, setAction: (act) => (action = act), setValue: (val) => (value = val) }));
const ObserverList = (observers) => {
    const _list = observers ? observers : [];
    return {
        attach: (obs) => _list.push(obs),
        detach: (obs) => _list.splice(_list.indexOf(obs), 1),
        getList: () => _list
    };
};
const Publisher = (list) => {
    let _observers = list ? list : ObserverList();
    return {
        subscribe: (obs) => _observers.attach(obs),
        unsubscribe: (obs) => _observers.detach(obs),
        notify: (data) => _observers.getList().forEach((obs) => obs.update(data))
    };
};
const PointerObserver = (pointer) => {
    const _pointer = pointer;
    return {
        update(data) {
            if (data === _pointer.getElement()) {
                _pointer.renderState(true);
            }
            else {
                _pointer.renderState(false);
            }
        }
    };
};
const TransformerObserver = (transformer) => {
    const _transformer = transformer;
    return {
        update(data) {
            _transformer.setValue(`-${data.value * data.index}px`);
            _transformer.render();
        }
    };
};
const menu = {
    button: Controller({
        node: document.querySelector('.burger'),
        activeSel: 'burger--active'
    })({}),
    nav: Controller({
        node: document.querySelector('.menu'),
        activeSel: 'menu--active'
    })({})
};
(_a = document.querySelector('.burger')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', () => {
    if (!menu.nav.getState()) {
        menu.button.renderState(true);
        menu.nav.renderState(true);
    }
    else {
        menu.button.renderState(false);
        menu.nav.renderState(false);
    }
});
const imgSlider = {
    pages: LinkedList(document.querySelectorAll('.slider__img'))({}),
    track: TransformerObserver(Transformer({
        node: document.querySelector('.slider__inner'),
        action: 'translateX'
    })({})),
    nextButton: Controller({
        node: document.querySelector('.controller--right'),
        activeSel: 'controller--active'
    })({}),
    prevButton: Controller({
        node: document.querySelector('.controller--left'),
        activeSel: 'controller--active'
    })({}),
    checkButtons: function () {
        const current = this.pages.getCurrent();
        if (!(current === null || current === void 0 ? void 0 : current.prev)) {
            this.prevButton.renderState(false);
        }
        else if (!(current === null || current === void 0 ? void 0 : current.next)) {
            this.nextButton.renderState(false);
        }
        else {
            this.prevButton.renderState(true);
            this.nextButton.renderState(true);
        }
    }
};
(_b = document.querySelector('.controller--right')) === null || _b === void 0 ? void 0 : _b.addEventListener('click', debounce(e => {
    const current = imgSlider.pages.toNext();
    imgSlider.track.update({
        value: current === null || current === void 0 ? void 0 : current.element.clientWidth,
        index: imgSlider.pages.getNodes().indexOf(current)
    });
    imgSlider.checkButtons();
}, 300, true));
(_c = document.querySelector('.controller--left')) === null || _c === void 0 ? void 0 : _c.addEventListener('click', debounce(e => {
    const current = imgSlider.pages.toPrev();
    imgSlider.track.update({
        value: current === null || current === void 0 ? void 0 : current.element.clientWidth,
        index: imgSlider.pages.getNodes().indexOf(current)
    });
    imgSlider.checkButtons();
}, 300, true));
const pageSlider = {
    pages: LinkedList(document.querySelectorAll('.page'))({}),
    track: TransformerObserver(Transformer({
        node: document.querySelector('.body__inner'),
        action: 'translateY'
    })({})),
    nextButton: Controller({
        node: document.querySelector('.sliderBtn'),
        activeSel: 'sliderBtn--active'
    })({}),
    pointers: ObserverList([...document.querySelectorAll('.pointer')]
        .map((el) => Controller({
        node: el,
        activeSel: 'menu__link--active'
    })({}))
        .map(PointerObserver)),
    background: Controller({
        node: document.querySelector('.background'),
        activeSel: 'background--main'
    })({}),
    checkButton: function () {
        const current = this.pages.getCurrent();
        if (!current.next) {
            this.nextButton.renderState(false);
        }
        else {
            this.nextButton.renderState(true);
        }
    },
    checkBackground: function () {
        const current = this.pages.getCurrent();
        if (!current.prev) {
            this.background.renderState(false);
        }
        else {
            this.background.renderState(true);
        }
    }
};
const linkPublisher = Publisher(pageSlider.pointers);
const links = [...document.querySelectorAll('.pointer')];
(_d = document.querySelector('.sliderBtn')) === null || _d === void 0 ? void 0 : _d.addEventListener('click', debounce(e => {
    const current = pageSlider.pages.toNext();
    const index = pageSlider.pages.getNodes().indexOf(current);
    pageSlider.track.update({
        value: current === null || current === void 0 ? void 0 : current.element.clientHeight,
        index: index
    });
    linkPublisher.notify(links[index]);
    pageSlider.checkButton();
    pageSlider.checkBackground();
}, 300, true));
(_e = document.querySelector('.header')) === null || _e === void 0 ? void 0 : _e.addEventListener('click', debounce(e => {
    const current = pageSlider.pages.setCurrent(links.indexOf(e.target));
    pageSlider.track.update({
        value: current.element.clientHeight,
        index: pageSlider.pages.getNodes().indexOf(current)
    });
    linkPublisher.notify(e.target);
    pageSlider.checkButton();
    pageSlider.checkBackground();
}, 300, true));
const answers = ObserverList([...document.querySelectorAll('.question__answer')].map(a => {
    return PointerObserver(Controller({
        node: a,
        activeSel: 'question__answer--active'
    })({}));
}));
const qaButtons = ObserverList([...document.querySelectorAll('.question__controller')].map(c => {
    return PointerObserver(Controller({
        node: c,
        activeSel: 'question__controller--active'
    })({}));
}));
const answerPublisher = Publisher(answers);
const qaButtonPublisher = Publisher(qaButtons);
(_f = document.querySelector('.qa__wrapper')) === null || _f === void 0 ? void 0 : _f.addEventListener('click', e => {
    qaButtonPublisher.notify(e.target);
});
function debounce(fn, wait, immediate) {
    let timeout;
    return function deffered(...args) {
        const context = this;
        const callNow = immediate && !timeout;
        const invoke = () => {
            timeout = undefined;
            if (!immediate)
                fn.apply(context, args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(invoke, wait);
        if (callNow)
            fn.apply(context, args);
    };
}
window.addEventListener('resize', debounce(() => {
    const current = pageSlider.pages.getCurrent();
    pageSlider.track.update({
        value: current.element.clientHeight,
        index: pageSlider.pages.getNodes().indexOf(current)
    });
}, 200));
(_g = document.querySelector('.pageContainer')) === null || _g === void 0 ? void 0 : _g.addEventListener('scroll', () => {
    console.log('scrolled');
});

//# sourceMappingURL=main.js.map
