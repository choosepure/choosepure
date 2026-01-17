import React from 'react';
import { Link } from 'react-router-dom';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-50 pt-40 sm:pt-48 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8 sm:p-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-8 text-center">
            Privacy Policy – ChoosePure
          </h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-6">
              <strong>Effective Date:</strong> January 17, 2026
            </p>
            
            <p className="text-gray-700 leading-relaxed mb-6">
              ChoosePure ("we", "our", "us") respects your privacy and is committed to protecting the personal information you share with us. This Privacy Policy explains how we collect, use, store, and protect your information when you visit our website, use our services, or become part of the ChoosePure community.
            </p>
            
            <p className="text-gray-700 leading-relaxed mb-8">
              By accessing or using ChoosePure, you agree to the terms of this Privacy Policy.
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Information We Collect</h2>
              <p className="text-gray-700 mb-4">We may collect the following types of information:</p>
              
              <div className="ml-4 mb-4">
                <h3 className="text-xl font-medium text-gray-800 mb-2">a. Personal Information</h3>
                <ul className="list-disc ml-6 text-gray-700 space-y-1">
                  <li>Name</li>
                  <li>Email address</li>
                  <li>Phone number</li>
                  <li>City / location</li>
                  <li>Payment details (processed via secure third-party payment gateways; we do not store card details)</li>
                </ul>
              </div>

              <div className="ml-4 mb-4">
                <h3 className="text-xl font-medium text-gray-800 mb-2">b. Non-Personal Information</h3>
                <ul className="list-disc ml-6 text-gray-700 space-y-1">
                  <li>Browser type</li>
                  <li>Device information</li>
                  <li>IP address</li>
                  <li>Pages visited and time spent on our website</li>
                  <li>Anonymous usage and analytics data</li>
                </ul>
              </div>

              <div className="ml-4">
                <h3 className="text-xl font-medium text-gray-800 mb-2">c. Community & Contribution Data</h3>
                <ul className="list-disc ml-6 text-gray-700 space-y-1">
                  <li>Products suggested for testing</li>
                  <li>Poll responses and survey inputs</li>
                  <li>Community discussions or feedback</li>
                  <li>Contributions made for food testing</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. How We Use Your Information</h2>
              <p className="text-gray-700 mb-4">We use your information to:</p>
              <ul className="list-disc ml-6 text-gray-700 space-y-2">
                <li>Provide access to ChoosePure services and community features</li>
                <li>Share food testing reports and updates</li>
                <li>Communicate important announcements, alerts, or changes</li>
                <li>Improve our platform, content, and user experience</li>
                <li>Process payments and manage contributions</li>
                <li>Comply with legal and regulatory requirements</li>
              </ul>
              <p className="text-gray-700 mt-4 font-medium">
                We do not sell or rent your personal data to third parties.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Food Testing Reports & Transparency</h2>
              <ul className="list-disc ml-6 text-gray-700 space-y-2">
                <li>Reports shared by ChoosePure are informational and educational in nature.</li>
                <li>Reports are shared only with contributing or authorized members, unless explicitly stated otherwise.</li>
                <li>Brand names may be mentioned purely for consumer awareness and quality comparison.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Cookies & Tracking Technologies</h2>
              <p className="text-gray-700 mb-4">We use cookies and similar technologies to:</p>
              <ul className="list-disc ml-6 text-gray-700 space-y-2">
                <li>Improve website functionality</li>
                <li>Understand user behavior and preferences</li>
                <li>Measure traffic and engagement</li>
              </ul>
              <p className="text-gray-700 mt-4">
                You can disable cookies through your browser settings, though some features may not function properly.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Data Sharing & Third Parties</h2>
              <p className="text-gray-700 mb-4">We may share limited data with:</p>
              <ul className="list-disc ml-6 text-gray-700 space-y-2">
                <li>Payment processors</li>
                <li>Analytics providers</li>
                <li>Email or communication tools</li>
              </ul>
              <p className="text-gray-700 mt-4">
                All third parties are required to follow strict confidentiality and data protection standards.
              </p>
              <p className="text-gray-700 mt-2">
                We may disclose information if required by law, court order, or government authority.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Data Security</h2>
              <p className="text-gray-700 mb-4">We take reasonable and appropriate measures to protect your data, including:</p>
              <ul className="list-disc ml-6 text-gray-700 space-y-2">
                <li>Secure servers</li>
                <li>Encrypted communication</li>
                <li>Restricted internal access</li>
              </ul>
              <p className="text-gray-700 mt-4">
                However, no system is 100% secure, and we cannot guarantee absolute security.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Your Rights</h2>
              <p className="text-gray-700 mb-4">You have the right to:</p>
              <ul className="list-disc ml-6 text-gray-700 space-y-2">
                <li>Access your personal data</li>
                <li>Request correction or deletion</li>
                <li>Opt out of marketing communications</li>
                <li>Withdraw consent at any time</li>
              </ul>
              <p className="text-gray-700 mt-4">
                To exercise your rights, email us at{' '}
                <a href="mailto:support@choosepure.in" className="text-green-600 hover:text-green-700 underline">
                  support@choosepure.in
                </a>
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Children's Privacy</h2>
              <p className="text-gray-700">
                ChoosePure is not intended for children under 13 years of age. We do not knowingly collect personal data from children.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Changes to This Privacy Policy</h2>
              <p className="text-gray-700 mb-4">
                We may update this Privacy Policy from time to time. Any changes will be posted on this page with a revised effective date.
              </p>
              <p className="text-gray-700">
                Continued use of ChoosePure after updates implies acceptance of the revised policy.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Contact Us</h2>
              <p className="text-gray-700 mb-4">
                If you have questions, concerns, or requests regarding this Privacy Policy, contact us at:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700 font-medium">ChoosePure</p>
                <p className="text-gray-700">
                  Email:{' '}
                  <a href="mailto:support@choosepure.in" className="text-green-600 hover:text-green-700 underline">
                    support@choosepure.in
                  </a>
                </p>
                <p className="text-gray-700">
                  Website:{' '}
                  <a href="https://choosepure.in" className="text-green-600 hover:text-green-700 underline">
                    choosepure.in
                  </a>
                </p>
              </div>
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mt-8">
              <p className="text-blue-800 font-medium">
                📋 Please also review our{' '}
                <Link to="/terms-conditions" className="text-blue-600 hover:text-blue-700 underline">
                  Terms & Conditions
                </Link>{' '}
                and{' '}
                <Link to="/refund-policy" className="text-blue-600 hover:text-blue-700 underline">
                  Refund Policy
                </Link>{' '}
                for complete information about using ChoosePure services.
              </p>
            </div>   </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;