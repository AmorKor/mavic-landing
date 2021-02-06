import { compose, withConstructor } from "./utils"

export interface IController {
    map(fn: CallableFunction): IController
    getElement(): HTMLElement | Element | null
    getState(): boolean
    renderState(isActive: boolean): HTMLElement | Element | null
}

export const Controller = (node: HTMLElement | Element | null) => (activeSel: string): IController =>
{
    let isEnabled = node?.classList.contains(activeSel) ? true : false

    return compose<IController>(
        withConstructor(Controller)
    )({
        map: fn => Controller(fn(node))(activeSel),
        
        getElement: () => node,
        
        getState: () => isEnabled,
        
        renderState: (isActive) => {            
            isEnabled = isActive
            if(isEnabled) {
                node?.classList.add(activeSel)
            } else {
                node?.classList.remove(activeSel)
            }
            return node
        },
    })
}
