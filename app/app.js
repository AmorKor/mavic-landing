// general slider class
class Slider {
    // get correct box size for proper scrolling
    setContainerSize(container, horizontal = true) {
        this.body = container
        
        if(horizontal) {
            this.containerSize = this.body.clientWidth
        } else {
            this.containerSize = this.body.clientHeight
        }
    }
    
    constructor(
        scrollingContainerSelector,
        referenceContainerSelector,
        pageSelector,
        buttonSelectors 
    ) {
        this.container = document.querySelector(scrollingContainerSelector)
        this.referenceContainer = document.querySelector(referenceContainerSelector)
       
        this.buttonSelectors = {
            common: buttonSelectors['common'],
            disabled: buttonSelectors['disabled']
        }
        this.buttons = Array.from(document.querySelectorAll(this.buttonSelectors['common']))
        
        this.containerSize
        this.setContainerSize(this.referenceContainer)

        this.pages = Array.from(document.querySelectorAll(pageSelector))

        this.activePage = 0
        this.pagesCollection = this.pages.map((el, i) => {
                                    return {
                                        pageNode: this.pages[i],
                                        pageNumber: this.pages.indexOf(this.pages[i]) + 1,
                                    }
                                }) 
    }
    
    get getContainerSize() {
        return this.containerSize
    }    
    
    scrollTo(pageNum, horizontal = true, hasZeroSlider = false) {
        if((pageNum === this.pagesCollection.length && hasZeroSlider === false) || pageNum < 0) return

        this.setContainerSize(this.referenceContainer)
        let desiredPage
        
        if(pageNum > 0) {
            desiredPage = this.pagesCollection[pageNum - 1].pageNumber
        } else {
            desiredPage = this.pagesCollection[pageNum].pageNumber - 1
        }

        if(horizontal) {
            this.container.style.transform = `translateX(-${this.containerSize * desiredPage}px)`
        } else {
            this.container.style.transform = `translateY(-${this.containerSize * desiredPage}px)`
        }

        this.checkSliderState()
    }
    
    checkSliderState() {
        this.container.addEventListener('transitionend', () => {
            this.setActivePage()
            this.checkButtons()
        })
    }
    
    getShiftValue() {
        const transString = this.container.getAttribute('style') 

        const currentShift = parseInt(
                transString.slice(
                    transString.indexOf('-'),
                    transString.indexOf(')'))
                )   
        
        return currentShift
    }
    
    // recalc transition value to fix appearence on window resizing
    fixPosition() {
        if(!(this.container.hasAttribute('style'))) return

        const currentShift = this.getShiftValue()
        
        const oldSize = this.containerSize
        this.setContainerSize(this.referenceContainer)
        const newSize = this.containerSize

        this.container.style.transform = `translateY(${currentShift + (this.activePage * (oldSize - newSize))}px)`
    }

    
    isInView(element, container, elemNum) {
        const rect = element.getBoundingClientRect()
        const wrapper = container.parentElement.getBoundingClientRect()
                
        return (
            rect.left === wrapper.left
        )
    }

    
    setActivePage() {
        this.pagesCollection.forEach((el, i) => {
            if(this.isInView(this.pagesCollection[i].pageNode, this.container)) {
                this.activePage = this.pagesCollection[i].pageNumber - 1
            } 
        })
    }

    checkButtons(hasZeroSlider = false) {     
        this.firstIndex = 0
        this.lastIndex = this.buttons.length - 1 
           
        if(this.activePage === this.pagesCollection.length && hasZeroSlider === true) {
            this.buttons[this.lastIndex].classList.add(this.buttonSelectors['disabled'].slice(1))
            this.buttons[this.lastIndex].setAttribute('disabled', '')
        } else if(this.activePage + 1 === this.pagesCollection.length && hasZeroSlider === false) {
            this.buttons[this.lastIndex].classList.add(this.buttonSelectors['disabled'].slice(1))
            this.buttons[this.lastIndex].setAttribute('disabled', '')
            console.log(this.buttons[this.lastIndex])
        } else if(this.activePage === 0 && hasZeroSlider === false) {
            this.buttons[this.firstIndex].classList.add(this.buttonSelectors['disabled'].slice(1))
            this.buttons[this.firstIndex].setAttribute('disabled', '')
        } else {
            this.buttons.forEach((button, i) => {
                button.classList.remove(this.buttonSelectors['disabled'].slice(1))
                button.removeAttribute('disabled')
            })
        }
    }
}

