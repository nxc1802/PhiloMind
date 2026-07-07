import React from "react";
import { loadSettings } from "../../../../utils/settings";
import { VideoScene } from "../../adventure/components/AdventureCommon";
import { ComponentFrame } from "./ComponentFrame";
import { ContinueButton } from "./ContinueButton";
import { resolveBackendAssetUrl } from "../../../../services/api";

export function MediaComponent({ component, onComplete }) {
  const { config } = component;
  const mediaType = config.mediaType || "video";
  const { autoplayVideo } = loadSettings();
  const mediaUrl = resolveBackendAssetUrl(config.url);
  return (
    <ComponentFrame component={component}>
      {mediaType === "image" ? (
        <figure className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 dark:border-primary-850 dark:bg-primary-950/30">
          <img
            src={mediaUrl}
            alt={config.alt || config.title || component.title}
            className="max-h-[520px] w-full object-contain"
          />
          {(config.title || config.subtitle) && (
            <figcaption className="border-t border-slate-200 px-4 py-3 text-sm text-slate-600 dark:border-primary-850 dark:text-primary-200">
              {config.title && (
                <p className="font-bold text-slate-900 dark:text-primary-100">
                  {config.title}
                </p>
              )}
              {config.subtitle && <p>{config.subtitle}</p>}
            </figcaption>
          )}
        </figure>
      ) : (
        <VideoScene
          src={mediaUrl}
          badge={config.badge}
          title={config.title || component.title}
          subtitle={config.subtitle}
          autoPlay={autoplayVideo}
        />
      )}
      {config.description && (
        <p className="text-gray-700 dark:text-primary-150 leading-relaxed">
          {config.description}
        </p>
      )}
      <ContinueButton onComplete={onComplete} label="Tôi đã xem xong" />
    </ComponentFrame>
  );
}
