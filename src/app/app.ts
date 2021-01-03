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
    activeSelector: string
    isActive: boolean

    invertState(): void
}

class Controller implements IController {
    DOMNode: Element = null
    activeSelector: string = null
    isActive = false

    constructor(
        node: Element,
        CSSselectorActive: string,
        isActive: boolean
    ) {
        this.DOMNode = node
        this.activeSelector = CSSselectorActive.slice(1)
        this.isActive = isActive
    }

    invertState() {
        if(this.isActive) {
            this.DOMNode.classList.add(this.activeSelector)
            this.DOMNode.removeAttribute('disabled')
        } else {
            this.DOMNode.classList.remove(this.activeSelector)
            this.DOMNode.setAttribute('disabled', '')
        }
    }
}

interface ISlider {
    track: HTMLElement | null,
    controllers: Array<IController>
    isVertical: boolean

    head: ISlide | null
    tail: ISlide | null
    currentSlide: ISlide | null
}

class Slider implements ISlider {
    track: HTMLElement | null = null
    controllers: Array<IController> = []
    isVertical: boolean = false

    head: ISlide | null = null
    tail: ISlide | null = null
    currentSlide: ISlide | null = null
    
    constructor(
        CSStrackSelector: string,
        CSScontrollerSelector: string,
        CSScontrollerSelectorActive: string,
        isVertical?: boolean
    ) {
        this.track = document.querySelector(CSStrackSelector)

        const controllersSet = document.querySelectorAll(CSScontrollerSelector)
        for(let controller of controllersSet) {
            this.controllers.push(new Controller(
                controller, 
                CSScontrollerSelectorActive,
                controller.classList.contains(CSScontrollerSelectorActive.slice(1))
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
    
    // toArray(): Array<Slide> | null {
    //     if(!this.head) return null

    //     let currentSlide = this.head
    //     const slidersArray = []

    //     if(!this.tail) {
    //         slidersArray.push(currentSlide)

    //         return slidersArray
    //     } 
        
    //     let i = 0
    //     while(currentSlide) {
    //         slidersArray.push(currentSlide)

    //         currentSlide = currentSlide.next
    //     }

    //     return slidersArray
    // }
    
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
				
				if(
					this.currentSlide.params.height !== this.currentSlide.prev.params.height ||
					this.currentSlide.params.width !== this.currentSlide.prev.params.width
				) this.currentSlide.calcSize()		
			}
			
			
        } else {
            if(this.currentSlide.next) {
                this.currentSlide = this.currentSlide.next
			}            
			
			if(
				this.currentSlide.params.height !== this.currentSlide.prev.params.height ||
				this.currentSlide.params.width !== this.currentSlide.prev.params.width
			) this.currentSlide.calcSize()	
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
				
				if(
					this.currentSlide.params.height !== this.currentSlide.next.params.height ||
					this.currentSlide.params.width !== this.currentSlide.next.params.width
				) this.currentSlide.calcSize()
            }
        } else {
            if(this.currentSlide.prev) {
                this.currentSlide = this.currentSlide.prev
			}
			
			if(
				this.currentSlide.params.height !== this.currentSlide.next.params.height ||
				this.currentSlide.params.width !== this.currentSlide.next.params.width
			) this.currentSlide.calcSize()
        }

        
        this.checkController()
		
        
        return this.currentSlide
    } 

    fixPosition(): void {
        this.currentSlide.calcSize()
        const newHeight = this.currentSlide.params.height

        this.track.style.transform = `translateY(-${newHeight * this.currentSlide.params.number}px)`        
    }
    
    // disables respective controller if no more slides to show
    protected checkController(): void {
        const prevBtn = this.controllers[0]
        const nextBtn = this.controllers[1]

        if(!this.currentSlide.next) {
            nextBtn.isActive = false
            nextBtn.invertState()
        } else {
            nextBtn.isActive = true
            nextBtn.invertState()
        }
        
        if(!this.currentSlide.prev) {
            prevBtn.isActive = false
            prevBtn.invertState()
        } else {
            prevBtn.isActive = true
            prevBtn.invertState()
        }        
    }
}

const slider = new Slider(
    '.slider__inner',
    '.slider__controller',
    '.controller--active'
)

console.log(slider.init('.slider__img'))

