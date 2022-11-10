async function setupPlugin({ config, global }) {
    global.propertiesToFilter = config.properties.split(',')
}

function deletePropertyRecursively(properties, propertyToFilter) {
    const result = { ...properties }

    function recurse(obj, path = '') {
        // to include = return true, to remove = return false
        if (obj === null || obj === undefined) {
            return true
        }

        if (typeof obj === 'object') {
            for (const [key, value] of Object.entries(obj)) {
                const pathKey = path ? `${path}.${key}` : key
                if (pathKey === propertyToFilter) {
                    delete obj[key]
                } else {
                    if (!recurse(value, pathKey)) {
                        delete obj[key]
                    }
                }
            }
        } else if (path === propertyToFilter) {
            return false
        }

        return true
    }

    recurse(result, '')
}

async function processEvent(event, { global, storage }) {
    let propertiesCopy = event.properties ? { ...event.properties } : {}

    global.propertiesToFilter.forEach(async function (propertyToFilter) {
        if (propertyToFilter === '$ip') {
            delete event.ip
        }

        if (propertyToFilter.includes('.')) {
            deletePropertyRecursively(propertiesCopy, propertyToFilter)
        }

        if (propertyToFilter in propertiesCopy) {
            delete propertiesCopy[propertyToFilter]
        }
    })

    return { ...event, properties: propertiesCopy }
}

module.exports = {
    setupPlugin,
    processEvent,
}
