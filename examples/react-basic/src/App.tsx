import { useEffect, useRef } from "react";
import { MapSpriteEditor } from "../../../src";

export default function App() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) {
      return undefined;
    }

    const editor = new MapSpriteEditor({
      container: containerRef.current,
    });

    return () => editor.destroy();
  }, []);

  return <div className="example-shell" ref={containerRef} />;
}
