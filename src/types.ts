export type StorageFile = {
    type: string
    data: Directory | componentDataFile | methodFile
}

export type Directory = {
    [key: string]: StorageFile | Directory
}

export type componentDataFile = {
    name: string,
    template?: string | null,
    lifeHooks?: {
        beforeCreate?: () => void | beforeCreateOut, // Sintasq just got a request to attach the component
        afterCreate?: Function, // After sintasq fully renderred the component
        beforeDelete?: Function, // Always awaited
        onLazyTrigger?: Function // First time enterring the viewport
    },
    config?: {
        awaitBeforeCreate?: boolean | null, // We will expect output from lifeHooks.beforeCrate
        useShadowRoot?: boolean | null // if you use this without a proper reason you should acknowledge that its better to go to a therapyst that continuing to be a webdev.
    }
}

export type beforeCreateOut = {
    [key: string]: any,
    sintasq__magicText?: Record<string, string>,
    sintasq__env?: {
        className?: string | null,
        id?: string | null
    }
    // you are safe with making a custom payload, just make sure it doesnt have a sintasq__ prefix.
}

export type methodFile = {
    name: string,
    method: Function,
    config?: {
        isAsync?: boolean | null,
        sameVendorOnly?: boolean | null
    }
}