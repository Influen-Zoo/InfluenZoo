import React from "react";
import PrivacyPolicy from "../components/common/PrivacyPolicy";

export default function PrivacyPolicyPage() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--secondary)", color: "var(--text-primary)", padding: "2rem" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        <PrivacyPolicy onClose={() => window.close()} />
      </div>
    </div>
  );
}
