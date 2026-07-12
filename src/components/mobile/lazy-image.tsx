import { forwardRef, type ImgHTMLAttributes } from "react";

// Drop-in <img> replacement that defaults to native lazy loading, async
// decoding, and stable aspect via width/height. Use for any content image
// that isn't the LCP hero (which should preload instead).
export const LazyImage = forwardRef<HTMLImageElement, ImgHTMLAttributes<HTMLImageElement>>(
  function LazyImage({ loading = "lazy", decoding = "async", ...rest }, ref) {
    return <img ref={ref} loading={loading} decoding={decoding} {...rest} />;
  }
);