interface ISlide {
    params: {
        DOMNode: HTMLElement | null,
        width: number,
        height: number,
        number: number
    }
    prev: ISlide | null
    next: ISlide | null

    calcSize(): void
}

class Slide implements ISlide {
    params = {
       DOMNode: null,
       width: null,
       height: null, 
       number: null
    }
    prev
    next

    constructor(
        node: HTMLElement,
        prev: ISlide | null = null,
        next: ISlide | null = null,
        number?: number
    ) {
        this.params.DOMNode = node
        this.prev = prev
        this.next = next
        this.params.number = number
    }

    calcSize(): void {
        this.params.width = this.params.DOMNode.clientWidth
        this.params.height = this.params.DOMNode.clientHeight
    }
}

interface IController {
    DOMNode: Element
    selectorDisabled: string

    disable(): void
    enable(): void
}

class Controller implements IController {
    DOMNode
    selectorDisabled

    constructor(
        node: Element,
        CSSselectorDisabled: string
    ) {
        this.DOMNode = node
        this.selectorDisabled = CSSselectorDisabled.slice(1)
    }

    disable() {
        this.DOMNode.classList.add(this.selectorDisabled)
    }
    
    enable() {
        this.DOMNode.classList.remove(this.selectorDisabled)
        this.DOMNode.removeAttribute('disabled')
    }
}

interface ISlider {
    track: {
        DOMNode: HTMLElement | null,
        sliders: Array<ISlide>
    }
    controllers: Array<IController>
    isVertical: boolean

    head: ISlide | null
    tail: ISlide | null
    currentSlide: ISlide | null
}

class Slider implements ISlider {
    track = null
    controllers = []
    isVertical = false

    head = null
    tail = null
    currentSlide = null
    
    constructor(
        CSStrackSelector: string,
        CSScontrollerSelector: string,
        CSScontrollerSelectorDisabled: string,
        isVertical?: boolean
    ) {
        this.track = document.querySelector(CSStrackSelector)

        const controllersSet = document.querySelectorAll(CSScontrollerSelector)
        for(let controller of controllersSet) {
            this.controllers.push(new Controller(
                controller, 
                CSScontrollerSelectorDisabled
            ))
        }

        if(!isVertical) this.isVertical = false
        else this.isVertical = true
    }

    appendSlide({nodeSelector, node, slideNumber}): Slider | null {
        let newSlideNode
        
        if((!nodeSelector && node) || (nodeSelector && node)) newSlideNode = node
        else if(nodeSelector && !node)newSlideNode = document.querySelector(nodeSelector)
        else return null
        
        const newSlide = new Slide(newSlideNode, this.head, this.head, slideNumber)
        newSlide.calcSize()
        
        if(!this.head) {
            this.head = newSlide
            this.currentSlide = newSlide

            return this
        }

        if(!this.tail) {
            this.tail = newSlide
            this.tail.prev = this.head
            this.head.next = newSlide
            
            return this
        }

        // linking last slide to new one and reassign tail
        let lastSlide = this.tail
        lastSlide.next = newSlide
        this.tail = newSlide
        this.tail.prev = lastSlide
        this.tail.next = null

        return this
    }
    
    // for adding all related exisiting slides in DOM
    init(sliderSelector: string): Slider | null {
        const slidersSet = [...document.querySelectorAll(sliderSelector)]

        if(slidersSet.length === 0) return null
        
        slidersSet.forEach((node, i) => {
            this.appendSlide({nodeSelector: null, node, slideNumber: i})
        })

        return this
    }
    
    toArray(): Array<Slide> | null {
        if(!this.head) return null

        let currentSlide = this.head
        const slidersArray = []

        if(!this.tail) {
            slidersArray.push(currentSlide)

            return slidersArray
        } 
        
        let i = 0
        while(currentSlide) {
            slidersArray.push(currentSlide)

            currentSlide = currentSlide.next
        }

        return slidersArray
    }
    
    toNext(slideNum?: number): Slide | null {
        if(!this.head) return null
        
        if(!this.tail || !this.currentSlide.next) return this.currentSlide

        let direction = 'X'
        let translateSize = this.currentSlide.params.width
        if(this.isVertical){
            direction = 'Y'
            translateSize = this.currentSlide.params.height
        }

        let _slideNum = this.currentSlide.next.params.number

        if(slideNum !== undefined) {
            _slideNum = slideNum
        }

        this.track.style.transform = `translate${direction}(-${translateSize * _slideNum}px)`

        if(slideNum !== undefined) {
            while(_slideNum !== this.currentSlide.params.number) {
                this.currentSlide = this.currentSlide.next
            }
        } else {
            if(this.currentSlide.next) {
                this.currentSlide = this.currentSlide.next
            }            
        }
        
        this.checkController()
        
        return this.currentSlide
    } 

