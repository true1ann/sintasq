type StorageFile = {
    type: string
    data: any
}

type Directory = {
    [key: string]: StorageFile | Directory
}

let runtimestorage = {
    vendors: {} as { 
        [key: string]: Directory
    }
}

const bakedstorage = {
    version: 0.1,
    releasetype: 'alpha'
}

const register = {
    vendor: (vendor: string) => {
        if (runtimestorage.vendors[vendor]) {
            throw new Error(`Vendor with name ${vendor} already exists`)
        }
        runtimestorage.vendors[vendor] = { dirs: {} }
    },
    directory: (fpath: string) => {
        const [vendor, path] = fpath.split(':')
        
        if (!runtimestorage.vendors[vendor]) {
            throw new Error(`Vendor with name ${vendor} does not exist`)
        }

        const parts = path.split('/')
        let currentDir: Directory = runtimestorage.vendors[vendor]

        for (const part of parts) {
            if (!currentDir[part]) {
                currentDir[part] = {}
            }
            currentDir = currentDir[part] as Directory
        }
    },
    method: (path: string, data: { name: string; params: any[]}) => { // { method: 'vendor:path/method', args: ['arg1', 'works the same as in functions'] }

    },
    component: (path: string, data: {}) => { // <st-c id="vendor:path/component" arg1="works the same as in html">really</st-c>

    },
}

const access = {
    method: (fpath: string) => {

    },
    component: (fpath: string) => {

    }
}

export {}

declare global {
    interface Window {
        sintasq_initializer: any // TODO: make a type for this, moron
    }
}

window.sintasq_initializer = () => {
    return {
        dev: {
            storage: runtimestorage,
        },
        register,
        access
    }
}

register.vendor('sintasq');
register.vendor('pluginstore');
function checkup() { // scoping it so it wont leak into anything
    const st_test = window.sintasq_initializer();
    if (st_test.dev || bakedstorage.releasetype.toLowerCase() != 'release') {
        console.warn('%c[sintasq] The current version of Sintasq is suspected to be a DEVELOPER BUILD.', 'font-size: 32px;')
        console.warn('%c[sintasq] IF THIS IS NOT A DEVELOPMENT ENVIRONMENT YOU SHOULD GET THE LATEST STABLE RELEASE.', 'font-size: 32px;')
    }
    console.info(`[sintasq] Running Sintasq ${bakedstorage.version}, ${bakedstorage.releasetype.toUpperCase()}`)
}
checkup()