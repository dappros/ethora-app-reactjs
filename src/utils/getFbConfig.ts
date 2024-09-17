export function getFirebaseConfigFromString(input: string) {
    if (!input) return {}
    const objects = findObjectInString(input)
    const configString = findFirebaseConfig(objects)

    if (configString) {
        const configJson = preprocessInputKeysToJson(configString)
        const configObject = JSON.parse(configJson)
        return configObject
    }

    return ''
}

export function findObjectInString(input: string) {
    const regex = /{([^}]+)}/g
    const matches = [...input.matchAll(regex)]
    if (matches) {
        return matches.map((match) => match[0])
    }

    return []
}

function findFirebaseConfig(input: string[]) {
    return input.find((index) => {
        return index.includes("authDomain") || index.includes("apiKey")
    })
}

export function preprocessInputKeysToJson(input: string) {
    // Add double quotes around the keys
    // @ts-ignore
    return input.replaceAll(/([,{]\s*)(\w+)(\s*:)/g, '$1"$2"$3')
  }

