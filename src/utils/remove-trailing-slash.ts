export const removeTrailingSlash = (url: string | undefined) => {
    return url?.replace(/\/$/, '');
}
