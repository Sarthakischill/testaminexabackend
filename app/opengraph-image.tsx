import { ImageResponse } from "next/og";
import { siteConfig } from "@/config/site";

export const runtime = "edge";
export const alt = `${siteConfig.name} — Buy Research Peptides Online | BPC-157, GHK-Cu, NAD+, GLP-3 | 99%+ Purity`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#050505",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Helvetica, Arial, sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "-200px",
            right: "-200px",
            width: "600px",
            height: "600px",
            background: "radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)",
            borderRadius: "50%",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-100px",
            left: "-100px",
            width: "400px",
            height: "400px",
            background: "radial-gradient(circle, rgba(6,182,212,0.06) 0%, transparent 70%)",
            borderRadius: "50%",
          }}
        />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "24px",
          }}
        >
          <div
            style={{
              fontSize: "72px",
              fontWeight: 400,
              color: "#ffffff",
              letterSpacing: "-0.02em",
              lineHeight: 1,
            }}
          >
            {siteConfig.name}
          </div>
          <div
            style={{
              fontSize: "14px",
              fontWeight: 600,
              color: "rgba(255,255,255,0.4)",
              letterSpacing: "0.25em",
              textTransform: "uppercase" as const,
            }}
          >
            {siteConfig.tagline}
          </div>
          <div
            style={{
              width: "80px",
              height: "1px",
              background: "rgba(255,255,255,0.15)",
              marginTop: "8px",
              marginBottom: "8px",
            }}
          />
          <div
            style={{
              fontSize: "20px",
              fontWeight: 300,
              color: "rgba(255,255,255,0.5)",
              maxWidth: "600px",
              textAlign: "center" as const,
              lineHeight: 1.6,
            }}
          >
            BPC-157 · GHK-Cu · NAD+ · GLP-3 · Epithalon · Peptide Pens
            99%+ HPLC Purity · Made in Germany · COA Included
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            bottom: "32px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "12px",
            fontWeight: 600,
            color: "rgba(255,255,255,0.25)",
            letterSpacing: "0.2em",
            textTransform: "uppercase" as const,
          }}
        >
          <div
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: "#3b82f6",
              boxShadow: "0 0 8px rgba(59,130,246,0.8)",
            }}
          />
          {`Research Peptides · Cold-Chain Shipped · ${siteConfig.url.replace(/^https?:\/\//, "")}`}
        </div>
      </div>
    ),
    { ...size }
  );
}
