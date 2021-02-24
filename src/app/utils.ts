export function compose<T>(...fns: CallableFunction[]) {
    return (arg: T): T => 
    fns.reduceRight((x, fn) => fn(x), arg)
}  

export function pipe<T>(...fns: CallableFunction[]) {
    return (arg: T): T => 
        fns.reduce((x, fn) => fn(x), arg)
}
    
export const withConstructor = (constructor: Function) => (obj: object) => 
({
    __proto__: {
        constructor
    },
    ...obj
})    

export const isMobile = (width: number) => window.innerWidth < width ? true : false

export const isActive = (node: HTMLElement | Element) => (activeSel: string) => 
    node.classList.contains(activeSel)

export function debounce(fn: any, wait: number, immediate?: boolean) {
    let timeout: NodeJS.Timeout | undefined

    return function deffered(...args: any[]) {
        const callNow = immediate && !timeout

        const invoke = () => {
            timeout = undefined
            if(!immediate) fn.apply(deffered, args)
        }

        timeout ? clearTimeout(timeout) : null
        
        timeout = setTimeout(invoke, wait)

        if(callNow) fn.apply(deffered, args)
    }
}

export const transform = (action: string) => (value: string) => (node: HTMLElement | null) =>
{
    if(node) {
        node.style.transform = `${action}(${value})`
    } 
    return node
}

