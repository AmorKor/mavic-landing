interface INode {
    element: any
    next: INode
    prev: INode
}

interface ILinkedList {
    collection: INode[]
    
    getHead(): INode
    getTail(): INode
    getCurrent(): INode
    setCurrent(index: number): INode
    toNext(): INode
    toPrev(): INode
}

interface IController {
    node: Element
    
    renderState(): void
    disable(): boolean,
    enable(): boolean 
}

interface ITransformer {    
    node: Element
    getActions(): string[]
    setActions(...acts: string[]): string[]
    render(): HTMLElement
}

interface IPointers {
    nodes: IController[]
    prev: IController | null
    render(index: number): void
}

const NodeF = (element: HTMLElement) => ({    
    element,
    next: null,
    prev: null
}) 

const linkNodes = (nodes: INode[]): INode[] => (
    nodes.map((node, i, arr) => (
        Object.assign(node, {
            next: arr[i + 1],
            prev: arr[i - 1]
        })
    ))
)

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
    
const ListWrapper = (nodes: INode[]): ILinkedList => {
    const collection = [...nodes]
    let head = nodes[0]
    let tail = nodes[nodes.length - 1]
    let current = nodes[0]
    
    return {
        collection,
        getHead: () => head,
        getTail: () => tail,
        getCurrent: () => current,
        setCurrent: (index) => collection[index] ? current = collection[index]: tail.next,
        toNext: () => current.next ? current = current.next : current.next,
        toPrev: () => current.prev ? current = current.prev : current.prev
    }
}

const Controller = (node: Element) => (activeSelector: string): IController  => {
    let isActive = false
    return {
        node,

        renderState: () => {            
            if(isActive) {
                node.classList.add(activeSelector)
            } else {
                node.classList.remove(activeSelector)
            }
        },
        disable: () => isActive = false,
        enable: () => isActive = true
    }
}

const Transformer = (node: HTMLElement) => (...acts: string[]): ITransformer  => {
    let actions = [...acts]
    return {
        node,
        
        render() {
            node.style.transform = actions.join('')
            return node
        },
        getActions: () => actions,
        setActions(...acts: string[]) {return actions = [...acts]},
    }
}

const LinkedList = (nodes: NodeListOf<Element>): ILinkedList => (
    ListWrapper(
        linkNodes([...nodes].map(NodeF))
        )
)

const Controllers = (nodes: NodeListOf<Element>) => (activeSelector: string) => (
    [...nodes].map(Controller).map((fn) => fn(activeSelector))
)

const Pointers = (nodes: NodeListOf<Element>) => (activeSelector: string): IPointers => ({
    nodes: Controllers(nodes)(activeSelector),
    prev: null,
    
    render(index) {
        this.nodes.forEach((point, i) => {
            if(index === i) {
                point.enable()
                point.renderState()
                if(this.prev) {
                    this.prev.disable()
                    this.prev.renderState()
                }
                this.prev = point
            }
        })
    }     
})

interface SliderArg {
    pages: ILinkedList 
    track: ITransformer
    prevBtn?: IController
    nextBtn?: IController
    pointers?: IPointers
    isVertical?: boolean
}

const Slider = ({
    pages, 
    track,
    prevBtn,
    nextBtn,
    pointers,
    isVertical
    }: SliderArg) => {
    const _pages = Object.assign({}, pages)
    const _track = Object.assign({}, track)
    const _prevBtn = Object.assign({}, prevBtn)
    const _nextBtn = Object.assign({}, nextBtn)
    let _pointers
    if(pointers) _pointers = Object.assign({}, pointers)
    if(_pages.collection.length !== 0) _nextBtn.enable()
        
    return {
        prevBtn: _prevBtn,
        nextBtn: _nextBtn,
        pointers: _pointers,
        currentSlide: 1,
        
        render(slideNum: number) {            
            let page 

            if(slideNum === this.currentSlide + 1) {
                page = _pages.toNext()
            } else if(slideNum === this.currentSlide - 1) {
                page = _pages.toPrev()
            } else {
                page = _pages.setCurrent(slideNum - 1)
            }

            if(!page) return

            let multiplier = slideNum - 1
            
            if(
                this.currentSlide === _pages.collection.length ||
                this.currentSlide > slideNum 
            ) {
                multiplier = this.currentSlide - (this.currentSlide - slideNum + 1)
            }

            _track.setActions(
                isVertical ?
                `translateY(-${page.element.clientHeight * multiplier}px)` :
                `translateX(-${page.element.clientWidth * multiplier}px)` 
            )

            if(!page.next) {
                nextBtn?.disable()
                nextBtn?.renderState()
            } else if(!page.prev) {
                prevBtn?.disable()
                prevBtn?.renderState()
            } else {
                nextBtn?.enable()
                nextBtn?.renderState()
                prevBtn?.enable()
                prevBtn?.renderState()
            }
            
            if(pointers) {
                pointers.render(slideNum - 1)
            }
            
            this.currentSlide = slideNum
            
            return _track.render()
        }
    }
}

const Question = ({controller, box, controllerAct, boxAct}: {
    controller: Element, box: HTMLElement, controllerAct: string, boxAct: string
}) => ({
    btn: Controller(controller)(controllerAct),
    answer: Transformer(box)(boxAct)
});

// [...document.querySelectorAll('.question__controller')].map(Pointers)

const question = Question({
    controller: document.querySelector('.question__controller'),
    box: document.querySelector('.question__answer'),
    controllerAct: 'question__controller--active',
    boxAct: 'question__answer--active'
})

console.log(question)

// const qa = Controllers(document.querySelectorAll('.question__controller'))('question__controller--active')
const qa = Pointers(document.querySelectorAll('.question__controller'))('question__controller--active')

document.querySelector('.qa__wrapper')?.addEventListener('click', (e) => {
    qa.nodes.forEach((btn, i) => {
        if(e.target === btn.node) {
            qa.render(i)
        }
    })
})

const imgSlider = Slider({
    pages: LinkedList(document.querySelectorAll('.slider__img')),
    track: Transformer(document.querySelector('.slider__inner'))(),
    prevBtn: Controller(document.querySelector('.controller--left'))('controller--active'),
    nextBtn: Controller(document.querySelector('.controller--right'))('controller--active'),
})

document.querySelector('.buttonContainer')?.addEventListener('click', (e) => {
    if(e.target === imgSlider.prevBtn.node) {
        imgSlider.render(imgSlider.currentSlide - 1);
    } else {
        imgSlider.render(imgSlider.currentSlide + 1)
    }
})

const pageSlider = Slider({
    pages: LinkedList(document.querySelectorAll('.page')),
    track: Transformer(document.querySelector('.pageContainer'))(),
    nextBtn: Controller(document.querySelector('.sliderBtn'))('sliderBtn--active'),
    pointers: Pointers(document.querySelectorAll('.menu__link'))('menu__link--active'),
    isVertical: true
})

pageSlider.nextBtn.node.addEventListener('click', () => {
    pageSlider.render(pageSlider.currentSlide + 1)
})

document.querySelector('.header')?.addEventListener('click', (e) => {
    pageSlider.pointers?.nodes.forEach((pointer, i) => {
        if(e.target === pointer.node) {
            pageSlider.render(i + 1)                        
        }
    })
})