import { Editor, TLEventMapHandler, TLPageId, debounce } from "@tldraw/tldraw";
import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";

const VIEWPORT_QUERY_PARAM = "viewport";
const PAGE_QUERY_PARAM = "page";
const DEFAULT_VIEWPORT_STRING = "0,0,1";

export default function useViewport() {
  const [searchParams, setSearchParams] = useSearchParams();
  const updatedSearchParams = useMemo(
    () => new URLSearchParams(searchParams.toString()),
    [searchParams]
  );

  const setViewportDebounced = debounce((viewportString: string) => {
    updatedSearchParams.set(VIEWPORT_QUERY_PARAM, viewportString);
    setSearchParams(updatedSearchParams.toString());
  }, 300);

  const setPageDebounced = debounce((pageId: string) => {
    updatedSearchParams.set(PAGE_QUERY_PARAM, pageId);
    setSearchParams(updatedSearchParams.toString());
  }, 300);

  function handleViewportChange(editor: Editor) {
    // 1. Get query params on first launch
    const pageId = searchParams.get(PAGE_QUERY_PARAM) as TLPageId;
    const viewport =
      searchParams.get(VIEWPORT_QUERY_PARAM) || DEFAULT_VIEWPORT_STRING;

    const coord = viewport?.split(",");
    const x = Number(coord[0]);
    const y = Number(coord[1]);
    const z = Number(coord[2]);
    const viewportCoords = { x, y, z };

    // 2. Set editor current camera and page on first launch
    if (editor.pages.some((page) => page.id === pageId)) {
      pageId && editor.setCurrentPage(pageId);
    }

    viewportCoords && editor.setCamera(viewportCoords);

    // 3. Add editor change listener and query updater
    const handleChangeEvent: TLEventMapHandler<"change"> = (change) => {
      if (change.source === "user") {
        for (const [from, to] of Object.values(change.changes.updated)) {
          if (to.typeName === "camera") {
            setViewportDebounced(`${to.x},${to.y},${to.z}`);
          }
          if (
            from.typeName === "instance" &&
            to.typeName === "instance" &&
            from.currentPageId !== to.currentPageId
          ) {
            setPageDebounced(to.currentPageId);
            setViewportDebounced(
              `${editor.camera.x},${editor.camera.y},${editor.camera.z}`
            );
          }
        }
      }
    };

    editor.on("change", handleChangeEvent);
    return () => editor.off("change", handleChangeEvent);
  }

  return { handleViewportChange };
}