    toPrev(slideNum?: number): Slide | null {
        if(!this.head) return null
        
        if(!this.tail || !this.currentSlide.prev) return this.currentSlide

        let direction = 'X'
        let translateSize = this.currentSlide.params.width
        if(this.isVertical){
            direction = 'Y'
            translateSize = this.currentSlide.params.height
        }

        let _slideNum = this.currentSlide.prev.params.number

        if(slideNum !== undefined) {
            _slideNum = slideNum
        }

        this.track.style.transform = `translate${direction}(-${translateSize * _slideNum}px)`

        if(slideNum !== undefined) {
            while(_slideNum !== this.currentSlide.params.number) {
                this.currentSlide = this.currentSlide.prev
            }
        } else {
            if(this.currentSlide.prev) {
                this.currentSlide = this.currentSlide.prev
            }
        }

        this.checkController()
        
        return this.currentSlide
    } 

    // disables respective controller if no more slides to show
    protected checkController(): void {
        const prevBtn = this.controllers[0]
        const nextBtn = this.controllers[1]
        
        if(!this.currentSlide.next) {
            nextBtn.disable()
        } else {
            nextBtn.enable()
        }

        if(!this.currentSlide.prev) {
            prevBtn.disable()
        } else {
            prevBtn.enable()
        }
    }
}

const slider = new Slider(
    '.slider__inner',
    '.slider__controller',
    '.controller--disabled'
)

console.log(slider.init('.slider__img'))

document.querySelector('.buttonContainer').addEventListener('click', e => {
    const selectorDisabled = slider.controllers[0].selectorDisabled
    const prevBtn = slider.controllers[0]
    const nextBtn = slider.controllers[1]

    if(e.target === nextBtn.DOMNode) {
        slider.toNext()
        return
    }

    if(e.target === prevBtn.DOMNode) {
        slider.toPrev()
        return
    }
})

class PageSlider extends Slider {
    jumpTo(page: number): Slide | null {
        let _currentSlide: Slide | null
                
        if(page === this.currentSlide.params.number) return
        
        if(page < this.currentSlide.params.number) _currentSlide = this.toPrev(page)
        else _currentSlide = this.toNext(page)

        return _currentSlide
    }

    protected checkController(): void {
        if(!this.currentSlide.next) {
            this.controllers[0].disable()
        } else {
            this.controllers[0].enable()
        }
    }
}

const pageSlider = new PageSlider(
    '.pageContainer',
    '.sliderBtn',
    '.sliderBtn--disabled',
    true
)

pageSlider.init('.page')

console.log(pageSlider)

pageSlider.controllers[0].DOMNode.addEventListener('click', () => {
    pageSlider.toNext()
})

interface IPublisher {
    state: any,
    observers: Array<IControllerObserver>
    
    attach(observer: IControllerObserver): void
    detach(observer: IControllerObserver): void
    notify(): void
}

interface IControllerObserver extends IController{
    update(state: any): void
}

class NavController extends Controller implements IControllerObserver {
    update(activeController: IControllerObserver) {
        if(activeController) {
            if(activeController === this) {
                pageSlider.jumpTo(
                    (navPusblisher.observers.indexOf(activeController))
                )
               return 
            }
            
        }
    }
}

class Publisher implements IPublisher {
    state: IController  = null
    observers = new Array<IControllerObserver>()

    attach(controller: IControllerObserver) {
        this.observers.push(controller)
    }

    detach(controller: IControllerObserver) {
        this.observers = this.observers.filter((item) => {
            return item === controller
        })
    }
    
    notify() {
        for(let controller of this.observers) {
            controller.update(this.state)
        }
    }
}

class NavPusblisher extends Publisher {
    init(
        CSSControllerSelector: string,
        CSSDisabledSelector: string
    ) {
        const controllers = document.querySelectorAll(CSSControllerSelector)

        for(let controller of controllers) {
            this.attach(new NavController(controller, CSSDisabledSelector))
        }
    }

    setState(node: EventTarget): void {
        for(let observer of this.observers) {
            if(observer.DOMNode === node){
                this.state = observer
                this.notify()

                return
            }
        }
    }
}

const navPusblisher = new NavPusblisher()
navPusblisher.attach(
    new NavController(
        document.querySelector('.logo__title'),
        ''
    )
)
navPusblisher.init(
    '.menu__link',
    '.menu__link--active'
)
console.log(navPusblisher)

document.querySelector('.header').addEventListener('click', e => {        
    console.log(e.target)
    
    for(let i = 0; i < navPusblisher.observers.length; i++) {
        if(e.target === navPusblisher.observers[i].DOMNode) {
            console.log(navPusblisher.observers[i].DOMNode)
            navPusblisher.setState(e.target)
            return
        }
    }
})

document.querySelector('.logo__img').addEventListener('click', () => {
    pageSlider.track.removeAttribute('style')
    pageSlider.currentSlide = pageSlider.head
})