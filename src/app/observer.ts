import {IController} from './controller'
import {ITransformer} from './transformer'

interface IPublisher {
    subscribe(obs: IObserver): number
    unsubscribe(obs: IObserver): IObserver[]
    notify(data?: any): void
}

interface IObserverList {
    attach(obs: IObserver): number
    detach(obs: IObserver): IObserver[]
    getList(): IObserver[]
    getByIndex(index: number): IObserver
    getIndexOf(obs: IObserver): number
}

interface IObserver {
    update(data: any): void
}

export function ObserverList(observers? :IObserver[]): IObserverList {
    const _list: IObserver[] = observers ? observers : []
    return {
        attach: (obs) => _list.push(obs),
        detach: (obs) => _list.splice(_list.indexOf(obs), 1),
        getByIndex: (index) => _list[index],
        getIndexOf: (obs) => _list.findIndex(el => el === obs),
        getList: () => _list
    }
}

export function Publisher(list?: IObserverList): IPublisher {
    let _observers = list ? list : ObserverList()
    return {
        subscribe: (obs) => _observers.attach(obs),
        unsubscribe: (obs) => _observers.detach(obs),
        notify: (data: any) => _observers.getList().forEach((obs: IObserver) => obs.update(data))
    }
}

export function LinkObserver(link: IController): IObserver {
    const _link = link
    return {
        update(data) {
            if(data === _link.getElement()) {
                _link.renderState(true)
            } else {
                _link.renderState(false)
            }
        }
    }
}

export function TransformerObserver(transformer: ITransformer): IObserver {
    const _transformer = transformer
    return {
        update(data: {value: number, index: number}) {
            _transformer.setValue(`-${data.value * data.index}px`)
            _transformer.render()
        }
    }
}
