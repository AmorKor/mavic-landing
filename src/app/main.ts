import {isMobile, debounce} from './utils'
import {LinkedList} from './linked_list'
import {Controller} from './controller'
import {Transformer} from './transformer'
import {Publisher, ObserverList, LinkObserver, TransformerObserver} from './observer'

// menu on mobile version setup
const menu = {
    button: Controller({
        node: document.querySelector('.burger'),
        activeSel: 'burger--active'
    }),
    nav: Controller({
        node: document.querySelector('.menu'),
        activeSel: 'menu--active'
    }) 
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

// description slider setup
export const imgSlider = {
    pages: LinkedList(document.querySelectorAll('.slider__img')),
    
    track: TransformerObserver(Transformer({
        node: document.querySelector('.slider__inner'),
        action: 'translateX'
        })
    ),
    
    nextButton: Controller({
        node: document.querySelector('.controller--right'),
        activeSel: 'controller--active'}
        ),
        
    prevButton: Controller({
        node: document.querySelector('.controller--left'),
        activeSel: 'controller--active'}
        ),
        
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

document.querySelector('.controller--right')?.addEventListener('click', debounce(() => {
    const current = imgSlider.pages.toNext() 
    imgSlider.track.update({
        value: current?.element.clientWidth,
        index: imgSlider.pages.indexOf(current)
    })

    imgSlider.checkButtons()
}, 300, true))

document.querySelector('.controller--left')?.addEventListener('click', debounce(() => {
    const current = imgSlider.pages.toPrev() 
    imgSlider.track.update({
        value: current?.element.clientWidth,
        index: imgSlider.pages.indexOf(current)
    })

    imgSlider.checkButtons()
}, 300, true))

// page slider setup
const pageSlider = {
    pages: LinkedList(document.querySelectorAll('.page')),

    track: TransformerObserver(Transformer({
        node: document.querySelector('.body__inner'),
        action: 'translateY'
        })
    ),

    nextButton: Controller({
        node: document.querySelector('.sliderBtn'),
        activeSel: 'sliderBtn--active'}
        ),

    links: [...document.querySelectorAll<HTMLElement>('.pointer')]
        .map((el) => Controller({
            node: el,
            activeSel: 'menu__link--active'
        })),

    background: Controller({
        node: document.querySelector('.background'),
        activeSel: 'background--main'
    }),

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

// for syncronizing header menu with page slider
const linkObservers = ObserverList(
    pageSlider.links
    .map(l => LinkObserver(l))
)
const linkPublisher = Publisher(linkObservers)

document.querySelector('.sliderBtn')?.addEventListener('click', debounce(() => {
    const current = pageSlider.pages.toNext()
    const index = pageSlider.pages.indexOf(current) || -1

    pageSlider.track.update({
        value: current?.element.clientHeight,
        index: index
    })

    linkPublisher.notify(pageSlider.links[index].getElement())

    pageSlider.checkButton()
    pageSlider.checkBackground()
}, 300, true))

document.querySelector('.header')?.addEventListener('click', debounce((e: Event) => {    
    const controller = pageSlider.links.find((contr) => contr.getElement() === e.target)

    if(!controller) return
    const index = pageSlider.links.indexOf(controller)
    const current = pageSlider.pages.setCurrent(index)
    
    pageSlider.track.update({
        value: current?.element.clientHeight,
        index: pageSlider.pages.indexOf(current)
    })

    if(isMobile(1150)) {
        menu.nav.renderState(false)
        menu.button.renderState(false)
    }
    
    linkPublisher.notify(controller.getElement())

    pageSlider.checkButton()
    pageSlider.checkBackground()
}, 300, true))

const answers = ObserverList([...document.querySelectorAll<HTMLElement>('.question__answer')].map(a => {
    return LinkObserver(Controller({
        node: a,
        activeSel: 'question__answer--active'
    }))
}))

const qaButtons = ObserverList([...document.querySelectorAll<HTMLElement>('.question__controller')].map(c => {
    return LinkObserver(Controller({
        node: c,
        activeSel: 'question__controller--active'
    }))
}))

const answerPublisher = Publisher(answers)
const qaButtonPublisher = Publisher(qaButtons)

document.querySelector('.qa__wrapper')?.addEventListener('click', (e: any) => {
    console.log(e)
    if(isMobile(770)) {
        answerPublisher.notify(e.target.children[0])
        qaButtonPublisher.notify(e.target.children[1])
        return
    }
    qaButtonPublisher.notify(e.target)
    answerPublisher.notify(e.target.previousElementSibling)
})

window.addEventListener('resize', debounce(() => {
    const current = pageSlider.pages.getCurrent()

    pageSlider.track.update({
        value: current.element.clientHeight,
        index: pageSlider.pages.indexOf(current)
    })
}, 200))
