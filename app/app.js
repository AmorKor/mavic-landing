class Slide {
    constructor(node, prev = null, next = null, number) {
        this.params = {
            DOMNode: null,
            width: null,
            height: null,
            number: null
        };
        this.params.DOMNode = node;
        this.prev = prev;
        this.next = next;
        this.params.number = number;
    }
    calcSize() {
        this.params.width = this.params.DOMNode.clientWidth;
        this.params.height = this.params.DOMNode.clientHeight;
    }
}
class Controller {
    constructor(node, CSSselectorActive, isActive) {
        this.DOMNode = null;
        this.activeSelector = null;
        this.isActive = false;
        this.DOMNode = node;
        this.activeSelector = CSSselectorActive.slice(1);
        this.isActive = isActive;
    }
    invertState() {
        if (this.isActive) {
            this.DOMNode.classList.add(this.activeSelector);
            this.DOMNode.removeAttribute('disabled');
        }
        else {
            this.DOMNode.classList.remove(this.activeSelector);
            this.DOMNode.setAttribute('disabled', '');
        }
    }
}
class Slider {
    constructor(CSStrackSelector, CSScontrollerSelector, CSScontrollerSelectorActive, isVertical) {
        this.track = null;
        this.controllers = [];
        this.isVertical = false;
        this.head = null;
        this.tail = null;
        this.currentSlide = null;
        this.track = document.querySelector(CSStrackSelector);
        const controllersSet = document.querySelectorAll(CSScontrollerSelector);
        for (let controller of controllersSet) {
            this.controllers.push(new Controller(controller, CSScontrollerSelectorActive, controller.classList.contains(CSScontrollerSelectorActive.slice(1))));
        }
        if (!isVertical)
            this.isVertical = false;
        else
            this.isVertical = true;
    }
    appendSlide({ nodeSelector, node, slideNumber }) {
        let newSlideNode;
        if ((!nodeSelector && node) || (nodeSelector && node))
            newSlideNode = node;
        else if (nodeSelector && !node)
            newSlideNode = document.querySelector(nodeSelector);
        else
            return null;
        const newSlide = new Slide(newSlideNode, this.head, this.head, slideNumber);
        newSlide.calcSize();
        if (!this.head) {
            this.head = newSlide;
            this.currentSlide = newSlide;
            return this;
        }
        if (!this.tail) {
            this.tail = newSlide;
            this.tail.prev = this.head;
            this.head.next = newSlide;
            return this;
        }
        let lastSlide = this.tail;
        lastSlide.next = newSlide;
        this.tail = newSlide;
        this.tail.prev = lastSlide;
        this.tail.next = null;
        return this;
    }
    init(sliderSelector) {
        const slidersSet = [...document.querySelectorAll(sliderSelector)];
        if (slidersSet.length === 0)
            return null;
        slidersSet.forEach((node, i) => {
            this.appendSlide({ nodeSelector: null, node, slideNumber: i });
        });
        return this;
    }
    toNext(slideNum) {
        if (!this.head)
            return null;
        if (!this.tail || !this.currentSlide.next)
            return this.currentSlide;
        let direction = 'X';
        let translateSize = this.currentSlide.params.width;
        if (this.isVertical) {
            direction = 'Y';
            translateSize = this.currentSlide.params.height;
        }
        let _slideNum = this.currentSlide.next.params.number;
        if (slideNum !== undefined) {
            _slideNum = slideNum;
        }
        this.track.style.transform = `translate${direction}(-${translateSize * _slideNum}px)`;
        if (slideNum !== undefined) {
            while (_slideNum !== this.currentSlide.params.number) {
                this.currentSlide = this.currentSlide.next;
                if (this.currentSlide.params.height !== this.currentSlide.prev.params.height ||
                    this.currentSlide.params.width !== this.currentSlide.prev.params.width)
                    this.currentSlide.calcSize();
            }
        }
        else {
            if (this.currentSlide.next) {
                this.currentSlide = this.currentSlide.next;
            }
            if (this.currentSlide.params.height !== this.currentSlide.prev.params.height ||
                this.currentSlide.params.width !== this.currentSlide.prev.params.width)
                this.currentSlide.calcSize();
        }
        this.checkController();
        return this.currentSlide;
    }
    toPrev(slideNum) {
        if (!this.head)
            return null;
        if (!this.tail || !this.currentSlide.prev)
            return this.currentSlide;
        let direction = 'X';
        let translateSize = this.currentSlide.params.width;
        if (this.isVertical) {
            direction = 'Y';
            translateSize = this.currentSlide.params.height;
        }
        let _slideNum = this.currentSlide.prev.params.number;
        if (slideNum !== undefined) {
            _slideNum = slideNum;
        }
        this.track.style.transform = `translate${direction}(-${translateSize * _slideNum}px)`;
        if (slideNum !== undefined) {
            while (_slideNum !== this.currentSlide.params.number) {
                this.currentSlide = this.currentSlide.prev;
                if (this.currentSlide.params.height !== this.currentSlide.next.params.height ||
                    this.currentSlide.params.width !== this.currentSlide.next.params.width)
                    this.currentSlide.calcSize();
            }
        }
        else {
            if (this.currentSlide.prev) {
                this.currentSlide = this.currentSlide.prev;
            }
            if (this.currentSlide.params.height !== this.currentSlide.next.params.height ||
                this.currentSlide.params.width !== this.currentSlide.next.params.width)
                this.currentSlide.calcSize();
        }
        this.checkController();
        return this.currentSlide;
    }
    fixPosition() {
        this.currentSlide.calcSize();
        const newHeight = this.currentSlide.params.height;
        this.track.style.transform = `translateY(-${newHeight * this.currentSlide.params.number}px)`;
    }
    checkController() {
        const prevBtn = this.controllers[0];
        const nextBtn = this.controllers[1];
        if (!this.currentSlide.next) {
            nextBtn.isActive = false;
            nextBtn.invertState();
        }
        else {
            nextBtn.isActive = true;
            nextBtn.invertState();
        }
        if (!this.currentSlide.prev) {
            prevBtn.isActive = false;
            prevBtn.invertState();
        }
        else {
            prevBtn.isActive = true;
            prevBtn.invertState();
        }
    }
}
const slider = new Slider('.slider__inner', '.slider__controller', '.controller--active');
console.log(slider.init('.slider__img'));
document.querySelector('.buttonContainer').addEventListener('click', e => {
    const prevBtn = slider.controllers[0];
    const nextBtn = slider.controllers[1];
    if (e.target === nextBtn.DOMNode) {
        slider.toNext();
        return;
    }
    if (e.target === prevBtn.DOMNode) {
        slider.toPrev();
        return;
    }
});
class PageSlider extends Slider {
    constructor() {
        super(...arguments);
        this.background = null;
    }
    jumpTo(page) {
        let _currentSlide;
        if (page === this.currentSlide.params.number)
            return;
        if (page < this.currentSlide.params.number)
            _currentSlide = this.toPrev(page);
        else
            _currentSlide = this.toNext(page);
        pageSlider.checkBackground();
        return _currentSlide;
    }
    setBackground(CSSBackgroundSelector, CSSBackgroundSelectorActive) {
        this.background = {
            DOMNode: document.querySelector(CSSBackgroundSelector),
            selectorActive: CSSBackgroundSelectorActive.slice(1)
        };
        return this.background;
    }
    checkBackground() {
        if (!this.background)
            throw new Error('background isn\'t set yet');
        if (this.currentSlide.params.number === 0) {
            this.background.DOMNode.classList.remove(this.background.selectorActive);
        }
        else {
            this.background.DOMNode.classList.add(this.background.selectorActive);
        }
    }
    checkController() {
        if (!this.currentSlide.next) {
            this.controllers[0].isActive = false;
            this.controllers[0].invertState();
        }
        else {
            this.controllers[0].isActive = true;
            this.controllers[0].invertState();
        }
    }
}
const pageSlider = new PageSlider('.pageContainer', '.sliderBtn', '.sliderBtn--active', true);
pageSlider.init('.page');
pageSlider.setBackground('.background', '.background--main');
console.log(pageSlider);
pageSlider.controllers[0].DOMNode.addEventListener('click', () => {
    pageSlider.toNext();
    pageSlider.checkBackground();
    navPublisher.setState(navPublisher.observers[pageSlider.currentSlide.params.number].DOMNode);
});
window.addEventListener('resize', () => {
    pageSlider.fixPosition();
});
class NavController extends Controller {
    update(activeController) {
        if (activeController) {
            if (activeController === this) {
                pageSlider.jumpTo((navPublisher.observers.indexOf(activeController)));
                this.isActive = true;
                this.invertState();
                return;
            }
            this.isActive = false;
            this.invertState();
        }
    }
}
class Publisher {
    constructor() {
        this.state = null;
        this.observers = new Array();
    }
    attach(controller) {
        this.observers.push(controller);
    }
    detach(controller) {
        this.observers = this.observers.filter((item) => {
            return item === controller;
        });
    }
    notify() {
        for (let controller of this.observers) {
            controller.update(this.state);
        }
    }
    setState(node) {
        for (let observer of this.observers) {
            if (observer.DOMNode === node) {
                this.state = observer;
                this.notify();
                return;
            }
        }
    }
}
function attachGroup(publisher, subscriberClass, CSSSubscriberSelector, CSSSubscriberSelectorActive) {
    const subscribers = [...document.querySelectorAll(CSSSubscriberSelector)];
    for (let subscriber of subscribers) {
        publisher.attach(new subscriberClass(subscriber, CSSSubscriberSelectorActive, subscriber.classList.contains(CSSSubscriberSelectorActive)));
    }
}
const navPublisher = new Publisher();
navPublisher.attach(new NavController(document.querySelector('.logo__title'), '.placeholder', false));
attachGroup(navPublisher, NavController, '.menu__link', '.menu__link--active');
console.log(navPublisher);
document.querySelector('.header').addEventListener('click', e => {
    navPublisher.setState(e.target);
});
document.querySelector('.logo__img').addEventListener('click', () => {
    pageSlider.track.removeAttribute('style');
    pageSlider.currentSlide = pageSlider.head;
});
class ControlledEl extends Controller {
}
class QAController extends Controller {
    constructor() {
        super(...arguments);
        this.controlledElement = null;
    }
    bindContent(contentNode, CSSContentSelectorActive) {
        this.controlledElement = new ControlledEl(contentNode, CSSContentSelectorActive, contentNode.classList.contains(CSSContentSelectorActive));
    }
    invertState() {
        if (this.isActive) {
            this.DOMNode.classList.add(this.activeSelector);
        }
        else {
            this.DOMNode.classList.remove(this.activeSelector);
        }
    }
    update(activeController) {
        if (activeController === this) {
            if (this.isActive) {
                this.isActive = false;
                this.controlledElement.isActive = false;
            }
            else {
                this.isActive = true;
                this.controlledElement.isActive = true;
            }
            this.invertState();
            this.controlledElement.invertState();
            return;
        }
        this.controlledElement.isActive = false;
        this.isActive = false;
        this.invertState();
        this.controlledElement.invertState();
    }
}
const qaPublisher = new Publisher();
attachGroup(qaPublisher, QAController, '.question__controller', '.question__controller--active');
function bindGroup(publisher, CSSContentSelector, CSSContentSelectorActive) {
    const group = document.querySelectorAll(CSSContentSelector);
    for (let i = 0; i < group.length; i++) {
        publisher.observers[i].bindContent(group[i], CSSContentSelectorActive);
    }
}
bindGroup(qaPublisher, '.question__answer', '.question__answer--active');
console.log(qaPublisher);
document.querySelector('.qa__wrapper').addEventListener('click', e => {
    qaPublisher.setState(e.target);
});

//# sourceMappingURL=app.js.map
