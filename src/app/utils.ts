// export const compose = (...fns: any[]) => (arg: any) => 
//     fns.reduceRight((acc, fn) => fn(acc), arg) 

// export const pipe = (...fns: any[]) => (arg: any) => 
//     fns.reduce((acc, fn) => fn(acc), arg)
    
// export const withConstructor = (constructor: object) => (obj: object) => ({
//     __proto__: {
//         constructor
//     },
//     ...obj
// })    

export const isMobile = (width: number) => window.innerWidth < width ? true : false

export function debounce(fn: any, wait: number, immediate?: boolean) {
    let timeout: number |  undefined

    return function deffered(...args: any[]) {
        const callNow = immediate && !timeout

        const invoke = () => {
            timeout = undefined
            if(!immediate) fn.apply(deffered, args)
        }

        clearTimeout(timeout)
        
        timeout = setTimeout(invoke, wait)

        if(callNow) fn.apply(deffered, args)
    }
}

