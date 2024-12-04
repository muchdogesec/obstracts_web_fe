export const getDateString = (date: string | undefined) => {
    if(!date) return '-'
    return new Date(date).toLocaleString()
}

export const getScoValue = (sco) => {
    return sco.value || sco.number || sco.iban_number || sco.name || sco.key
}
