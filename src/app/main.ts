interface INode {
    element: any
    next: INode | null
    prev: INode | null
}

interface ILinkedList {
    getHead(): INode
    getTail(): INode
    getCurrent(): INode
    getNodes: () => INode[]
    
    setCurrent(index: number): INode | null
    toNext(): INode | null
    toPrev(): INode | null
}

interface IController {
    getElement(): Element
    getState(): string
    renderState(isActive: boolean): void
}

interface ITransformer {    
    getElement: () => Element
    setAction(action: string): string
    setValue(value: string): string
    render(): Element
}

interface IPointers {
    getControllers(): IController[]
    renderState(index: number): void
}

interface IPublisher {
    subscribe(obs: IObserver): number
    unsubscribe(obs: IObserver): IObserver[]
    notify(data?: any): void
}

interface IObserverList {
    attach(obs: IObserver): number
    detach(obs: IObserver): IObserver[]
    getList(): IObserver[]
}

interface IObserver {
    update(data: any): void
}

const compose = (...fns: any[]) => (arg: any) => 
    fns.reduceRight((acc, fn) => fn(acc), arg) 

const pipe = (...fns: any[]) => (arg: any) => 
    fns.reduce((acc, fn) => fn(acc), arg)
    
const withConstructor = (constructor: object) => (obj: object) => ({
    __proto__: {
        constructor
    },
    ...obj
})    

type NodeFactory = (element: any) => INode

const NodeF: NodeFactory = (element) => ({    
    element,
    next: null,
    prev: null
}) 

type NodeLinker = (nodes: INode[]) => INode[]

const linkNodes: NodeLinker = (nodes) => (
    nodes.map((node, i, arr) => (
        Object.assign(node, {
            next: arr[i + 1],
            prev: arr[i - 1]
        })
    ))
)
    
type LinkedListFactory = (nodes: NodeListOf<Element>) => (props: object) => ILinkedList

const LinkedList: LinkedListFactory = (nodes) => (props) => {
    const collection = linkNodes([...nodes].map(NodeF))
    let head = collection[0]
    let tail = collection[collection.length - 1]
    let current = collection[0]
    
    return {
        ...props,
        
        getHead: () => head,
        getTail: () => tail,
        getCurrent: () => current,
        getNodes: () => collection,
        
        setCurrent: (index) => collection[index] ? current = collection[index]: tail.next,
        toNext: () => current.next ? current = current.next : current.next,
        toPrev: () => current.prev ? current = current.prev : current.prev
    }
}

type ControllerFactory = ({}: {node: Element, activeSel: string}) => (props: object) => IController

const Controller: ControllerFactory = ({node, activeSel}) => (props)=> {
    let isEnabled = node.classList.contains(activeSel) ? true : false
    return {
        ...props,
    
        getElement: () => node,
        getState: () => isEnabled,
        
        renderState: (isActive) => {            
            if(isActive) {
                node.classList.add(activeSel)
            } else {
                node.classList.remove(activeSel)
            }
            isEnabled = isActive
        },
    }
}

type TransformerFactory = ({}: {node: HTMLElement, action: string, value: string}) => (props: object) => ITransformer

const Transformer: TransformerFactory = ({node, action, value}) => (porps): ITransformer  => ({
    ...porps,
    
    render() {
        node.style.transform = `${action}(${value})`
        return node
    },
    getElement: () => node,
    setAction: (act) => (action = act),
    setValue: (val) => (value = val)
})

type ObserverListFactory = (observers?: IObserver[]) => IObserverList

const ObserverList: ObserverListFactory = (observers) => {
    const _list: IObserver[] = observers ? observers : []
    return {
        attach: (obs) => _list.push(obs),
        detach: (obs) => _list.splice(_list.indexOf(obs), 1),
        getList: () => _list
    }
}

type PublisherFactory = (observers?: IObserverList) => IPublisher

const Publisher: PublisherFactory = (list) => {
    let _observers = list ? list : ObserverList()
    return {
        subscribe: (obs) => _observers.attach(obs),
        unsubscribe: (obs) => _observers.detach(obs),
        notify: (data: any) => _observers.getList().forEach((obs: IObserver) => obs.update(data))
    }
}

type ObserverFactory<T> = (handler: T) => IObserver

const PointerObserver: ObserverFactory<IController> = (pointer) => {
    const _pointer = pointer
    return {
        update(data) {
            if(data === _pointer.getElement()) {
                _pointer.renderState(true)
            } else {
                _pointer.renderState(false)
            }
        }
    }
}

const TransformerObserver: ObserverFactory<ITransformer> = (transformer) => {
    const _transformer = transformer
    return {
        update(data: {value: number, index: number}) {
            _transformer.setValue(`-${data.value * data.index}px`)
            _transformer.render()
        }
    }
}

const menu = {
    button: Controller({
        node: document.querySelector('.burger'),
        activeSel: 'burger--active'
    })({}),
    nav: Controller({
        node: document.querySelector('.menu'),
        activeSel: 'menu--active'
    })({}) 
}

