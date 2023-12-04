import { useYjsStore } from "../../../useYjsStore";
import { Tldraw, track, useEditor } from "@tldraw/tldraw";
import "@tldraw/tldraw/tldraw.css";

import style from "./YjsEditor.module.css";
import { useNavigate } from "react-router-dom";
import { Button, Grid } from "@mui/material";

import ViewportDetection from "../../features/ViewportDetection";
import useViewport from "../../features/useViewport";

const HOST_URL = import.meta.env.VITE_Y_WEBSOCKET_SERVER

interface YjsEditorProps {
  roomId: string;
}

export default function YjsEditor({ roomId }: YjsEditorProps) {

  const { pageId, viewportCoords } = useViewport()

  const store = useYjsStore({
    roomId,
    hostUrl: HOST_URL,
  });

  console.log(pageId, viewportCoords)

  return (
    <div className={style.tldraw__editor}>
      <Tldraw
        autoFocus
        store={store}
        shareZone={
          <Grid
            container
            spacing={1}
            direction="column"
            alignItems="end"
            justifyContent="end"
          >
            <Grid item>
              <NameEditor />
            </Grid>
            <Grid item>
              <ReturnToHomePageButton />
            </Grid>
          </Grid>
        }
        onMount={(editor) => {
          if (pageId) {
            editor.setCurrentPage(pageId)
          }

          if (viewportCoords) {
            editor.setCamera(viewportCoords)
          }
        }}
      >
        <ViewportDetection />
      </Tldraw>
    </div>
  );

}


const NameEditor = track(() => {
  const editor = useEditor();

  const { color, name } = editor.user;

  return (
    <div style={{ pointerEvents: "all", display: "flex" }}>
      <input
        type="color"
        value={color}
        onChange={(e) => {
          editor.user.updateUserPreferences({
            color: e.currentTarget.value,
          });
        }}
      />
      <input
        value={name}
        onChange={(e) => {
          editor.user.updateUserPreferences({
            name: e.currentTarget.value,
          });
        }}
      />
    </div>
  );
});

const ReturnToHomePageButton = () => {
  const navigate = useNavigate();
  return (
    <Button
      sx={{ pointerEvents: "all", display: "flex" }}
      variant="contained"
      size="small"
      onClick={() => navigate("/")}
    >
      To Home Page
    </Button>
  );
};
