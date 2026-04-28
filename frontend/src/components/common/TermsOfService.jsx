import React from "react";

export default function TermsOfService({ onClose }) {
  return (
    <section id="terms-of-service" className="privacy-policy-panel">
      <div className="privacy-policy-header">
        <div>
          <div className="overline">Legal</div>
          <h2>Terms of Service - InfluenZoo</h2>
          <p><strong>Effective Date:</strong> 1st April 2026</p>
        </div>
        <button type="button" className="privacy-close" onClick={onClose}>Close</button>
      </div>

      <p>Welcome to InfluenZoo ("Platform", "we", "our", "us"). These Terms of Service ("Terms") govern your access to and use of the InfluenZoo platform, including all services, features, and content.</p>
      <p>By using InfluenZoo, you agree to be bound by these Terms.</p>

      <h3>1. Eligibility</h3>
      <ul>
        <li>You must be at least <strong>18 years old</strong> to use the platform</li>
        <li>By registering, you confirm that all information provided is accurate and complete</li>
      </ul>

      <h3>2. Platform Overview</h3>
      <p>InfluenZoo is a digital marketplace where:</p>
      <ul>
        <li>Brands can post collaboration campaigns</li>
        <li>Influencers can apply or be directly selected</li>
        <li>Users can interact via social features such as posts, likes, comments, and follows</li>
        <li>AI tools assist with content creation</li>
        <li>Wallet-based transactions enable platform usage</li>
      </ul>

      <h3>3. User Accounts</h3>
      <ul>
        <li>Users are responsible for maintaining account confidentiality</li>
        <li>You agree not to impersonate others or provide false information</li>
        <li>We reserve the right to suspend or terminate accounts for violations</li>
      </ul>

      <h3>4. Wallet & Payments</h3>
      <ul>
        <li>Users must recharge wallet coins to access certain features</li>
        <li>Coins may be used for posting campaigns by brands and applying to campaigns by influencers</li>
      </ul>
      <h4>Payment Rules</h4>
      <ul>
        <li>Influencers receive payment after successful campaign completion</li>
        <li>InfluenZoo charges a <strong>10% platform fee</strong> on collaborations</li>
        <li>Application fees may apply</li>
      </ul>
      <h4>Refund Policy</h4>
      <ul>
        <li>If an influencer is <strong>not selected</strong>, the application fee is refunded</li>
        <li>Wallet balances are non-transferable and may be non-withdrawable unless stated otherwise</li>
      </ul>

      <h3>5. Campaign Terms</h3>
      <h4>For Brands</h4>
      <ul>
        <li>Must clearly define campaign requirements, budget, and timelines</li>
        <li>Must release payment upon satisfactory completion</li>
      </ul>
      <h4>For Influencers</h4>
      <ul>
        <li>Must deliver agreed content within the specified timeline</li>
        <li>Must adhere to brand guidelines and platform policies</li>
      </ul>
      <h4>Platform Role</h4>
      <ul>
        <li>InfluenZoo acts as an intermediary</li>
        <li>We may assist in dispute resolution but are not liable for user actions</li>
      </ul>

      <h3>6. Combo Collaborations</h3>
      <ul>
        <li>Multi-brand campaigns may include paid or barter collaborations</li>
        <li>Influencers must fulfill deliverables for all participating brands</li>
        <li>Compensation may include monetary payment, products, services, or experiences</li>
      </ul>

      <h3>7. Coordinator / Moderator Role</h3>
      <ul>
        <li>Coordinators may manage influencers and campaigns</li>
        <li>They may earn referral income and commissions</li>
        <li>InfluenZoo reserves the right to approve or remove coordinators</li>
      </ul>

      <h3>8. User Conduct</h3>
      <p>You agree not to:</p>
      <ul>
        <li>Post false, misleading, or harmful content</li>
        <li>Violate intellectual property rights</li>
        <li>Engage in fraud, spam, or abusive behavior</li>
        <li>Circumvent platform payments or agreements</li>
      </ul>
      <p>Violation may result in account suspension or termination.</p>

      <h3>9. Content Ownership</h3>
      <ul>
        <li>Users retain ownership of their content</li>
        <li>By posting, you grant InfluenZoo a <strong>non-exclusive license</strong> to use, display, and promote content on the platform</li>
      </ul>

      <h3>10. AI Tools Disclaimer</h3>
      <ul>
        <li>AI-generated content is for assistance only</li>
        <li>Users are responsible for reviewing and ensuring accuracy and compliance</li>
      </ul>

      <h3>11. Brand Safety & Responsibility</h3>
      <p>InfluenZoo provides tools for secure transactions and monitoring. However, we do not guarantee campaign outcomes, engagement metrics, or business results.</p>

      <h3>12. Limitation of Liability</h3>
      <p>To the maximum extent permitted by law, InfluenZoo is not liable for user disputes, loss of revenue or business, content performance, or campaign results.</p>

      <h3>13. Termination</h3>
      <ul>
        <li>We reserve the right to suspend or terminate accounts at our discretion</li>
        <li>We may remove content or campaigns that violate policies</li>
      </ul>

      <h3>14. Changes to Terms</h3>
      <p>We may update these Terms at any time. Continued use of the platform constitutes acceptance of updated Terms.</p>

      <h3>15. Governing Law</h3>
      <p>These Terms shall be governed by and interpreted in accordance with the laws of <strong>India</strong>.</p>

      <h3>16. Contact Information</h3>
      <p>Email: <a href="mailto:ask@influenzoo.com">ask@influenzoo.com</a><br />Address: 27 G G Road, Kol-46</p>
      <p><strong>By using InfluenZoo, you agree to these Terms of Service.</strong></p>
    </section>
  );
}
