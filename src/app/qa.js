function showContent(controller, controllerActive, content, contentActive) {
    this.contents = Array.from(document.querySelectorAll(content))
    this.contentActive = contentActive
    this.controllers = Array.from(document.querySelectorAll(controller))
    this.controllerActive = controllerActive
    
    return {
        init(action) {
            controllers.forEach((button, i) => {
                button.addEventListener(action, () => {
                    if(contents[i].classList.contains(contentActive.slice(1))) {
                        this.hide(contents[i], button)
                    } else {
                        this.show(contents[i], button)
                        this.hideAll(contents[i], button)
                    }
                }) 
            }) 
        },
        
        show(element, controller, isSingle) {
            element.classList.add(contentActive.slice(1))
            this.changeControllerState(controller, isSingle)
        },
        
        hide(element, controller, isSingle) {
            element.classList.remove(contentActive.slice(1))
            this.changeControllerState(controller, isSingle)
        },
        
        hideAll(exeption, exeptionController) {
            contents.forEach((element, i) => {
                if(!(element === exeption && exeptionController === controllers[i])) {
                    this.hide(element, exeptionController, false)
                }
            })
        },

        changeControllerState(controller, isSingle = true) {
            if(controller.classList.contains(controllerActive.slice(1)) && isSingle) {
                controller.classList.remove(controllerActive.slice(1))
            } else if(controller.classList.contains(controllerActive.slice(1)) && !isSingle) {
                controllers.forEach(element => {
                    element.classList.remove(controllerActive.slice(1))
                })
                controller.classList.add(controllerActive.slice(1))
            } else {
                controller.classList.add(controllerActive.slice(1))
            }
        }
    }
}

const qa = showContent(
    '.question__controller',
    '.question__controller--active',
    '.question__answer',
    '.question__answer--active')

qa.init('click')


