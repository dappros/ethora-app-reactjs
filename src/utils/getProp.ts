export function getProp(obje: any, path: string): any {
    let obj = JSON.parse(JSON.stringify(obje))
    let pathSplit = path.split('.')

    let index = 0
    let length = path.length;

    while (index < length) {
        obj = obj[pathSplit[index++]];
    }

    return obj
}