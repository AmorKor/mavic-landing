export interface IController {
    getElement(): HTMLElement | null
    getState(): boolean
    renderState(isActive: boolean): void
}

export function Controller(
    arg: 
    {node: HTMLElement | null, activeSel: string}
): IController 
{
    let isEnabled = arg.node?.classList.contains(arg.activeSel) ? true : false
    return {
    
        getElement: () => arg.node,
        getState: () => isEnabled,
        
        renderState: (isActive) => {            
            if(isActive) {
                arg.node?.classList.add(arg.activeSel)
            } else {
                arg.node?.classList.remove(arg.activeSel)
            }
            isEnabled = isActive
        },
    }
}
