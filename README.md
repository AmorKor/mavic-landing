# Mavic Drone
Adaptive landing page
Live example [here](https://amorkor.github.io/mavic-landing/)
### Project features
Main prerequisites for building up this project were desire to get in touch with functional programming and try to combine OOP approaches with functional concepts in most effective way.
Main component of this site is slider, which is expressed in classical object-oriented way through **doubly Linked List ADT**:
```typescript
interface INode<T> {
    element: T
    next: INode<T> | undefined
    prev: INode<T> | undefined
}

interface ILinkedList<T> {
    head: INode<T>
    tail: INode<T>
    current: INode<T>
        
    indexOf(node: INode<T>): number
    
    setCurrent(index: number): INode<T> | undefined
    toNext(): INode<T> | undefined
    toPrev(): INode<T> | undefined
}
```

Another equally important components are *buttons, links* and other intaractive components, which main feature is *ability to toggle their own state* form active to disabled and versa:
```typescript
interface IController {
    map(fn: CallableFunction): IController
    
    getElement(): HTMLElement | Element | null
    getState(): boolean
    renderState(isActive: boolean): HTMLElement | Element | null
}
``` 

**Pub\sub pattern** was also used to decouple components, for example page slider and menu:
```typescript
interface IPublisher {
    subscribe(obs: IObserver): number
    unsubscribe(obs: IObserver): IObserver[]
    notify(data?: any): void
}

interface IObserverList {
    attach(obs: IObserver): number
    detach(obs: IObserver): IObserver[]
    map(fn: CallableFunction): IObserverList
}

interface IObserver {
    update(data: any): void
}
``` 

Such elements as *compose, pipe, map method* was implemented to get benefit from functional concepts:
```typescript
function compose<T>(...fns: CallableFunction[]) {
    return (arg: T): T => 
    fns.reduceRight((x, fn) => fn(x), arg)
}  

function pipe<T>(...fns: CallableFunction[]) {
    return (arg: T): T => 
        fns.reduce((x, fn) => fn(x), arg)
}
```