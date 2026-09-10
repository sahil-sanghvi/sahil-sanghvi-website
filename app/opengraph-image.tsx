import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 80,
          backgroundColor: "#141312",
          color: "#EFEAE4",
          fontFamily: "monospace",
        }}
      >
        <div style={{ display: "flex", color: "#9A9086", fontSize: 24, letterSpacing: 2 }}>
          SAHIL-SANGHVI(1)
        </div>
        <div style={{ display: "flex", fontSize: 56, fontWeight: 700, marginTop: 24, lineHeight: 1.2 }}>
          I build the whole thing —
        </div>
        <div style={{ display: "flex", fontSize: 56, fontWeight: 700, lineHeight: 1.2 }}>
          the product, and the pipeline
        </div>
        <div style={{ display: "flex", fontSize: 56, fontWeight: 700, lineHeight: 1.2 }}>
          that keeps it running without me.
        </div>
        <div style={{ display: "flex", color: "#D98E36", fontSize: 24, marginTop: 40 }}>
          $ man sahil-sanghvi
        </div>
      </div>
    ),
    { ...size }
  );
}
