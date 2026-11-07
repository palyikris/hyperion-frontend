import axios from "axios";
import { useGetMedia } from "./useGetMedia";
import { useGetVideoMedia } from "./useGetVideoMedia";

export const useGetCombinedMedia = (id?: string) => {
  const image = useGetMedia(id);
  const imageNotFound = image.isError && axios.isAxiosError(image.error)
    && image.error.response?.status === 404;
  const video = useGetVideoMedia(id, { enabled: !!id && imageNotFound });
  const selected = imageNotFound ? video : image;

  return {
    data: selected.data,
    isPending: !!id && selected.isPending,
    isError: !id || selected.isError || (selected.isSuccess && !selected.data),
    isNotFound: selected.isError && axios.isAxiosError(selected.error)
      && selected.error.response?.status === 404,
    retry: () => selected.refetch(),
  };
};
