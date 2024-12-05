export const getDateString = (date: string | undefined) => {
    if (!date) return '-'
    return new Date(date).toLocaleString()
}

export const getScoValue = (sco) => {
    return sco.value || sco.number || sco.iban_number || sco.name || sco.key
}

export const cleanData = (data: object) => {
    const result: Object = {}
    Object.keys(data).forEach(key => {
        if (data[key] !== "") {
            result[key] = data[key]
        }
    })
    return result
}