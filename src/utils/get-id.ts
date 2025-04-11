import { removeTrailingSlash } from "./remove-trailing-slash";

export const getID = (url: string | undefined) => {
   const editedUrl = removeTrailingSlash(url);
   return editedUrl?.split('/').pop() || null;
}