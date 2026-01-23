import { Metadata } from "next";
import { siteConfig } from "@/lib/seo-config";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Learn how Answer Human collects, uses, and protects your personal information. Our privacy policy explains your rights and our data handling practices.",
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: `${siteConfig.url}/privacy`,
    title: "Privacy Policy | Answer Human",
    description:
      "Learn how Answer Human collects, uses, and protects your personal information.",
    siteName: siteConfig.name,
  },
  alternates: {
    canonical: `${siteConfig.url}/privacy`,
  },
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <h1 className="text-4xl font-bold text-slate-900 mb-8">Privacy Policy</h1>
        
        <div className="prose prose-slate max-w-none">
          <p className="text-lg text-slate-600 mb-8">
            Last updated: January 24, 2026
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">
              1. Information We Collect
            </h2>
            <p className="text-slate-600 mb-4">
              We collect information you provide directly to us, including:
            </p>
            <ul className="list-disc pl-6 text-slate-600 space-y-2">
              <li>Name, email address, and contact information</li>
              <li>Profile information for experts and seekers</li>
              <li>Payment and transaction information</li>
              <li>Communication data between users</li>
              <li>Usage data and analytics</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">
              2. How We Use Your Information
            </h2>
            <p className="text-slate-600 mb-4">
              We use the information we collect to:
            </p>
            <ul className="list-disc pl-6 text-slate-600 space-y-2">
              <li>Provide, maintain, and improve our services</li>
              <li>Process transactions and send related information</li>
              <li>Match seekers with appropriate experts</li>
              <li>Send technical notices and support messages</li>
              <li>Respond to your comments and questions</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">
              3. Information Sharing
            </h2>
            <p className="text-slate-600">
              We do not sell, trade, or otherwise transfer your personal information to third 
              parties without your consent, except as described in this policy or as required 
              by law. We may share information with service providers who assist us in 
              operating our platform.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">
              4. Data Security
            </h2>
            <p className="text-slate-600">
              We implement appropriate security measures to protect your personal information 
              against unauthorized access, alteration, disclosure, or destruction. However, 
              no method of transmission over the Internet is 100% secure.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">
              5. Your Rights
            </h2>
            <p className="text-slate-600 mb-4">
              You have the right to:
            </p>
            <ul className="list-disc pl-6 text-slate-600 space-y-2">
              <li>Access and receive a copy of your personal data</li>
              <li>Rectify inaccurate personal data</li>
              <li>Request deletion of your personal data</li>
              <li>Object to processing of your personal data</li>
              <li>Data portability</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">
              6. Cookies
            </h2>
            <p className="text-slate-600">
              We use cookies and similar technologies to enhance your experience, analyze 
              usage patterns, and deliver personalized content. You can control cookie 
              preferences through your browser settings.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">
              7. Contact Us
            </h2>
            <p className="text-slate-600">
              If you have any questions about this Privacy Policy, please contact us at:{" "}
              <a 
                href="mailto:privacy@answerhuman.com" 
                className="text-emerald-600 hover:text-emerald-700"
              >
                privacy@answerhuman.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

