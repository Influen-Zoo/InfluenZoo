import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import LiquidButton from "../components/common/LiquidButton/LiquidButton";
import "./Landing.css";
import logo from "../assets/influenzoo-logo.png";

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
    <div className="landing">
      <nav className={`landing-nav ${scrolled ? "scrolled" : ""}`}>
        <div className="landing-nav-inner">
          <div className="landing-brand-group">
            <div
              className="landing-logo landing-logo-compact"
              onClick={() => navigate("/")}
              style={{ cursor: "pointer" }}
            >
              <img
                src={logo}
                alt="influenZoo Logo"
                style={{ height: "40px", width: "auto", borderRadius: "50%" }}
              />
              <span>influenZoo</span>
            </div>
            <button
              className="theme-toggle"
              onClick={toggleTheme}
              aria-label="Toggle Theme"
            >
              {theme === "dark" ? "☀️" : "🌙"}
            </button>
          </div>

          <div className="landing-nav-links">
            <a href="#how-it-works">How It Works</a>
            <a href="#testimonials">Testimonials</a>
            <a href="#features">Features</a>
          </div>

          <div className="landing-nav-cta">
            <div className="landing-auth-buttons">
              <LiquidButton
                variant="secondary"
                size="small"
                onClick={() => navigate("/auth")}
              >
                Log in
              </LiquidButton>
              <LiquidButton
                variant="primary"
                size="small"
                onClick={() => navigate("/auth?mode=signup")}
              >
                Get Started
              </LiquidButton>
            </div>
          </div>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-orb hero-orb-1" />
        <div className="hero-orb hero-orb-2" />
        <div className="hero-content">
          <div className="hero-badge">
            <span className="dot" />
            <span>Trusted by 2,000+ brands and creators</span>
          </div>
          <h1>
            Where Brands Meet
            <br />
            <span className="gradient-text">Top Creators</span>
          </h1>
          <p>
            The premium platform connecting brands with authentic influencers.
            Launch campaigns, discover talent, and grow together.
          </p>
          <div className="hero-cta">
            <LiquidButton
              variant="primary"
              fullWidth
              onClick={() => navigate("/auth?mode=signup")}
            >
              Start Free Today
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ marginLeft: "8px" }}
              >
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </LiquidButton>
            <LiquidButton
              variant="secondary"
              fullWidth
              onClick={() =>
                document
                  .getElementById("how-it-works")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              See how it works →
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
              <div className="hero-stat-value">₹4.2Cr</div>
              <div className="hero-stat-label">Paid to Creators</div>
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="how-it-works">
        <div className="section-header">
          <div className="overline">Simple Process</div>
          <h2>How influenZoo Works</h2>
          <p>Get started in minutes whether you are a creator or a brand.</p>
        </div>
        <div className="steps-grid">
          {[
            {
              icon: "👤",
              num: "1",
              title: "Create Your Profile",
              desc: "Sign up as a brand or influencer and build your professional profile with your best work.",
            },
            {
              icon: "🔍",
              num: "2",
              title: "Discover and Connect",
              desc: "Brands post campaigns, creators discover opportunities that match their niche and audience.",
            },
            {
              icon: "🚀",
              num: "3",
              title: "Collaborate and Grow",
              desc: "Apply, get accepted, create content, and get paid. Build lasting partnerships.",
            },
          ].map((step) => (
            <div className="step-card" key={step.num}>
              <div className="step-number">{step.num}</div>
              <div className="step-icon">{step.icon}</div>
              <h3>{step.title}</h3>
              <p>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="features" className="features-section">
        <div className="section-header">
          <div className="overline">Why influenZoo</div>
          <h2>Built for Serious Collaboration</h2>
          <p>
            Every feature designed to make brand influencer partnerships
            effortless.
          </p>
        </div>
        <div className="features-grid">
          {[
            {
              icon: "🎯",
              title: "Smart Matching",
              desc: "AI-powered recommendations match brands with the perfect creators for their niche.",
            },
            {
              icon: "💰",
              title: "Secure Payments",
              desc: "Escrow-protected payments ensure creators get paid and brands get quality content.",
            },
            {
              icon: "📊",
              title: "Real Analytics",
              desc: "Track campaign performance with detailed engagement and ROI metrics.",
            },
            {
              icon: "🛡️",
              title: "Verified Profiles",
              desc: "Every account is verified to ensure trust and authenticity on the platform.",
            },
            {
              icon: "💬",
              title: "In-App Messaging",
              desc: "Direct messaging between brands and creators for seamless communication.",
            },
            {
              icon: "⚡",
              title: "Fast Approvals",
              desc: "Streamlined application process gets campaigns running in hours, not weeks.",
            },
          ].map((feat, i) => (
            <div className="feature-card" key={i}>
              <div className="feature-icon">{feat.icon}</div>
              <h4>{feat.title}</h4>
              <p>{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="testimonials" className="testimonials">
        <div className="section-header">
          <div className="overline">Testimonials</div>
          <h2>Loved by Creators and Brands</h2>
          <p>See what our community has to say about influenZoo.</p>
        </div>
        <div className="testimonial-grid">
          {[
            {
              text: "influenZoo helped me land my first paid brand deal within a week. The platform is intuitive and the brand quality is top notch.",
              name: "Priya Sharma",
              role: "Lifestyle Creator · 125K followers",
              stars: 5,
            },
            {
              text: "We found the perfect micro influencers for our product launch. The ROI was 3x compared to traditional advertising.",
              name: "NovaSkin Cosmetics",
              role: "Beauty Brand",
              stars: 5,
            },
            {
              text: "The analytics dashboard gives me everything I need to track campaign performance. Best platform for influencer marketing in India.",
              name: "Arjun Mehta",
              role: "Tech Creator · 89K followers",
              stars: 5,
            },
          ].map((t, i) => (
            <div className="testimonial-card" key={i}>
              <div className="testimonial-stars">{"★".repeat(t.stars)}</div>
              <p className="testimonial-text">"{t.text}"</p>
              <div className="testimonial-author">
                <div className="avatar">{t.name[0]}</div>
                <div className="testimonial-author-info">
                  <h4>{t.name}</h4>
                  <span>{t.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="cta-section">
        <div className="cta-content">
          <h2>Ready to Grow?</h2>
          <p>
            Join thousands of brands and creators already collaborating on
            influenZoo.
          </p>
          <LiquidButton
            variant="primary"
            onClick={() => navigate("/auth?mode=signup")}
          >
            Create Free Account
          </LiquidButton>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="footer-grid">
          <div className="footer-brand">
            <div
              className="landing-logo"
              style={{ color: "rgba(255,255,255,0.8)" }}
            >
              <img
                src={logo}
                alt="influenZoo Logo"
                style={{ height: "32px", width: "auto", borderRadius: "50%" }}
              />
              <span>influenZoo</span>
            </div>
            <p>The premium platform for brand influencer collaborations.</p>
          </div>
          <div className="footer-col">
            <h4>Product</h4>
            <a href="#">For Brands</a>
            <a href="#">For Creators</a>
            <a href="#">Pricing</a>
            <a href="#">Features</a>
          </div>
          <div className="footer-col">
            <h4>Company</h4>
            <a href="#">About Us</a>
            <a href="#">Blog</a>
            <a href="#">Careers</a>
            <a href="#">Contact</a>
          </div>
          <div className="footer-col">
            <h4>Legal</h4>
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Cookie Policy</a>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2024 influenZoo. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
