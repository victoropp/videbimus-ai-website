import * as React from "react"

interface ContactNotificationEmailProps {
  name: string
  email: string
  company?: string
  phone?: string
  subject: string
  message: string
  contactId: string
}

export function ContactNotificationEmail({
  name,
  email,
  company,
  phone,
  subject,
  message,
  contactId,
}: ContactNotificationEmailProps) {
  return (
    <html>
      <head>
        <title>New Contact Form Submission</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body style={{ fontFamily: "Arial, sans-serif", margin: 0, padding: 0 }}>
        <div style={{ maxWidth: "600px", margin: "0 auto", padding: "20px" }}>
          {/* Header */}
          <div style={{ backgroundColor: "#0066cc", padding: "20px", borderRadius: "8px 8px 0 0" }}>
            <h1 style={{ color: "white", margin: 0, fontSize: "24px" }}>
              New Contact Form Submission
            </h1>
          </div>

          {/* Content */}
          <div style={{ backgroundColor: "#f8f9fa", padding: "30px", borderRadius: "0 0 8px 8px" }}>
            <h2 style={{ margin: "0 0 20px 0", color: "#333" }}>Contact Details</h2>
            
            <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "20px" }}>
              <tr>
                <td style={{ padding: "8px 0", fontWeight: "bold", width: "120px" }}>Name:</td>
                <td style={{ padding: "8px 0" }}>{name}</td>
              </tr>
              <tr>
                <td style={{ padding: "8px 0", fontWeight: "bold" }}>Email:</td>
                <td style={{ padding: "8px 0" }}>
                  <a href={`mailto:${email}`} style={{ color: "#0066cc" }}>{email}</a>
                </td>
              </tr>
              {company && (
                <tr>
                  <td style={{ padding: "8px 0", fontWeight: "bold" }}>Company:</td>
                  <td style={{ padding: "8px 0" }}>{company}</td>
                </tr>
              )}
              {phone && (
                <tr>
                  <td style={{ padding: "8px 0", fontWeight: "bold" }}>Phone:</td>
                  <td style={{ padding: "8px 0" }}>{phone}</td>
                </tr>
              )}
              <tr>
                <td style={{ padding: "8px 0", fontWeight: "bold" }}>Subject:</td>
                <td style={{ padding: "8px 0" }}>{subject}</td>
              </tr>
            </table>

            <h3 style={{ margin: "20px 0 10px 0", color: "#333" }}>Message:</h3>
            <div style={{
              backgroundColor: "white",
              padding: "15px",
              borderLeft: "4px solid #0066cc",
              borderRadius: "4px",
              marginBottom: "20px"
            }}>
              <p style={{ margin: 0, lineHeight: "1.6", whiteSpace: "pre-wrap" }}>{message}</p>
            </div>

            {/* Action Buttons */}
            <div style={{ marginTop: "30px", textAlign: "center" }}>
              <a
                href={`${process.env.APP_URL}/admin/contacts/${contactId}`}
                style={{
                  display: "inline-block",
                  backgroundColor: "#0066cc",
                  color: "white",
                  padding: "12px 24px",
                  textDecoration: "none",
                  borderRadius: "4px",
                  marginRight: "10px"
                }}
              >
                View in Admin Panel
              </a>
              <a
                href={`mailto:${email}?subject=Re: ${subject}`}
                style={{
                  display: "inline-block",
                  backgroundColor: "#28a745",
                  color: "white",
                  padding: "12px 24px",
                  textDecoration: "none",
                  borderRadius: "4px"
                }}
              >
                Reply to Contact
              </a>
            </div>
          </div>

          {/* Footer */}
          <div style={{ marginTop: "20px", textAlign: "center", color: "#666", fontSize: "14px" }}>
            <p>Contact ID: {contactId}</p>
            <p>Submitted at: {new Date().toLocaleString()}</p>
            <hr style={{ margin: "20px 0", border: "none", borderTop: "1px solid #eee" }} />
            <p>Videbimus AI - Your AI Consulting Partner</p>
          </div>
        </div>
      </body>
    </html>
  )
}