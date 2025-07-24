export type StorageFile = {
    type: string
    data: any
}

export type Directory = {
    [key: string]: StorageFile | Directory
}
