import {IController} from './controller'

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

export function ObserverList(observers: IObserver[]): IObserverList {
    return {
        attach: (obs) => observers.push(obs),
        detach: (obs) => observers.splice(observers.indexOf(obs), 1),
        map: (fn) => ObserverList(observers.map(obs => fn(obs)))
    }
}

export function Publisher(list: IObserverList = ObserverList([])): IPublisher {
    return {
        subscribe: (obs) => list.attach(obs),
        unsubscribe: (obs) => list.detach(obs),
        notify: (data: any) => list.map((obs: IObserver) => obs.update(data))
    }
}

export function ControllerObserver(controller: IController): IObserver {
    return {
        update: (data) => (
            controller.map(
                (node: HTMLElement | Element) => (
                    (data === node) ?
                        controller.renderState(true) :
                        controller.renderState(false)
                )
            )
        ) 
    }
}
