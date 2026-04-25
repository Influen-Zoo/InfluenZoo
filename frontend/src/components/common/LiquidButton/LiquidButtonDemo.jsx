import React from 'react';
import LiquidButton from './LiquidButton';
import './LiquidButtonDemo.css';

const LiquidButtonDemo = () => {
  return (
    <div className="liquid-button-demo">
      <div className="demo-container">
        <h1>Liquid Button Showcase</h1>

        {/* Primary Buttons */}
        <section className="demo-section">
          <h2>Primary Variants</h2>
          <div className="button-group">
            <LiquidButton variant="primary">
              Primary Button
            </LiquidButton>
            <LiquidButton variant="primary" size="small">
              Small
            </LiquidButton>
            <LiquidButton variant="primary" size="large">
              Large
            </LiquidButton>
            <LiquidButton variant="primary" disabled>
              Disabled
            </LiquidButton>
          </div>
        </section>

        {/* Secondary Buttons */}
        <section className="demo-section">
          <h2>Secondary Variants</h2>
          <div className="button-group">
            <LiquidButton variant="secondary">
              Secondary Button
            </LiquidButton>
            <LiquidButton variant="secondary" size="small">
              Small
            </LiquidButton>
            <LiquidButton variant="secondary" size="large">
              Large
            </LiquidButton>
            <LiquidButton variant="secondary" disabled>
              Disabled
            </LiquidButton>
          </div>
        </section>

        {/* Success Buttons */}
        <section className="demo-section">
          <h2>Success Variants</h2>
          <div className="button-group">
            <LiquidButton variant="success">
              Success Button
            </LiquidButton>
            <LiquidButton variant="success" size="small">
              Small
            </LiquidButton>
            <LiquidButton variant="success" size="large">
              Large
            </LiquidButton>
            <LiquidButton variant="success" disabled>
              Disabled
            </LiquidButton>
          </div>
        </section>

        {/* Error Buttons */}
        <section className="demo-section">
          <h2>Error Variants</h2>
          <div className="button-group">
            <LiquidButton variant="error">
              Error Button
            </LiquidButton>
            <LiquidButton variant="error" size="small">
              Small
            </LiquidButton>
            <LiquidButton variant="error" size="large">
              Large
            </LiquidButton>
            <LiquidButton variant="error" disabled>
              Disabled
            </LiquidButton>
          </div>
        </section>

        {/* Warning Buttons */}
        <section className="demo-section">
          <h2>Warning Variants</h2>
          <div className="button-group">
            <LiquidButton variant="warning">
              Warning Button
            </LiquidButton>
            <LiquidButton variant="warning" size="small">
              Small
            </LiquidButton>
            <LiquidButton variant="warning" size="large">
              Large
            </LiquidButton>
            <LiquidButton variant="warning" disabled>
              Disabled
            </LiquidButton>
          </div>
        </section>

        {/* Full Width Button */}
        <section className="demo-section">
          <h2>Full Width</h2>
          <div className="button-group full-width">
            <LiquidButton variant="primary" fullWidth>
              Full Width Primary Button
            </LiquidButton>
            <LiquidButton variant="secondary" fullWidth>
              Full Width Secondary Button
            </LiquidButton>
          </div>
        </section>

        {/* Interactive Examples */}
        <section className="demo-section">
          <h2>Interactive Examples</h2>
          <div className="button-group">
            <LiquidButton
              variant="primary"
              onClick={() => alert('Button clicked! 🌊')}
            >
              Click Me!
            </LiquidButton>
            <LiquidButton
              variant="success"
              onClick={() => console.log('Submitted')}
            >
              Submit
            </LiquidButton>
            <LiquidButton
              variant="error"
              onClick={() => console.log('Deleted')}
            >
              Delete
            </LiquidButton>
          </div>
        </section>
      </div>
    </div>
  );
};

export default LiquidButtonDemo;
