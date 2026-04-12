import { Header } from "@/components/marketing/Header";
import { Footer } from "@/components/marketing/Footer";

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold text-text mb-2">Privacy Policy</h1>
        <p className="text-sm text-text-dim mb-10">Last updated: June 3, 2025</p>

        <div className="prose-custom space-y-8 text-text-2 text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-text mb-3">1. Introduction</h2>
            <p>This Privacy Policy outlines how Taskative (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) collects, uses, discloses, and protects information about our application users (&quot;you&quot;, &quot;user&quot;). We respect your privacy and are committed to protecting your personal information.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text mb-3">2. Information We Collect</h2>
            <p><strong>2.1 Personal Information</strong><br/>Email Address: Collected during registration to facilitate authentication and account management.</p>
            <p><strong>2.2 Task and Group Information</strong><br/>We collect data about the tasks you create, groups you join, and your interactions within those groups.</p>
            <p><strong>2.3 Device Information</strong><br/>Device type and operating system are collected to improve app performance and resolve technical issues. Log data including error reports and performance metrics may be collected during app usage.</p>
            <p><strong>2.4 Notifications</strong><br/>Notification tokens are used to send push notifications to your device.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text mb-3">3. Use of Information</h2>
            <p>Information collected is used for: providing core app functionality, communicating important account updates, improving app performance and user experience, and ensuring security and preventing fraud.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text mb-3">4. Information Sharing</h2>
            <p>Your personal data is not shared with third parties except for: legal obligations and responding to legal requests, and service providers such as Firebase (by Google) which assists with data storage, authentication, and notifications under strict privacy agreements.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text mb-3">5. Data Security</h2>
            <p>We implement industry-standard security measures to protect your data. However, no method of internet transmission or electronic storage is completely secure.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text mb-3">6. Children&apos;s Privacy</h2>
            <p>Our app is not directed at children under 13 years of age, and we do not knowingly collect personal information from children under 13.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text mb-3">7. International Data Transfers</h2>
            <p>Your data may be processed and stored on servers outside your country of residence. By using our app, you consent to such cross-border data transfers.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text mb-3">8. Your Rights</h2>
            <p><strong>Access and Correction:</strong> You have the right to request access to personal data we hold about you and to request corrections.</p>
            <p><strong>Deletion:</strong> You may request deletion of your account and all associated personal data through the app settings under &quot;Account and Data Deletion&quot;.</p>
            <p><strong>Objection:</strong> You may object to data processing activities you believe are unnecessary.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text mb-3">9. Cookies</h2>
            <p>We currently do not use cookies or similar tracking technologies. If this changes, we will update this policy accordingly.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text mb-3">10. Changes to This Policy</h2>
            <p>We may update this Privacy Policy periodically. Changes will be communicated within the app or through other appropriate means.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text mb-3">11. Contact Us</h2>
            <p>For questions or requests regarding this Privacy Policy, please contact us at: <a href="mailto:principlesofmik@gmail.com" className="text-primary hover:underline">principlesofmik@gmail.com</a></p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