document.querySelector('.buttonContainer').addEventListener('click', e => {
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

interface IPageSlider extends ISlider {
    background: {
        DOMNode: Element | null,
        selectorActive: string
    }
}

class PageSlider extends Slider implements IPageSlider {
    background: {
        DOMNode: Element | null,
        selectorActive: string
    } = null
        
    jumpTo(page: number): Slide | null {
        let _currentSlide: Slide | null
                
        if(page === this.currentSlide.params.number) return
        
        if(page < this.currentSlide.params.number) _currentSlide = this.toPrev(page)
        else _currentSlide = this.toNext(page)

        pageSlider.checkBackground()
        
        return _currentSlide
    }

    setBackground(CSSBackgroundSelector: string, CSSBackgroundSelectorActive: string): Object {
        this.background = {
            DOMNode: document.querySelector(CSSBackgroundSelector),
            selectorActive: CSSBackgroundSelectorActive.slice(1)
        }

        return this.background
    }
    
    checkBackground(): void {
        if(!this.background) throw new Error('background isn\'t set yet')

        if(this.currentSlide.params.number === 0) {
            this.background.DOMNode.classList.remove(
                this.background.selectorActive
            )
        } else {
            this.background.DOMNode.classList.add(
                this.background.selectorActive
            )
        }
    }
        
    protected checkController(): void {
        if(!this.currentSlide.next) {
            this.controllers[0].isActive = false
            this.controllers[0].invertState()
        } else {
            this.controllers[0].isActive = true
            this.controllers[0].invertState()
        }
    }
}

const pageSlider = new PageSlider(
    '.pageContainer',
    '.sliderBtn',
    '.sliderBtn--active',
    true
)

pageSlider.init('.page')
pageSlider.setBackground(
    '.background',
    '.background--main'
)

console.log(pageSlider)

// change slide on bottom button clicking
pageSlider.controllers[0].DOMNode.addEventListener('click', () => {
    pageSlider.toNext()
    pageSlider.checkBackground()

    navPublisher.setState(
        navPublisher.observers[
            pageSlider.currentSlide.params.number
        ].DOMNode
    )
})

// fix slide postion on window resize
window.addEventListener('resize', () => {
    pageSlider.fixPosition()
})

interface IControllerObserver extends IController{
    update(state: any): void
}

class NavController extends Controller implements IControllerObserver {
    update(activeController: IControllerObserver) {
        if(activeController) {
            if(activeController === this) {
                pageSlider.jumpTo(
                    (navPublisher.observers.indexOf(activeController))
                )

                this.isActive = true
                this.invertState()

                return 
            }
            
            this.isActive = false
            this.invertState()
        }
    }
}

interface IPublisher {
    state: any,
    observers: Array<IControllerObserver>
    
    attach(observer: IControllerObserver): void
    detach(observer: IControllerObserver): void
    notify(): void
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

    setState(node: any): void {
        for(let observer of this.observers) {
            if(observer.DOMNode === node){
                this.state = observer
                this.notify()

                return
            }
        }
    }
}

function attachGroup(publisher, subscriberClass, CSSSubscriberSelector, CSSSubscriberSelectorActive) {
    const subscribers = [...document.querySelectorAll(CSSSubscriberSelector)]
    
    for(let subscriber of subscribers) {
        publisher.attach(new subscriberClass(
            subscriber,
            CSSSubscriberSelectorActive,
            subscriber.classList.contains(CSSSubscriberSelectorActive)
        ))
    }
}

const navPublisher = new Publisher()

navPublisher.attach(
    new NavController(
        document.querySelector('.logo__title'),
        '.placeholder',
        false
    )
)

attachGroup(
    navPublisher,
    NavController,
    '.menu__link',
    '.menu__link--active'
)

console.log(navPublisher)

// run event processing to navigation menu
document.querySelector('.header').addEventListener('click', e => {            
    navPublisher.setState(e.target)
})

// adding zero button functionality to logo img (return page slider to initial state)
document.querySelector('.logo__img').addEventListener('click', () => {
    pageSlider.track.removeAttribute('style')
    pageSlider.currentSlide = pageSlider.head
})

interface IControlledEl extends IController {}

class ControlledEl extends Controller implements IControlledEl {}

interface IQAController extends IControllerObserver {
    controlledElement: IControlledEl
}

class QAController extends Controller implements IQAController {
    controlledElement: IControlledEl = null
    
    bindContent(contentNode: Element, CSSContentSelectorActive) {
        this.controlledElement = new ControlledEl(
            contentNode,
            CSSContentSelectorActive,
            contentNode.classList.contains(CSSContentSelectorActive)
        )
    }
    
    invertState() {
        if(this.isActive) {
            this.DOMNode.classList.add(this.activeSelector)
        } else {
            this.DOMNode.classList.remove(this.activeSelector)
        }
    }
    
    update(activeController: IControllerObserver) {
        if(activeController === this) {
            if(this.isActive) {
                this.isActive = false
                this.controlledElement.isActive = false
            } else {
                this.isActive = true
                this.controlledElement.isActive = true
            }
            this.invertState()
            this.controlledElement.invertState()
            
            return
        }
        
        this.controlledElement.isActive = false
        this.isActive = false
        this.invertState()
        this.controlledElement.invertState()
    }
}

const qaPublisher = new Publisher()

attachGroup(
    qaPublisher,
    QAController,
    '.question__controller',
    '.question__controller--active'
)

function bindGroup(publisher, CSSContentSelector, CSSContentSelectorActive) {
    const group = document.querySelectorAll(CSSContentSelector)
    
    for(let i = 0; i < group.length; i++) {
        publisher.observers[i].bindContent(group[i], CSSContentSelectorActive)

    }
}

bindGroup(
    qaPublisher,
    '.question__answer',
    '.question__answer--active'
) 

console.log(qaPublisher)

document.querySelector('.qa__wrapper').addEventListener('click', e => {            
    qaPublisher.setState(e.target)
})
