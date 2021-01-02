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
    constructor(node, CSSselectorDisabled) {
        this.DOMNode = node;
        this.selectorDisabled = CSSselectorDisabled.slice(1);
    }
    disable() {
        this.DOMNode.classList.add(this.selectorDisabled);
    }
    enable() {
        this.DOMNode.classList.remove(this.selectorDisabled);
        this.DOMNode.removeAttribute('disabled');
    }
}
class Slider {
    constructor(CSStrackSelector, CSScontrollerSelector, CSScontrollerSelectorDisabled, isVertical) {
        this.track = null;
        this.controllers = [];
        this.isVertical = false;
        this.head = null;
        this.tail = null;
        this.currentSlide = null;
        this.track = document.querySelector(CSStrackSelector);
        const controllersSet = document.querySelectorAll(CSScontrollerSelector);
        for (let controller of controllersSet) {
            this.controllers.push(new Controller(controller, CSScontrollerSelectorDisabled));
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
    toArray() {
        if (!this.head)
            return null;
        let currentSlide = this.head;
        const slidersArray = [];
        if (!this.tail) {
            slidersArray.push(currentSlide);
            return slidersArray;
        }
        let i = 0;
        while (currentSlide) {
            slidersArray.push(currentSlide);
            currentSlide = currentSlide.next;
        }
        return slidersArray;
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
            }
        }
        else {
            if (this.currentSlide.next) {
                this.currentSlide = this.currentSlide.next;
            }
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
            }
        }
        else {
            if (this.currentSlide.prev) {
                this.currentSlide = this.currentSlide.prev;
            }
        }
        this.checkController();
        return this.currentSlide;
    }
    checkController() {
        const prevBtn = this.controllers[0];
        const nextBtn = this.controllers[1];
        if (!this.currentSlide.next) {
            nextBtn.disable();
        }
        else {
            nextBtn.enable();
        }
        if (!this.currentSlide.prev) {
            prevBtn.disable();
        }
        else {
            prevBtn.enable();
        }
    }
}
const slider = new Slider('.slider__inner', '.slider__controller', '.controller--disabled');
console.log(slider.init('.slider__img'));
document.querySelector('.buttonContainer').addEventListener('click', e => {
    const selectorDisabled = slider.controllers[0].selectorDisabled;
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
    jumpTo(page) {
        let _currentSlide;
        if (page === this.currentSlide.params.number)
            return;
        if (page < this.currentSlide.params.number)
            _currentSlide = this.toPrev(page);
        else
            _currentSlide = this.toNext(page);
        return _currentSlide;
    }
    checkController() {
        if (!this.currentSlide.next) {
            this.controllers[0].disable();
        }
        else {
            this.controllers[0].enable();
        }
    }
}
const pageSlider = new PageSlider('.pageContainer', '.sliderBtn', '.sliderBtn--disabled', true);
pageSlider.init('.page');
console.log(pageSlider);
pageSlider.controllers[0].DOMNode.addEventListener('click', () => {
    pageSlider.toNext();
});
class NavController extends Controller {
    update(activeController) {
        if (activeController) {
            if (activeController === this) {
                pageSlider.jumpTo((navPusblisher.observers.indexOf(activeController)));
                return;
            }
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
}
class NavPusblisher extends Publisher {
    init(CSSControllerSelector, CSSDisabledSelector) {
        const controllers = document.querySelectorAll(CSSControllerSelector);
        for (let controller of controllers) {
            this.attach(new NavController(controller, CSSDisabledSelector));
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
const navPusblisher = new NavPusblisher();
navPusblisher.attach(new NavController(document.querySelector('.logo__title'), ''));
navPusblisher.init('.menu__link', '.menu__link--active');
console.log(navPusblisher);
document.querySelector('.header').addEventListener('click', e => {
    console.log(e.target);
    for (let i = 0; i < navPusblisher.observers.length; i++) {
        if (e.target === navPusblisher.observers[i].DOMNode) {
            console.log(navPusblisher.observers[i].DOMNode);
            navPusblisher.setState(e.target);
            return;
        }
    }
});
document.querySelector('.logo__img').addEventListener('click', () => {
    pageSlider.track.removeAttribute('style');
    pageSlider.currentSlide = pageSlider.head;
});

//# sourceMappingURL=app.js.map
