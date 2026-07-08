import React from "react";
import { resolveBackendAssetUrl } from "../../../../services/api";

function cssSize(value) {
  if (value === undefined || value === null || value === "") return undefined;
  if (typeof value === "number" && Number.isFinite(value)) return `${value}px`;
  if (typeof value === "string") return value.trim() || undefined;
  return undefined;
}

function pickImageLayout(value, key) {
  return (
    value?.[key] ??
    value?.size?.[key] ??
    value?.display?.[key] ??
    value?.layout?.[key]
  );
}

function imageLayoutStyle(asset) {
  const style = {
    width: cssSize(asset.width),
    height: cssSize(asset.height),
    minWidth: cssSize(asset.minWidth),
    minHeight: cssSize(asset.minHeight),
    maxWidth: cssSize(asset.maxWidth),
    maxHeight: cssSize(asset.maxHeight),
    aspectRatio: asset.aspectRatio || undefined,
    borderRadius: cssSize(asset.radius || asset.borderRadius),
  };

  if (asset.align === "center") {
    style.marginLeft = "auto";
    style.marginRight = "auto";
  } else if (asset.align === "right") {
    style.marginLeft = "auto";
  } else if (asset.align === "left") {
    style.marginRight = "auto";
  }

  return Object.fromEntries(
    Object.entries(style).filter(([, value]) => value !== undefined),
  );
}

export function getImageAsset(value, fallbackAlt = "") {
  if (!value) return null;
  if (typeof value === "string") {
    return { url: resolveBackendAssetUrl(value), alt: fallbackAlt };
  }
  if (typeof value !== "object") return null;

  const nested = value.image || value.media || value.asset;
  const url =
    value.url ||
    value.src ||
    value.imageUrl ||
    value.href ||
    (typeof nested === "string" ? nested : nested?.url || nested?.src);

  if (!url) return null;

  return {
    url: resolveBackendAssetUrl(url),
    alt: value.alt || value.title || value.caption || fallbackAlt,
    caption: value.caption || value.subtitle || "",
    title: value.title || "",
    fit: value.fit || "cover",
    position: value.position || value.objectPosition || "center",
    aspectRatio:
      pickImageLayout(value, "aspectRatio") ||
      pickImageLayout(value, "ratio") ||
      "",
    width: pickImageLayout(value, "width"),
    height: pickImageLayout(value, "height"),
    minWidth: pickImageLayout(value, "minWidth"),
    minHeight: pickImageLayout(value, "minHeight"),
    maxWidth: pickImageLayout(value, "maxWidth"),
    maxHeight: pickImageLayout(value, "maxHeight"),
    radius: pickImageLayout(value, "radius"),
    borderRadius: pickImageLayout(value, "borderRadius"),
    align: pickImageLayout(value, "align"),
  };
}

export function firstImageAsset(candidates = [], fallbackAlt = "") {
  for (const candidate of candidates) {
    const asset = getImageAsset(candidate, fallbackAlt);
    if (asset) return asset;
  }
  return null;
}

export function ComponentImage({
  image,
  alt = "",
  className = "",
  imageClassName = "",
  fit = "cover",
  caption = true,
  style,
}) {
  const asset = getImageAsset(image, alt);
  if (!asset) return null;

  const objectFit = asset.fit || fit;
  const src = resolveBackendAssetUrl(asset.url);
  const figureStyle = {
    ...imageLayoutStyle(asset),
    ...style,
  };
  const imageStyle = {
    objectFit,
    objectPosition: asset.position,
  };

  return (
    <figure
      className={`overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 dark:border-primary-850 dark:bg-primary-950/25 ${className}`}
      style={figureStyle}
    >
      <img
        src={src}
        alt={asset.alt || alt}
        className={`block h-full w-full ${imageClassName}`}
        style={imageStyle}
        loading="lazy"
      />
      {caption && asset.caption && (
        <figcaption className="border-t border-slate-200 px-3 py-2 text-xs font-medium leading-5 text-slate-600 dark:border-primary-850 dark:text-primary-200">
          {asset.caption}
        </figcaption>
      )}
    </figure>
  );
}

export function ComponentMediaBlock({ component, className = "" }) {
  const config = component?.config || {};
  const media = component?.media || {};
  const image = firstImageAsset(
    [
      media.componentImage,
      media.image,
      config.componentImage,
      config.heroImage,
    ],
    component?.title || "Hình ảnh minh họa",
  );

  if (!image) return null;

  return (
    <ComponentImage
      image={image}
      alt={component?.title || "Hình ảnh minh họa"}
      fit="contain"
      className={`mb-4 max-h-72 ${className}`}
      imageClassName="max-h-72"
    />
  );
}
