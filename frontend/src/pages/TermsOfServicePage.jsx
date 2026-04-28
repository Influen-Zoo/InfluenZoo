import React from "react";
import TermsOfService from "../components/common/TermsOfService";

export default function TermsOfServicePage() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--secondary)", color: "var(--text-primary)", padding: "2rem" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        <TermsOfService onClose={() => window.close()} />
      </div>
    </div>
  );
}
