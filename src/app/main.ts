import {isMobile, debounce, transform, isActive} from './utils'
import {NodeF, LinkedList} from './linked_list'
import {Controller} from './controller'
import { ControllerObserver, ObserverList, Publisher } from './observer'

// menu on mobile version setup
const menu = {
    button: Controller(
        document.querySelector('.burger')
        )('burger--active'),
    nav: Controller(
        document.querySelector('.menu')
        )('menu--active')
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
    pages: LinkedList(
            [...document.querySelectorAll('.slider__img')]
            .map(NodeF)
        ),
    
    track: Controller(
        document.querySelector('.slider__inner')
        )(''),
    
    nextButton: Controller(
        document.querySelector('.controller--right')
        )('controller--active'),
        
    prevButton: Controller(
            document.querySelector('.controller--left')
            )('controller--active'),
        
    checkButtons: function() {
        const current = this.pages.current

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

const transformImgSlider = transform('translateX')

document.querySelector('.controller--right')?.addEventListener('click', debounce(() => {
    const current = imgSlider.pages.toNext() 

    if(!current) return
    
    imgSlider.track.map(transformImgSlider(
        `-${
            current?.element.clientWidth * imgSlider.pages.indexOf(current)
        }px`
    ))
    
    imgSlider.checkButtons()
}, 300, true))

document.querySelector('.controller--left')?.addEventListener('click', debounce(() => {
    const current = imgSlider.pages.toPrev() 

    if(!current) return
    
    imgSlider.track.map(transformImgSlider(
        `-${
            current?.element.clientWidth * imgSlider.pages.indexOf(current)
        }px`
    ))

    imgSlider.checkButtons()
}, 300, true))

// page slider setup
const pageSlider = {
    pages: LinkedList(
            [...document.querySelectorAll('.page')]
            .map(NodeF)
        ),

    track: Controller(
        document.querySelector('.body__inner')
        )(''),

    nextButton: Controller(
            document.querySelector('.sliderBtn')
            )('sliderBtn--active'),

    links: [...document.querySelectorAll('.pointer')]
        .map(Controller)
        .map(el => el('menu__link--active')),

    background: Controller(
            document.querySelector('.background')
            )('background--main'),

    checkButton: function() {
        !this.pages.current.next ? 
            this.nextButton.renderState(false) :
            this.nextButton.renderState(true)
    },

    checkBackground: function() {
        !this.pages.current.prev ?
            this.background.renderState(false) :
            this.background.renderState(true)
    }
}


const transformPageSlider = transform('translateY')

// for syncronizing header menu with page slider
const linkPublisher = Publisher(
    ObserverList(
        pageSlider.links.map(ControllerObserver)
    )
)

document.querySelector('.sliderBtn')?.addEventListener('click', debounce(() => {
    const current = pageSlider.pages.toNext()
    if(!current) return

    const index = pageSlider.pages.indexOf(current)

    pageSlider.track.map(transformPageSlider(
        `-${
            current?.element.clientHeight * index
        }px`
    ))

    linkPublisher.notify(pageSlider.links[index].getElement())

    pageSlider.checkButton()
    pageSlider.checkBackground()
}, 300, true))

document.querySelector('.header')?.addEventListener('click', debounce((e: Event) => {    
    const controller = pageSlider.links.find((contr) => contr.getElement() === e.target)

    if(!controller) return

    const index = pageSlider.links.indexOf(controller)
    const current = pageSlider.pages.setCurrent(index)
    
    if(!current) return
    
    pageSlider.track.map(transformPageSlider(
        `-${
            current?.element.clientHeight * index
        }px`
    ))

    if(isMobile(1150)) {
        menu.nav.renderState(false)
        menu.button.renderState(false)
    }
    
    linkPublisher.notify(controller.getElement())

    pageSlider.checkButton()
    pageSlider.checkBackground()
}, 300, true))

// fix transformation on window resize
window.addEventListener('resize', debounce(() => {
    const current = pageSlider.pages.current
    pageSlider.track.map(transformPageSlider(
        `-${
            current.element.clientHeight * pageSlider.pages.indexOf(current)
        }px`
    ))
}, 200))

const questionPublisher = Publisher(
    ObserverList(
        [...document.querySelectorAll('.question')]
            .map(Controller)
            .map(contr => contr('question--active'))
            .map(ControllerObserver)
    )
) 

document.querySelector('.qa__wrapper')?.addEventListener('click', (e: any) => {
    if(isMobile(770)) {
        isActive(e.target)('question--active') ?
            questionPublisher.notify({}) :
            questionPublisher.notify(e.target)
        return
    }

    isActive(e.target.parentElement)('question--active') ?
        questionPublisher.notify({}) :
        questionPublisher.notify(e.target.parentElement)

})

