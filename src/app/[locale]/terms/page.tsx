import { Header } from "@/components/marketing/Header";
import { Footer } from "@/components/marketing/Footer";

export default function TermsPage() {
  return (
    <>
      <Header />
      <main className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold text-text mb-2">Terms of Service</h1>
        <p className="text-sm text-text-dim mb-10">Last updated: June 3, 2025</p>

        <div className="prose-custom space-y-8 text-text-2 text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-text mb-3">1. Acceptance of Terms</h2>
            <p>By accessing or using Taskative (&quot;the App&quot;), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the App.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text mb-3">2. Description of Service</h2>
            <p>Taskative is a task management application that allows users to create, manage, and collaborate on tasks individually or within groups. The App is available on Android via Google Play and on the web at taskativeapp.com.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text mb-3">3. User Accounts</h2>
            <p>You are responsible for maintaining the confidentiality of your account credentials. You agree to provide accurate information during registration and to update your information as necessary. You must not share your account with others or allow unauthorized access.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text mb-3">4. Acceptable Use</h2>
            <p>You agree not to: use the App for any unlawful purpose, attempt to gain unauthorized access to other accounts, interfere with the App&apos;s functionality, upload malicious content or spam, or use the App to harass or harm others.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text mb-3">5. Subscriptions and Payments</h2>
            <p>Taskative offers free and paid subscription plans. Paid subscriptions are billed through Google Play. You may cancel your subscription at any time through Google Play settings. Refunds are handled according to Google Play&apos;s refund policies.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text mb-3">6. Intellectual Property</h2>
            <p>All content, features, and functionality of the App are owned by Taskative and are protected by copyright, trademark, and other intellectual property laws. You may not reproduce, distribute, or create derivative works without our permission.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text mb-3">7. Data and Content</h2>
            <p>You retain ownership of the content you create within the App. By using the App, you grant us a limited license to store, process, and display your content as necessary to provide the service. We do not claim ownership of your tasks, notes, or other user-generated content.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text mb-3">8. Limitation of Liability</h2>
            <p>Taskative is provided &quot;as is&quot; without warranties of any kind. We shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the App.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text mb-3">9. Termination</h2>
            <p>We reserve the right to terminate or suspend your account at any time for violation of these Terms. You may delete your account at any time through the App settings.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text mb-3">10. Changes to Terms</h2>
            <p>We may update these Terms from time to time. Continued use of the App after changes constitutes acceptance of the updated Terms.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text mb-3">11. Contact</h2>
            <p>For questions about these Terms, please contact us at: <a href="mailto:principlesofmik@gmail.com" className="text-primary hover:underline">principlesofmik@gmail.com</a></p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