const aboutSlider = new Slider(
    '.slider__inner',
    '.slider__wrapper',
    '.slider__img',
    {
        common: '.slider__controller',
        disabled: '.controller--disabled',
    },
)

console.log(aboutSlider)

aboutSlider.buttons[0].addEventListener('click', () => {
    aboutSlider.scrollTo(aboutSlider.activePage - 1 )
})

aboutSlider.buttons[1].addEventListener('click', () => {
    aboutSlider.scrollTo(aboutSlider.activePage + 1)
})


class PageSlider extends Slider {
    setContainerSize() {
        super.setContainerSize(this.referenceContainer, false)
        this.bodyPadding = +(
            window.getComputedStyle(this.body)
            .getPropertyValue('padding-top')
            .slice(0, -2)
            )
        this.containerSize -= this.bodyPadding
    }
    
    constructor(
        scrollingContainerSelector,
        referenceContainerSelector,
        pageSelector, 
        buttonSelectors,
        navSelectors
        ) {
        super(
            scrollingContainerSelector,
            referenceContainerSelector,
            pageSelector, 
            buttonSelectors
        )
        
        this.navSelectors = {
            common: navSelectors['common'],
            active: navSelectors['active']
        }
        
        this.nav = Array.from(document.querySelectorAll(this.navSelectors['common']))
        this.pagesCollection = this.pages.map((el, i) => {
                                    return {
                                        pageNode: this.pages[i],
                                        pageNumber: this.pages.indexOf(this.pages[i]) + 1,
                                        link: this.nav[i].children[0],
                                        isActive: this.nav[i].classList.contains('menu__item--active')
                                    }
                                }) 
    }

    isInView(element) {
        const rect = element.getBoundingClientRect()

        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidht)
        )
    }

    checkSliderState() {
        this.container.addEventListener('transitionend', () => {
            this.setActivePage()
            this.checkButtons(true)
            this.checkBackground()
        })
    }

    
    setActivePage() {
        this.pagesCollection.forEach((el, i) => {
            if(this.isInView(this.pagesCollection[i].pageNode)) {
                this.pagesCollection[i].link.parentNode.classList.add(this.navSelectors['active'].slice(1))
                this.pagesCollection[i].isActive = true
                this.activePage = this.pagesCollection[i].pageNumber
            } else {
                this.pagesCollection[i].link.parentNode.classList.remove(this.navSelectors['active'].slice(1))
                this.pagesCollection[i].isActive = false
            }
        })
}

    checkBackground() {
        if(this.activePage > 0) {
            document.querySelector('.background').classList.add('background--main')
        } else if(this.activePage === 0) {
            document.querySelector('.background').classList.remove('background--main')
        }
    }

}


const pageSlider = new PageSlider(
        '.pageContainer',
        'body',
        '.page--main',
        {
            common: '.sliderBtn',
            disabled: '.sliderBtn--disabled'
        },
        {
            common: '.menu__item', 
            active: '.menu__item--active' 
        }
    )

console.log(pageSlider)
    
window.onresize = () => {
    pageSlider.fixPosition()
}

// redirecting on page through navigation menu
document.querySelector('.menu').addEventListener('click', e => {
    pageSlider.pagesCollection.forEach((el, i) => {
        if(e.target === pageSlider.pagesCollection[i].link) {
            pageSlider.scrollTo(
                pageSlider.pagesCollection[i].pageNumber,
                false, 
                true
                )
        } 
    })
})

// slide down on button clicking
pageSlider.buttons[0].addEventListener('click', () => {
    pageSlider.scrollTo(pageSlider.activePage + 1, false, true)
})

// return to start page
document.querySelector('.logo').addEventListener('click', () => {
    pageSlider.container.removeAttribute('style')
    pageSlider.activePage = 0
})
//# sourceMappingURL=app.js.map
