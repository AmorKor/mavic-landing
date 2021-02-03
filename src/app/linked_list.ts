interface INode {
    element: any
    next: INode | null
    prev: INode | null
}

interface ILinkedList {
    getHead(): INode
    getTail(): INode
    getCurrent(): INode
    indexOf(node: INode | null): number | null
    
    setCurrent(index: number): INode | null
    toNext(): INode | null
    toPrev(): INode | null
}

export function NodeF(element: Element): INode {
    return {
        element,
        next: null,
        prev: null    
    }
}

export function linkNodes(nodes: INode[]): INode[] {
    return nodes.map((node, i, arr) => (
            Object.assign(node, {
                next: arr[i + 1],
                prev: arr[i - 1]
            })
        ))
}

export function LinkedList(nodes: NodeListOf<Element>): ILinkedList {
    const collection = linkNodes([...nodes].map(NodeF))
    let head = collection[0]
    let tail = collection[collection.length - 1]
    let current = collection[0]
    
    return {
        getHead: () => head,
        getTail: () => tail,
        getCurrent: () => current,
        indexOf: (node) => node ? collection.indexOf(node) : null,
        // getByIndex()
                
        setCurrent: (index) => collection[index] ? current = collection[index]: tail.next,
        toNext: () => current.next ? current = current.next : current.next,
        toPrev: () => current.prev ? current = current.prev : current.prev
    }
}
