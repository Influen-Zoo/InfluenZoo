import React, { useEffect, useState, Fragment } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Briefcase,
  Camera,
  CheckCircle,
  MessageCircle,
  Moon,
  Search,
  Shield,
  Sparkles,
  Sun,
  TrendingUp,
  Zap,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import LiquidButton from "../components/common/LiquidButton/LiquidButton";
import api from "../services/api";
import { resolveAssetUrl } from "../utils/helpers";
import logo from "../assets/influenzoo-logo.png";
import heroImage from "../assets/hero-marketplace.png";
import heroMobileImage from "../assets/hero-marketplace-mobile.jpg";
import showcaseCafe from "../assets/showcase-cafe-realistic.jpg";
import showcaseMobile from "../assets/showcase-mobile-hero-marketplace.jpg";
import showcaseSkincare from "../assets/showcase-skincare-realistic.jpg";
import showcaseTech from "../assets/showcase-tech-realistic.jpg";
import showcaseTravel from "../assets/showcase-travel-realistic.jpg";
import "./Landing.css";

const flowSteps = [
  {
    icon: Camera,
    label: "Creator Posts",
    title: "Influencers showcase content",
    desc: "Creators build their profile with posts, portfolio work, audience proof, and niche signals.",
  },
  {
    icon: Briefcase,
    label: "Campaign Live",
    title: "Brands publish campaigns",
    desc: "Brands define budgets, platforms, deliverables, campaign timelines, and eligibility.",
  },
  {
    icon: Zap,
    label: "Applications",
    title: "Influencers apply",
    desc: "Qualified creators apply with context, pricing, and content ideas for each opportunity.",
  },
  {
    icon: CheckCircle,
    label: "Selection",
    title: "Brands select and collaborate",
    desc: "Teams review creator fit, approve applications, coordinate work, and measure outcomes.",
  },
];

const features = [
  {
    icon: Briefcase,
    title: "Campaign Management",
    desc: "Create, price, publish, review, and manage campaign applications from a single workflow.",
  },
  {
    icon: Search,
    title: "Influencer Discovery",
    desc: "Find creators by niche, content style, audience size, social footprint, and platform fit.",
  },
  {
    icon: TrendingUp,
    title: "Performance Tracking",
    desc: "Track posts, engagement, clicks, wallet activity, and campaign momentum through analytics.",
  },
  {
    icon: MessageCircle,
    title: "Collaboration Tools",
    desc: "Keep brand and creator coordination moving with messaging, approvals, and profile context.",
  },
];

const showcaseItems = [
  {
    type: "Creator Post",
    title: "Travel reel concept for boutique stays",
    meta: "42K reach - 8.4% engagement",
    tag: "Influencer",
    image: showcaseTravel,
  },
  {
    type: "Brand Campaign",
    title: "Skincare launch with micro-creators",
    meta: "INR 75K budget - 18 applicants",
    tag: "Campaign",
    image: showcaseSkincare,
  },
  {
    type: "Creator Post",
    title: "Tech unboxing with conversion CTA",
    meta: "91K reach - 312 saves",
    tag: "Content",
    image: showcaseTech,
  },
  {
    type: "Brand Campaign",
    title: "Cafe opening weekend creator drive",
    meta: "Barter + paid - 9 shortlisted",
    tag: "Collab",
    image: showcaseCafe,
  },
];

const proofStats = [
  { value: "2,500+", label: "Active creators" },
  { value: "800+", label: "Brands onboarded" },
  { value: "4.2Cr", label: "Creator payouts" },
  { value: "12K+", label: "Campaign actions" },
];

const testimonials = [
  {
    text: "InfluenZoo helped me move from scattered DMs to a real creator workflow. I can show proof, apply faster, and track every opportunity.",
    name: "Priya Sharma",
    role: "Lifestyle Creator",
  },
  {
    text: "We launched with creators in three niches and reviewed every application from one place. It feels built for campaign teams.",
    name: "NovaSkin Cosmetics",
    role: "Beauty Brand",
  },
  {
    text: "The platform makes collaborations feel structured without slowing down the creator side. The wallet and analytics flow is clear.",
    name: "Arjun Mehta",
    role: "Tech Creator",
  },
];

