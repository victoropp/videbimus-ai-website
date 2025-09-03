import * as React from "react"

interface WelcomeEmailProps {
  email: string
  name?: string
}

export function WelcomeEmail({ email, name }: WelcomeEmailProps) {
  const displayName = name || email.split("@")[0]

  return (
    <html>
      <head>
        <title>Welcome to Videbimus AI Newsletter</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body style={{ fontFamily: "Arial, sans-serif", margin: 0, padding: 0, backgroundColor: "#f4f4f4" }}>
        <div style={{ maxWidth: "600px", margin: "0 auto", backgroundColor: "white" }}>
          {/* Header */}
          <div style={{ backgroundColor: "#0066cc", padding: "40px 20px", textAlign: "center" }}>
            <h1 style={{ color: "white", margin: 0, fontSize: "28px", fontWeight: "300" }}>
              Welcome to Videbimus AI
            </h1>
            <p style={{ color: "#cce7ff", margin: "10px 0 0 0", fontSize: "16px" }}>
              Your AI Consulting Partner
            </p>
          </div>

          {/* Content */}
          <div style={{ padding: "40px 20px" }}>
            <h2 style={{ margin: "0 0 20px 0", color: "#333", fontSize: "24px" }}>
              Hello {displayName}! 👋
            </h2>
            
            <p style={{ lineHeight: "1.6", color: "#555", fontSize: "16px", marginBottom: "20px" }}>
              Thank you for subscribing to our newsletter! We're excited to have you join our community 
              of AI enthusiasts and business leaders.
            </p>

            <p style={{ lineHeight: "1.6", color: "#555", fontSize: "16px", marginBottom: "20px" }}>
              Here's what you can expect from us:
            </p>

            <ul style={{ lineHeight: "1.6", color: "#555", fontSize: "16px", paddingLeft: "20px", marginBottom: "30px" }}>
              <li style={{ marginBottom: "10px" }}>
                <strong>AI Industry Insights:</strong> Latest trends and developments in artificial intelligence
              </li>
              <li style={{ marginBottom: "10px" }}>
                <strong>Case Studies:</strong> Real-world examples of AI implementation success stories
              </li>
              <li style={{ marginBottom: "10px" }}>
                <strong>Expert Tips:</strong> Practical advice on integrating AI into your business
              </li>
              <li style={{ marginBottom: "10px" }}>
                <strong>Exclusive Content:</strong> Early access to our resources and tools
              </li>
            </ul>

            {/* CTA Buttons */}
            <div style={{ textAlign: "center", margin: "30px 0" }}>
              <a
                href={`${process.env.APP_URL}/blog`}
                style={{
                  display: "inline-block",
                  backgroundColor: "#0066cc",
                  color: "white",
                  padding: "12px 24px",
                  textDecoration: "none",
                  borderRadius: "4px",
                  marginRight: "10px",
                  marginBottom: "10px"
                }}
              >
                Read Our Blog
              </a>
              <a
                href={`${process.env.APP_URL}/services`}
                style={{
                  display: "inline-block",
                  backgroundColor: "#28a745",
                  color: "white",
                  padding: "12px 24px",
                  textDecoration: "none",
                  borderRadius: "4px",
                  marginBottom: "10px"
                }}
              >
                Explore Our Services
              </a>
            </div>

            <div style={{ backgroundColor: "#f8f9fa", padding: "20px", borderRadius: "4px", borderLeft: "4px solid #0066cc" }}>
              <h3 style={{ margin: "0 0 10px 0", color: "#333" }}>Get Started Today</h3>
              <p style={{ margin: 0, lineHeight: "1.6", color: "#555" }}>
                Ready to transform your business with AI? Schedule a free consultation with our experts 
                and discover how we can help you leverage artificial intelligence for growth.
              </p>
            </div>

            <div style={{ textAlign: "center", marginTop: "30px" }}>
              <a
                href={`${process.env.APP_URL}/contact`}
                style={{
                  display: "inline-block",
                  backgroundColor: "#ff6b35",
                  color: "white",
                  padding: "15px 30px",
                  textDecoration: "none",
                  borderRadius: "4px",
                  fontSize: "16px",
                  fontWeight: "bold"
                }}
              >
                Schedule Free Consultation
              </a>
            </div>
          </div>

          {/* Footer */}
          <div style={{ backgroundColor: "#f8f9fa", padding: "30px 20px", textAlign: "center", borderTop: "1px solid #e9ecef" }}>
            <div style={{ marginBottom: "20px" }}>
              <h4 style={{ margin: "0 0 10px 0", color: "#333" }}>Connect with us</h4>
              <div style={{ margin: "10px 0" }}>
                <a href="#" style={{ color: "#0066cc", textDecoration: "none", margin: "0 10px" }}>LinkedIn</a>
                <a href="#" style={{ color: "#0066cc", textDecoration: "none", margin: "0 10px" }}>Twitter</a>
                <a href="#" style={{ color: "#0066cc", textDecoration: "none", margin: "0 10px" }}>GitHub</a>
              </div>
            </div>

            <p style={{ color: "#666", fontSize: "14px", lineHeight: "1.5", margin: "0 0 10px 0" }}>
              You're receiving this because you subscribed to our newsletter at videbimus.ai
            </p>
            <p style={{ color: "#666", fontSize: "14px", lineHeight: "1.5", margin: "0 0 20px 0" }}>
              <a 
                href={`${process.env.APP_URL}/unsubscribe?email=${encodeURIComponent(email)}`}
                style={{ color: "#666", textDecoration: "underline" }}
              >
                Unsubscribe
              </a>
              {" | "}
              <a 
                href={`${process.env.APP_URL}/newsletter-preferences?email=${encodeURIComponent(email)}`}
                style={{ color: "#666", textDecoration: "underline" }}
              >
                Update Preferences
              </a>
            </p>
            
            <hr style={{ margin: "20px 0", border: "none", borderTop: "1px solid #e9ecef" }} />
            <p style={{ color: "#666", fontSize: "14px", margin: 0 }}>
              © 2024 Videbimus AI. All rights reserved.
            </p>
          </div>
        </div>
      </body>
    </html>
  )
}