document.querySelector('.burger')?.addEventListener('click', () => {
    if(!menu.nav.getState()) {
        menu.button.renderState(true)
        menu.nav.renderState(true)
    } else {
        menu.button.renderState(false)
        menu.nav.renderState(false)
    }
})

const imgSlider = {
    pages: LinkedList(document.querySelectorAll('.slider__img'))({}),
    track: TransformerObserver(Transformer({
        node: document.querySelector('.slider__inner'),
        action: 'translateX'
        })({})
    ),
    nextButton: Controller({
        node: document.querySelector('.controller--right'),
        activeSel: 'controller--active'}
        )({}),
    prevButton: Controller({
        node: document.querySelector('.controller--left'),
        activeSel: 'controller--active'}
        )({}),
    checkButtons: function() {
        const current = this.pages.getCurrent()

        if(!current?.prev) {
            this.prevButton.renderState(false)
        } else if(!current?.next){
            this.nextButton.renderState(false)
        } else {
            this.prevButton.renderState(true)
            this.nextButton.renderState(true)
        }
    }
}

document.querySelector('.controller--right')?.addEventListener('click', debounce(e => {
    const current = imgSlider.pages.toNext() 
    imgSlider.track.update({
        value: current?.element.clientWidth,
        index: imgSlider.pages.getNodes().indexOf(current)
    })

    imgSlider.checkButtons()
}, 300, true))

document.querySelector('.controller--left')?.addEventListener('click', debounce(e => {
    const current = imgSlider.pages.toPrev() 
    imgSlider.track.update({
        value: current?.element.clientWidth,
        index: imgSlider.pages.getNodes().indexOf(current)
    })

    imgSlider.checkButtons()
}, 300, true))

const pageSlider = {
    pages: LinkedList(document.querySelectorAll('.page'))({}),
    track: TransformerObserver(Transformer({
        node: document.querySelector('.body__inner'),
        action: 'translateY'
        })({})
    ),
    nextButton: Controller({
        node: document.querySelector('.sliderBtn'),
        activeSel: 'sliderBtn--active'}
        )({}),
    pointers: ObserverList(
        [...document.querySelectorAll('.pointer')]
        .map((el) => Controller({
            node: el,
            activeSel: 'menu__link--active'
        })({}))
        .map(PointerObserver)),
    background: Controller({
        node: document.querySelector('.background'),
        activeSel: 'background--main'
    })({}),
    checkButton: function() {
        const current = this.pages.getCurrent()
        if(!current.next) {
            this.nextButton.renderState(false)
        } else {
            this.nextButton.renderState(true)
        }
    },
    checkBackground: function() {
        const current = this.pages.getCurrent()
        if(!current.prev) {
            this.background.renderState(false)
        } else {
            this.background.renderState(true)
        }
    }
}

const linkPublisher = Publisher(pageSlider.pointers)
const links = [...document.querySelectorAll('.pointer')]

document.querySelector('.sliderBtn')?.addEventListener('click', debounce(e => {
    const current = pageSlider.pages.toNext()
    const index = pageSlider.pages.getNodes().indexOf(current)

    pageSlider.track.update({
        value: current?.element.clientHeight,
        index: index
    })

    linkPublisher.notify(links[index])
    pageSlider.checkButton()
    pageSlider.checkBackground()
}, 300, true))

document.querySelector('.header')?.addEventListener('click', debounce(e => {
    const current = pageSlider.pages.setCurrent(
        links.indexOf(e.target)
    )
    
    pageSlider.track.update({
        value: current.element.clientHeight,
        index: pageSlider.pages.getNodes().indexOf(current)
    })

    linkPublisher.notify(e.target)

    pageSlider.checkButton()
    pageSlider.checkBackground()
}, 300, true))

const answers = ObserverList([...document.querySelectorAll('.question__answer')].map(a => {
    return PointerObserver(Controller({
        node: a,
        activeSel: 'question__answer--active'
    })({}))
}))

const qaButtons = ObserverList([...document.querySelectorAll('.question__controller')].map(c => {
    return PointerObserver(Controller({
        node: c,
        activeSel: 'question__controller--active'
    })({}))
}))

const answerPublisher = Publisher(answers)
const qaButtonPublisher = Publisher(qaButtons)

document.querySelector('.qa__wrapper')?.addEventListener('click', e => {
    qaButtonPublisher.notify(e.target)
})

function debounce(fn: any, wait: number, immediate?: boolean): any

function debounce(fn, wait, immediate) {
    let timeout: number |  undefined

    return function deffered(...args: any[]) {
        const context = this
        const callNow = immediate && !timeout

        const invoke = () => {
            timeout = undefined
            if(!immediate) fn.apply(context, args)
        }

        clearTimeout(timeout)
        
        timeout = setTimeout(invoke, wait)

        if(callNow) fn.apply(context, args)
    }
}

window.addEventListener('resize', debounce(() => {
    const current = pageSlider.pages.getCurrent()

    pageSlider.track.update({
        value: current.element.clientHeight,
        index: pageSlider.pages.getNodes().indexOf(current)
    })
}, 200))

document.querySelector('.pageContainer')?.addEventListener('scroll', () => {
    console.log('scrolled')
})