export default function Landing() {
  const [scrolled, setScrolled] = useState(false);
  const [brandLogos, setBrandLogos] = useState([]);
  const [activeBrandLogo, setActiveBrandLogo] = useState(null);
  const [scrollSpeed, setScrollSpeed] = useState(18);
  const [spacing, setSpacing] = useState(40);
  const [showSeparator, setShowSeparator] = useState(false);
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const elements = document.querySelectorAll(".landing-reveal");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("is-visible");
        });
      },
      { threshold: 0.14 }
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let mounted = true;
    api.getBrandLogos()
      .then((logos) => {
        if (mounted) setBrandLogos(logos);
      })
      .catch(() => {
        if (mounted) setBrandLogos([]);
      });

    api.getBrandLogoSettings()
      .then(settings => {
        console.log('Landing Page Settings:', settings);
        if (mounted) {
          setScrollSpeed(settings.scrollSpeed ?? 18);
          setSpacing(settings.spacing ?? 40);
          setShowSeparator(!!settings.showSeparator);
        }
      })
      .catch(() => {});

    return () => {
      mounted = false;
    };
  }, []);

  const handleGlowMove = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty("--glow-x", `${event.clientX - rect.left}px`);
    event.currentTarget.style.setProperty("--glow-y", `${event.clientY - rect.top}px`);
  };

  const goSignup = () => navigate("/auth?mode=signup");
  const renderBrandLogoCarousel = (className = "") => (
    brandLogos.length > 0 && (
      <section className={`brand-logo-strip ${className}`} aria-label="Featured brand logos">
        <div
          className={`brand-logo-carousel landing-glow-card ${activeBrandLogo ? "is-paused" : ""}`}
          onPointerMove={handleGlowMove}
          style={{
            "--scroll-duration": `${scrollSpeed}s`,
            "--logo-spacing": `${spacing}px`
          }}
        >
          <div 
            className="brand-logo-track"
            style={{ 
              animationDuration: `${scrollSpeed}s`,
              gap: showSeparator ? '0' : `${spacing}px`
            }}
          >
            {brandLogos.map((brand, index) => (
              <Fragment key={brand._id}>
                <a
                  className={`brand-logo-item ${activeBrandLogo === brand._id ? "is-active" : ""}`}
                  href={brand.website || undefined}
                  target={brand.website ? "_blank" : undefined}
                  rel={brand.website ? "noreferrer" : undefined}
                  onMouseEnter={() => setActiveBrandLogo(brand._id)}
                  onMouseLeave={() => setActiveBrandLogo(null)}
                  onClick={(event) => {
                    if (!window.matchMedia("(hover: none)").matches) return;
                    event.preventDefault();
                    setActiveBrandLogo((current) => (
                      current === brand._id ? null : brand._id
                    ));
                  }}
                >
                  <img src={resolveAssetUrl(brand.image)} alt={brand.name} loading="lazy" />
                </a>
                {showSeparator && index < brandLogos.length - 1 && (
                  <div
                    className="brand-logo-separator"
                    style={{ margin: `0 ${spacing / 2}px` }}
                  />
                )}
              </Fragment>
            ))}
          </div>
        </div>
      </section>
    )
  );

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
            <a href="#showcase">Showcase</a>
            <a href="#testimonials">Proof</a>
          </div>

          <div className="landing-auth-buttons">
            <LiquidButton
              variant="secondary"
              size="small"
              circular
              className="landing-theme-toggle"
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
              title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            >
              {theme === "dark" ? <Sun size={18} strokeWidth={2.4} /> : <Moon size={18} strokeWidth={2.4} />}
            </LiquidButton>
            <LiquidButton variant="primary" size="small" onClick={() => navigate("/auth")}>
              Log in
            </LiquidButton>
            <LiquidButton variant="primary" size="small" onClick={goSignup}>
              Get Started
            </LiquidButton>
          </div>
        </div>
      </nav>

      <section className="hero">
        <div
          className="hero-media"
          aria-hidden="true"
          style={{
            "--hero-desktop-image": `url(${heroImage})`,
            "--hero-mobile-image": `url(${heroMobileImage})`,
          }}
        />
        {renderBrandLogoCarousel("brand-logo-strip-mobile")}

        <div className="hero-grid">
          <div className="hero-content landing-reveal">
            <div className="hero-badge">
              <span className="dot" />
              <span>Premium influencer marketplace for India</span>
            </div>
            <h1>
              Build creator campaigns that move
              <span className="gradient-text"> from discovery to delivery</span>
            </h1>
            <p>
              InfluenZoo connects brands and influencers with posts, campaigns, applications, selection tools, wallet flows, and analytics in one polished marketplace.
            </p>
            <div className="hero-cta">
              <LiquidButton variant="primary" onClick={goSignup}>
                Join as Influencer <ArrowRight size={18} />
              </LiquidButton>
              <LiquidButton variant="secondary" onClick={goSignup}>
                Start Campaign <Briefcase size={18} />
              </LiquidButton>
            </div>
            <div className="hero-trust-row">
              <span><Shield size={16} /> Verified profiles</span>
              <span><Sparkles size={16} /> AI-assisted content</span>
              <span><TrendingUp size={16} /> Live performance signals</span>
            </div>
          </div>

          <div className="hero-action-panel hero-signal-panel landing-glow-card landing-reveal" onPointerMove={handleGlowMove}>
            <div className="panel-header">
              <span className="panel-status" />
              <span>Creator signals</span>
            </div>
            <div className="signal-list">
              <div className="signal-row">
                <div className="signal-icon"><Camera size={18} /></div>
                <div className="signal-copy">
                  <strong>128 posts</strong>
                  <span>Creator content ready for campaigns</span>
                </div>
              </div>
              <div className="signal-row">
                <div className="signal-icon"><TrendingUp size={18} /></div>
                <div className="signal-copy">
                  <strong>42K views</strong>
                  <span>Reach across showcase posts</span>
                </div>
              </div>
              <div className="signal-row">
                <div className="signal-icon"><MessageCircle size={18} /></div>
                <div className="signal-copy">
                  <strong>8.4% engagement</strong>
                  <span>Likes, comments, and saves</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {renderBrandLogoCarousel("brand-logo-strip-desktop")}
      </section>

      <section id="how-it-works" className="how-it-works landing-section">
        <div className="section-header landing-reveal">
          <div className="overline">Marketplace Flow</div>
          <h2>One flow for creators and brands</h2>
          <p>Every step explains how content, campaigns, applications, and selection come together inside InfluenZoo.</p>
        </div>
        <div className="flow-track landing-reveal">
          {flowSteps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div className="flow-step landing-glow-card" onPointerMove={handleGlowMove} style={{ "--step": index }} key={step.title}>
                <div className="flow-index">{String(index + 1).padStart(2, "0")}</div>
                <div className="flow-icon"><Icon size={22} /></div>
                <span>{step.label}</span>
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section id="features" className="features-section landing-section">
        <div className="section-header landing-reveal">
          <div className="overline">Platform Power</div>
          <h2>Built for serious collaboration</h2>
          <p>Modern workflows for brands that need control and influencers that need opportunity.</p>
        </div>
        <div className="features-grid">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div className="feature-card landing-glow-card landing-reveal" onPointerMove={handleGlowMove} style={{ "--delay": `${index * 80}ms` }} key={feature.title}>
                <div className="feature-icon"><Icon size={22} /></div>
                <h4>{feature.title}</h4>
                <p>{feature.desc}</p>
                <span className="feature-link">Explore workflow <ArrowRight size={14} /></span>
              </div>
            );
          })}
        </div>
      </section>

      <section id="showcase" className="showcase-section landing-section">
        <div className="showcase-layout">
          <div className="section-header showcase-copy landing-reveal">
            <div className="overline">Showcase Preview</div>
            <h2>Content and campaigns feel alive before users sign in</h2>
            <p>Use the homepage to show the product promise: creators publish sharp content, brands launch campaigns, and both sides move faster.</p>
            <LiquidButton variant="secondary" onClick={() => document.getElementById("testimonials")?.scrollIntoView({ behavior: "smooth" })}>
              View social proof
            </LiquidButton>
          </div>
          <div className="showcase-grid landing-reveal">
            {showcaseItems.map((item) => (
              <article className="showcase-card landing-glow-card" onPointerMove={handleGlowMove} key={item.title}>
                <div className="showcase-image">
                  <img src={item.image} alt="" aria-hidden="true" loading="lazy" />
                  <span>{item.tag}</span>
                </div>
                <div className="showcase-card-body">
                  <div className="preview-label">{item.type}</div>
                  <h3>{item.title}</h3>
                  <p>{item.meta}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="testimonials" className="testimonials landing-section">
        <div className="section-header landing-reveal">
          <div className="overline">Social Proof</div>
          <h2>Designed to earn trust quickly</h2>
          <p>Premium presentation, operational clarity, and conversion-focused journeys for both sides of the marketplace.</p>
        </div>
        <div className="proof-grid landing-reveal">
          {proofStats.map((stat) => (
            <div className="proof-stat landing-glow-card" onPointerMove={handleGlowMove} key={stat.label}>
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
            </div>
          ))}
        </div>
        <div className="testimonial-grid">
          {testimonials.map((testimonial, index) => (
            <div className="testimonial-card landing-glow-card landing-reveal" onPointerMove={handleGlowMove} style={{ "--delay": `${index * 80}ms` }} key={testimonial.name}>
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

      <section className="cta-section landing-section">
        <div className="cta-content landing-glow-card landing-reveal" onPointerMove={handleGlowMove}>
          <div className="overline">Start Building</div>
          <h2>Turn creator discovery into measurable campaigns</h2>
          <p>Join InfluenZoo to showcase content, launch campaigns, review applications, select collaborators, and track outcomes.</p>
          <div className="hero-cta">
            <LiquidButton variant="primary" onClick={goSignup}>
              Create Free Account <ArrowRight size={18} />
            </LiquidButton>
            <LiquidButton variant="secondary" onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}>
              See the flow
            </LiquidButton>
          </div>
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
