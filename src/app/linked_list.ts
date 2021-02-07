import { compose, withConstructor } from './utils'

export interface INode<T> 
{
    element: T
    next: INode<T> | undefined
    prev: INode<T> | undefined
}

export interface ILinkedList<T> 
{
    head: INode<T>
    tail: INode<T>
    current: INode<T>
        
    indexOf(node: INode<T>): number
    
    setCurrent(index: number): INode<T> | undefined
    toNext(): INode<T> | undefined
    toPrev(): INode<T> | undefined
}

export interface IPage 
{
    page: Element
    number: number
}

export const NodeF = <T>(element: T): INode<T> => 
compose<INode<T>>(
    withConstructor(NodeF)
)({
    element,
    next: undefined,
    prev: undefined
})
    
export const linkNodes = <T>(nodes: INode<T>[]): INode<T>[] =>
(
    nodes.map((node, i, arr) => (
        Object.assign(
                node, 
                {
                next: arr[i + 1],
                prev: arr[i - 1]
                }
            )
        )
    )
)

export const Page = (node: Element): IPage =>
({
    page: node,
    number: 0
})

export const paginate = (page: IPage) => (number: number) =>
({
    ...page,
    number
})

export const LinkedList = <T>(collection: INode<T>[]): ILinkedList<T> => 
    compose<ILinkedList<T>>(
        withConstructor(LinkedList)
    )({
        head: collection[0],
        tail: collection[collection.length - 1],
        current: collection[0],

        indexOf: (node) =>  collection.indexOf(node),
                
        setCurrent(index) {
            return collection[index] ?
                    this.current = collection[index] : 
                    undefined
        },
        toNext()  {
            return this.current.next ?
                    this.current = this.current.next :
                    undefined
        },
        toPrev()  {
            return this.current.prev ?
                    this.current = this.current.prev :
                    undefined
        }
    })
