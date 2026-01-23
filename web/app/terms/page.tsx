import { Metadata } from "next";
import { siteConfig } from "@/lib/seo-config";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Read Answer Human's Terms of Service. Understand your rights and responsibilities when using our expert consultation platform.",
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: `${siteConfig.url}/terms`,
    title: "Terms of Service | Answer Human",
    description:
      "Read Answer Human's Terms of Service. Understand your rights and responsibilities.",
    siteName: siteConfig.name,
  },
  alternates: {
    canonical: `${siteConfig.url}/terms`,
  },
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <h1 className="text-4xl font-bold text-slate-900 mb-8">Terms of Service</h1>
        
        <div className="prose prose-slate max-w-none">
          <p className="text-lg text-slate-600 mb-8">
            Last updated: January 24, 2026
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">
              1. Acceptance of Terms
            </h2>
            <p className="text-slate-600">
              By accessing and using Answer Human, you agree to be bound by these Terms of 
              Service and all applicable laws and regulations. If you do not agree with any 
              of these terms, you are prohibited from using or accessing this platform.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">
              2. Description of Service
            </h2>
            <p className="text-slate-600">
              Answer Human is a marketplace platform that connects knowledge seekers with 
              verified experts. We facilitate consultations through various communication 
              methods including chat, voice calls, and video calls.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">
              3. User Accounts
            </h2>
            <p className="text-slate-600 mb-4">
              To use certain features of our platform, you must register for an account. 
              You agree to:
            </p>
            <ul className="list-disc pl-6 text-slate-600 space-y-2">
              <li>Provide accurate and complete information</li>
              <li>Maintain the security of your account credentials</li>
              <li>Accept responsibility for all activities under your account</li>
              <li>Notify us immediately of any unauthorized use</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">
              4. Expert Responsibilities
            </h2>
            <p className="text-slate-600 mb-4">
              Experts on our platform agree to:
            </p>
            <ul className="list-disc pl-6 text-slate-600 space-y-2">
              <li>Provide accurate information about their qualifications</li>
              <li>Deliver consultations professionally and punctually</li>
              <li>Maintain confidentiality of seeker information</li>
              <li>Not provide advice outside their area of expertise</li>
              <li>Comply with all applicable professional standards and laws</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">
              5. Seeker Responsibilities
            </h2>
            <p className="text-slate-600 mb-4">
              Seekers on our platform agree to:
            </p>
            <ul className="list-disc pl-6 text-slate-600 space-y-2">
              <li>Provide accurate information about their needs</li>
              <li>Attend scheduled consultations on time</li>
              <li>Treat experts with respect and professionalism</li>
              <li>Make payments as agreed for services received</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">
              6. Payments and Fees
            </h2>
            <p className="text-slate-600">
              All payments are processed through our secure payment system. Experts set 
              their own rates, and Answer Human retains a platform fee from each transaction. 
              Refund policies are outlined in our Refund Policy.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">
              7. Intellectual Property
            </h2>
            <p className="text-slate-600">
              The content, features, and functionality of Answer Human are owned by us and 
              are protected by international copyright, trademark, and other intellectual 
              property laws.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">
              8. Limitation of Liability
            </h2>
            <p className="text-slate-600">
              Answer Human acts as a marketplace and is not responsible for the advice or 
              services provided by experts. We do not guarantee the accuracy, completeness, 
              or usefulness of any expert advice. Users engage with experts at their own risk.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">
              9. Termination
            </h2>
            <p className="text-slate-600">
              We reserve the right to terminate or suspend your account at any time for 
              violations of these terms or for any other reason at our sole discretion.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">
              10. Contact Us
            </h2>
            <p className="text-slate-600">
              If you have any questions about these Terms, please contact us at:{" "}
              <a 
                href="mailto:legal@answerhuman.com" 
                className="text-emerald-600 hover:text-emerald-700"
              >
                legal@answerhuman.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

