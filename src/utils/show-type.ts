export const showType = (type: string | undefined) => {
    if(type?.includes('episode')) {
        return 'episode'
    }

    if(type?.includes('series')) {
        return 'series'
    }

    return 'movie'
}