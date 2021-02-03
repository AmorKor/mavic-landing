export interface ITransformer {    
    getElement: () => HTMLElement | null
    setAction(action: string): string
    setValue(value: string): string
    render(): string | null
}

export function Transformer(
    arg: 
    {node: HTMLElement | null, action?: string, value?: string}
): ITransformer  
{
    return {    
        render: () => arg.node ? 
            arg.node.style.transform = `${arg.action}(${arg.value})` :
            null,
        getElement: () => arg.node,
        setAction: (act) => (arg.action = act),
        setValue: (val) => (arg.value = val)
    }
}
