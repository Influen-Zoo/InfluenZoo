import React from "react";

export default function PrivacyPolicy({ onClose }) {
  return (
    <section id="privacy-policy" className="privacy-policy-panel">
      <div className="privacy-policy-header">
        <div>
          <div className="overline">Legal</div>
          <h2>Privacy Policy - InfluenZoo</h2>
          <p><strong>Effective Date:</strong> 1st April 2026</p>
        </div>
        <button type="button" className="privacy-close" onClick={onClose}>Close</button>
      </div>

      <p>InfluenZoo ("we", "our", "us") operates a digital platform connecting brands and influencers for collaboration opportunities. This Privacy Policy explains how we collect, use, disclose, and protect your information when you use our platform.</p>
      <p>By accessing or using InfluenZoo, you agree to this Privacy Policy.</p>

      <h3>1. Information We Collect</h3>
      <h4>Personal Information</h4>
      <ul>
        <li>Name, email address, phone number</li>
        <li>Profile details such as bio, social media handles, and portfolio content</li>
        <li>Business information for brands</li>
        <li>Payment and wallet-related information</li>
      </ul>
      <h4>Usage Data</h4>
      <ul>
        <li>IP address, device type, browser</li>
        <li>Pages visited, time spent, interactions</li>
        <li>Campaign activity and application behavior</li>
      </ul>
      <h4>Content Data</h4>
      <ul>
        <li>Posts, comments, likes, messages</li>
        <li>Campaign submissions and deliverables</li>
      </ul>

      <h3>2. How We Use Your Information</h3>
      <ul>
        <li>Provide and operate the platform</li>
        <li>Match brands with influencers</li>
        <li>Process transactions and manage wallet balances</li>
        <li>Enable communication between users</li>
        <li>Improve user experience and platform features</li>
        <li>Provide AI-powered tools for bios, scripts, and content suggestions</li>
        <li>Detect fraud, abuse, or policy violations</li>
      </ul>

      <h3>3. Wallet & Payment Information</h3>
      <ul>
        <li>Users must recharge wallet coins to access certain features</li>
        <li>Payments are processed securely through third-party providers</li>
        <li>We do not store sensitive payment details like card numbers</li>
        <li>Transaction history is maintained for operational and legal purposes</li>
      </ul>

      <h3>4. Sharing of Information</h3>
      <ul>
        <li>Between brands and influencers for collaboration purposes</li>
        <li>With service providers such as payment processors and hosting services</li>
        <li>With moderators or coordinators for campaign management</li>
        <li>When required by law or to protect platform integrity</li>
      </ul>
      <p>We do <strong>not sell personal data</strong> to third parties.</p>

      <h3>5. AI Features</h3>
      <p>InfluenZoo provides AI tools to assist users in writing bios, creating scripts, and generating campaign content. User inputs may be processed to generate outputs, but we do not use sensitive personal data for AI training without consent.</p>

      <h3>6. Data Security</h3>
      <p>We implement appropriate security measures to protect your data, including encryption, secure servers, access control, monitoring, and regular system updates. However, no system is completely secure, and we cannot guarantee absolute security.</p>

      <h3>7. Data Retention</h3>
      <ul>
        <li>We retain user data as long as the account is active</li>
        <li>Transaction and financial data may be retained for legal compliance</li>
        <li>Users may request deletion of their data, subject to legal obligations</li>
      </ul>

      <h3>8. User Rights</h3>
      <ul>
        <li>Access your data</li>
        <li>Update or correct information</li>
        <li>Delete your account</li>
        <li>Withdraw consent where applicable</li>
      </ul>
      <p>Requests can be made via ask@influenzoo.com.</p>

      <h3>9. Cookies & Tracking</h3>
      <p>We use cookies to improve platform performance, analyze usage, and personalize user experience. Users can control cookies through browser settings.</p>

      <h3>10. Children's Privacy</h3>
      <p>InfluenZoo is not intended for users under the age of 18. We do not knowingly collect data from minors.</p>

      <h3>11. Third-Party Links</h3>
      <p>Our platform may contain links to third-party websites. We are not responsible for their privacy practices.</p>

      <h3>12. Updates to This Policy</h3>
      <p>We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated effective date.</p>

      <h3>13. Contact Us</h3>
      <p>Email: ask@influenzoo.com<br />Address: 27 G G Road Kol-46</p>
      <p><strong>By using InfluenZoo, you agree to this Privacy Policy.</strong></p>
    </section>
  );
}
