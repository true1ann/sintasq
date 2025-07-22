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

const check = {
    vendor: (vendor: string, throwErr: boolean = false) => {
        if (runtimestorage.vendors[vendor]) {
            return true
        } else {
            if (throwErr) {
                throw new Error(`Vendor with name ${vendor} does not exist`)
            } else {
                return false
            }
        }
    },
    path: (fpath: string, throwErr: boolean = false) => {
        const [vendor, ipath] = fpath.split(':')
        const path = ipath.split('/')
        if (check.vendor(vendor, false)) {
            // check if runtimestorage.vendors{path}.type exists
            let cdir = runtimestorage.vendors[vendor]

            for (const ndir of path) {
                const next = cdir[ndir];
                if (!next || "type" in next) {
                    if (throwErr) {
                        throw new Error(`Directory ${ndir} does not exist in ${vendor}:${cdir}/`);
                    } else {
                        return false
                    }
                }
                cdir = next as Directory
            }
            return true
        } else {
            if (throwErr) {
                throw new Error(`Vendor with name ${vendor} does not exist`)
            } else {
                return false
            }
        }
    }
}

const register = {
    vendor: (vendor: string) => {
        if (check.vendor(vendor)) {
            throw new Error(`Vendor with name ${vendor} already exists`)
        }
        runtimestorage.vendors[vendor] = {}
        return true
    },
    directory: (fpath: string) => {
        const [vendor, ipath] = fpath.split(':')
        check.vendor(vendor, true)
        const path = ipath.split('/')
        let cdir: Directory = runtimestorage.vendors[vendor]

        for (const ndir of path) {
            if (!cdir[ndir]) {
                cdir[ndir] = {}
            }
            cdir = cdir[ndir] as Directory
        }
        return true
    },
    method: (fpath: string, data: { name: string; params: any[]; method: Function; }) => { // { method: 'vendor:path/method', args: ['arg1', 'works the same as in functions'] }
        const [vendor, path] = fpath.split(':')
        
        if (!runtimestorage.vendors[vendor]) {
            throw new Error(`Vendor with name ${vendor} does not exist`)
        }

        const parts = path.split('/')
    },
    component: (fpath: string, data: { name: string, componentdata: any; }) => { // <st-c id="vendor:path/component" arg1="works the same as in html">really</st-c>
        const [vendor, path] = fpath.split(':')
        
        if (!runtimestorage.vendors[vendor]) {
            throw new Error(`Vendor with name ${vendor} does not exist`)
        }

        const parts = path.split('/')
    },
}

const access = {
    method: (fpath: string, args: any[]) => {

    },
    component: (fpath: string) => {

    }
}

export {}

declare global {
    interface Window {
        sintasq_initializer: Function
    }
}

window.sintasq_initializer = () => {
    return {
        dev: {
            storage: runtimestorage,
        },
        check,
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