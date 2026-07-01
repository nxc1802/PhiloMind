import React from "react";

export function MindmapLayout({ layout = "grid", children, columns = 2 }) {
  if (layout === "vertical") {
    return <div className="flex flex-col gap-4">{children}</div>;
  }
  
  if (layout === "horizontal") {
    return <div className="flex flex-row flex-wrap gap-4">{children}</div>;
  }
  
  // Default matrix/grid layout
  return (
    <div 
      className="grid gap-4" 
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
    >
      {children}
    </div>
  );
}
