import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import LiquidButton from "../components/common/LiquidButton/LiquidButton";
import logo from "../assets/influenzoo-logo.png";
import heroImage from "../assets/hero.png";
import "./Landing.css";

const steps = [
  {
    num: "01",
    title: "Create Your Profile",
    desc: "Sign up as a brand or influencer and build a profile with your best work, social proof, and collaboration goals.",
  },
  {
    num: "02",
    title: "Discover and Connect",
    desc: "Brands post campaigns while creators find opportunities that match their niche, audience, and content style.",
  },
  {
    num: "03",
    title: "Collaborate and Grow",
    desc: "Apply, chat, deliver content, manage wallet coins, and build long-term partnerships from one place.",
  },
];

const features = [
  { icon: "Match", title: "Smart Matching", desc: "Find brand and creator fits faster with profile, niche, and campaign signals." },
  { icon: "Pay", title: "Secure Payments", desc: "Wallet coins and payment workflows keep campaign access and payouts organized." },
  { icon: "Data", title: "Real Analytics", desc: "Track engagement, campaign performance, posts, and platform activity." },
  { icon: "Trust", title: "Verified Profiles", desc: "Admin moderation and profile tools help maintain platform quality." },
  { icon: "Chat", title: "In-App Messaging", desc: "Brands and creators can coordinate campaign details without leaving the app." },
  { icon: "AI", title: "AI Assistance", desc: "Use AI-powered helpers for bios, scripts, content ideas, and campaign communication." },
];

const testimonials = [
  {
    text: "InfluenZoo helped me land my first paid brand deal within a week. The workflow is clear and the brand quality is strong.",
    name: "Priya Sharma",
    role: "Lifestyle Creator - 125K followers",
  },
  {
    text: "We found the right micro creators for our product launch and tracked the campaign from one dashboard.",
    name: "NovaSkin Cosmetics",
    role: "Beauty Brand",
  },
  {
    text: "The analytics and wallet flow make influencer collaborations easier to manage than spreadsheets and DMs.",
    name: "Arjun Mehta",
    role: "Tech Creator - 89K followers",
  },
];

export default function Landing() {
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="landing" data-theme={theme}>
      <nav className={`landing-nav ${scrolled ? "scrolled" : ""}`}>
        <div className="landing-nav-inner">
          <button className="landing-logo landing-logo-compact" onClick={() => navigate("/")}>
            <span className="landing-logo-mark">
              <img src={logo} alt="influenZoo Logo" />
            </span>
            <span>influenZoo</span>
          </button>

          <div className="landing-nav-links">
            <a href="#how-it-works">How It Works</a>
            <a href="#features">Features</a>
            <a href="#testimonials">Testimonials</a>
          </div>

          <div className="landing-auth-buttons">
            <button
              className="theme-toggle"
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
              title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            >
              {theme === "dark" ? <Sun size={18} strokeWidth={2.4} /> : <Moon size={18} strokeWidth={2.4} />}
            </button>
            <LiquidButton variant="primary" size="small" onClick={() => navigate("/auth")}>
              Log in
            </LiquidButton>
            <LiquidButton variant="primary" size="small" onClick={() => navigate("/auth?mode=signup")}>
              Get Started
            </LiquidButton>
          </div>
        </div>
      </nav>

      <section
        className="hero"
        style={{ backgroundImage: `linear-gradient(180deg, rgba(4, 12, 22, 0.58), rgba(4, 12, 22, 0.9)), url(${heroImage})` }}
      >
        <div className="hero-content">
          <div className="hero-badge">
            <span className="dot" />
            <span>Trusted by brands and creators across India</span>
          </div>
          <h1>
            Where Brands Meet
            <br />
            <span className="gradient-text">Top Creators</span>
          </h1>
          <p>
            Launch campaigns, discover talent, manage wallet coins, track engagement, and build creator partnerships from a focused collaboration platform.
          </p>
          <div className="hero-cta">
            <LiquidButton variant="primary" onClick={() => navigate("/auth?mode=signup")}>
              Start Free Today
            </LiquidButton>
            <LiquidButton
              variant="secondary"
              onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}
            >
              See how it works
            </LiquidButton>
          </div>
          <div className="hero-stats">
            <div className="hero-stat">
              <div className="hero-stat-value">2,500+</div>
              <div className="hero-stat-label">Active Creators</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-value">800+</div>
              <div className="hero-stat-label">Brands</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-value">INR 4.2Cr</div>
              <div className="hero-stat-label">Creator Payouts</div>
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="how-it-works">
        <div className="section-header">
          <div className="overline">Simple Process</div>
          <h2>How InfluenZoo Works</h2>
          <p>Get started in minutes whether you are building campaigns or applying to them.</p>
        </div>
        <div className="steps-grid">
          {steps.map((step) => (
            <div className="step-card" key={step.num}>
              <div className="step-number">{step.num}</div>
              <h3>{step.title}</h3>
              <p>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="features" className="features-section">
        <div className="section-header">
          <div className="overline">Why InfluenZoo</div>
          <h2>Built for Serious Collaboration</h2>
          <p>Every feature is designed to make brand-influencer partnerships easier to run and measure.</p>
        </div>
        <div className="features-grid">
          {features.map((feature) => (
            <div className="feature-card" key={feature.title}>
              <div className="feature-icon">{feature.icon}</div>
              <h4>{feature.title}</h4>
              <p>{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="testimonials" className="testimonials">
        <div className="section-header">
          <div className="overline">Testimonials</div>
          <h2>Loved by Creators and Brands</h2>
          <p>Real workflows for creator discovery, campaign execution, and performance tracking.</p>
        </div>
        <div className="testimonial-grid">
          {testimonials.map((testimonial) => (
            <div className="testimonial-card" key={testimonial.name}>
              <div className="testimonial-stars">*****</div>
              <p className="testimonial-text">"{testimonial.text}"</p>
              <div className="testimonial-author">
                <div className="avatar">{testimonial.name[0]}</div>
                <div className="testimonial-author-info">
                  <h4>{testimonial.name}</h4>
                  <span>{testimonial.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="cta-section">
        <div className="cta-content">
          <h2>Ready to Grow?</h2>
          <p>Join brands and creators already managing collaborations on InfluenZoo.</p>
          <LiquidButton variant="primary" onClick={() => navigate("/auth?mode=signup")}>
            Create Free Account
          </LiquidButton>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="landing-logo footer-logo">
              <span className="landing-logo-mark">
                <img src={logo} alt="influenZoo Logo" />
              </span>
              <span>influenZoo</span>
            </div>
            <p>The focused platform for brand-influencer collaborations.</p>
          </div>
          <div className="footer-col">
            <h4>Product</h4>
            <a href="#how-it-works">How It Works</a>
            <a href="#features">Features</a>
            <a href="/auth?mode=signup">For Brands</a>
            <a href="/auth?mode=signup">For Creators</a>
          </div>
          <div className="footer-col">
            <h4>Company</h4>
            <a href="mailto:ask@influenzoo.com">Contact</a>
            <a href="#testimonials">Testimonials</a>
          </div>
          <div className="footer-col">
            <h4>Legal</h4>
            <a href="/privacy-policy" target="_blank" rel="noopener noreferrer" className="footer-link-button">
              Privacy Policy
            </a>
            <a href="/terms-of-service" target="_blank" rel="noopener noreferrer" className="footer-link-button">
              Terms of Service
            </a>
          </div>
        </div>

        <div className="footer-bottom">
          <p>(c) 2026 influenZoo. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
