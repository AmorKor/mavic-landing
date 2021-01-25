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
    setActions(...acts: string[]): string[]
    render(): Element
}

interface IPointers {
    getControllers(): IController[]
    renderState(index: number): void
}

interface ISlider {
    pages: ILinkedList
    track: ITransformer
    prevBtn?: IController
    nextBtn: IController
    pointers: IPointers
    currentSlide: number
    
    moveTo(slideNum: number): INode | undefined
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
        getState: () => isEnabled ? 'active' : 'disabled',
        
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

type TransformerFactory = ({}: {node: HTMLElement, acts: string[]}) => (props: object) => ITransformer

const Transformer: TransformerFactory = ({node, acts}) => (porps): ITransformer  => {
    let actions = [...acts]
    return {
        ...porps,
        
        render() {
            node.style.transform = actions.join('')
            return node
        },
        getElement: () => node,
        setActions(...acts: string[]) {return actions = [...acts]},
    }
}

type PointersFactory = ({}: {nodes: NodeListOf<Element>, activeSel: string}) => (props: object) => IPointers

const Pointers: PointersFactory = ({nodes, activeSel}) => (props) => {
    const collection = [...nodes].map((node) => (Controller({node, activeSel})({})))
    let prev: IController | null = null
    
    return {
        ...props,
        
        getControllers: () => collection,
        
        renderState(index) {
            collection.forEach((controller, i) => {
                if(index === i) {
                    controller.renderState(true)
                    if(prev) {
                        prev.renderState(false)
                    }
                    prev = controller
                }
            })
        }     
    }
}

type SliderFactory = ({}: {
    pages: NodeListOf<Element>
    track: HTMLElement
    prevBtn?: Element
    nextBtn?: Element
    pointers?: NodeListOf<Element>
    isVertical?: boolean
}) => ({}: {
    prevActive?: string
    nextActive?: string
    pointerActive?: string
}) => ISlider

const Slider: SliderFactory = ({
    pages,
    track,
    prevBtn,
    nextBtn,
    pointers,
    isVertical,
}) => ({
    prevActive,
    nextActive,
    pointerActive,
}) => pipe(
    withConstructor(Slider)
)({
    pages: LinkedList(pages)({}),
    track: Transformer({node: track, acts: ['']})({}),
    prevBtn: prevBtn ? Controller({node: prevBtn, activeSel: prevActive})({}) : null, 
    nextBtn: nextBtn ? Controller({node: nextBtn, activeSel: nextActive})({}) : null ,
    pointers: pointers ? Pointers({nodes: pointers, activeSel: pointerActive})({}) : null,
    currentSlide: 1,

    moveTo(slideNum) {            
        let page 

        if(slideNum === this.currentSlide + 1) {
            page = this.pages.toNext()
        } else if(slideNum === this.currentSlide - 1) {
            page = this.pages.toPrev()
        } else {
            page = this.pages.setCurrent(slideNum - 1)
        }

        if(!page) return

        let multiplier = slideNum - 1
        
        if(
            this.currentSlide === this.pages.getNodes().length ||
            this.currentSlide > slideNum 
        ) {
            multiplier = this.currentSlide - (this.currentSlide - slideNum + 1)
        }

        this.track.setActions(
            isVertical ?
            `translateY(-${page.element.clientHeight * multiplier}px)` :
            `translateX(-${page.element.clientWidth * multiplier}px)` 
        )

        this.track.render()
        
        if(!page.next) {
            this.nextBtn?.renderState(false)
            this.prevBtn?.renderState(true)
        } else if(!page.prev) {
            this.prevBtn?.renderState(false)
            this.nextBtn?.renderState(true)
        } else {
            this.nextBtn?.renderState(true)
            this.prevBtn?.renderState(true)
        }
        
        if(pointers) {
            this.pointers.renderState(slideNum - 1)
        }
        
        this.currentSlide = slideNum
        
        return page
    }
})

const imgSlider = Slider({
    pages: document.querySelectorAll('.slider__img'),
    track: document.querySelector('.slider__inner'),
    prevBtn: document.querySelector('.controller--left'),
    nextBtn: document.querySelector('.controller--right'),
})({
    prevActive: 'controller--active',
    nextActive: 'controller--active'
})

const pageSlider = Slider({
    pages: document.querySelectorAll('.page'),
    track: document.querySelector('.pageContainer'),
    nextBtn: document.querySelector('.sliderBtn'),
    pointers: document.querySelectorAll('.menu__link'),
    isVertical: true,
})({
    nextActive: 'sliderBtn--active',
    pointerActive: 'menu__link--active',
})

const background = Controller({
    node: document.querySelector('.background'),
    activeSel: 'background--main' 
})({})

console.log(imgSlider)
console.log(pageSlider)

// const Question = ({controller, box, controllerAct, boxAct}: {
//     controller: Element, box: HTMLElement, controllerAct: string, boxAct: string
// }) => ({
//     btn: Controller(controller)(controllerAct),
//     answer: Transformer(box)(boxAct)
// });

// // [...document.querySelectorAll('.question__controller')].map(Pointers)

// const question = Question({
//     controller: document.querySelector('.question__controller'),
//     box: document.querySelector('.question__answer'),
//     controllerAct: 'question__controller--active',
//     boxAct: 'question__answer--active'
// })

// console.log(question)

// // const qa = Controllers(document.querySelectorAll('.question__controller'))('question__controller--active')
// const qa = Pointers(document.querySelectorAll('.question__controller'))('question__controller--active')

// document.querySelector('.qa__wrapper')?.addEventListener('click', (e) => {
//     qa.nodes.forEach((btn, i) => {
//         if(e.target === btn.node) {
//             qa.render(i)
//         }
//     })
// })

document.querySelector('.buttonContainer')?.addEventListener('click', (e) => {
    if(e.target === imgSlider.prevBtn?.getElement()) {
        imgSlider.moveTo(imgSlider.currentSlide - 1);
    } else {
        imgSlider.moveTo(imgSlider.currentSlide + 1)
    }
})

pageSlider.nextBtn.getElement().addEventListener('click', () => {
    pageSlider.moveTo(pageSlider.currentSlide + 1)
    background.renderState(true)
})

document.querySelector('.header')?.addEventListener('click', (e) => {
    pageSlider.pointers?.getControllers().forEach((pointer, i) => {
        if(e.target === pointer.getElement()) {
            pageSlider.moveTo(i + 1)        
            if(pageSlider.currentSlide > 1) {
                background.renderState(true)   
            } else {
                background.renderState(false)   
            }
        }
    })
})