"use client";

import {
  Info,
  Database,
  Settings2,
  Lock,
  History,
  Mail,
  UserCheck,
  ShieldCheck,
} from "lucide-react";
import { LegalPageLayout, type LegalSection } from "@/components/legal/LegalPageLayout";

const sections: LegalSection[] = [
  {
    id: "introduction",
    title: "1. Introduction",
    icon: Info,
    content: (
      <p>
        Legalyze AI (&quot;we&quot; or &quot;us&quot; or &quot;Company&quot;)
        operates the Legalyze AI website and mobile application (the
        &quot;Service&quot;). This page informs you of our policies regarding
        the collection, use, and disclosure of personal data when you use our
        Service and the choices you have associated with that data.
      </p>
    ),
  },
  {
    id: "collection",
    title: "2. Information Collection and Use",
    icon: Database,
    content: (
      <>
        <p className="mb-4">
          We collect several different types of information for various
          purposes to provide and improve our Service to you:
        </p>
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-slate-900 mb-2">
              Personal Data:
            </h3>
            <ul>
              <li>Email address</li>
              <li>First name and last name</li>
              <li>Cookies and Usage Data</li>
              <li>Documents uploaded for analysis</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 mb-2">Usage Data:</h3>
            <p>
              We may also collect information on how the Service is accessed
              and used (&quot;Usage Data&quot;). This may include information
              such as your computer&apos;s Internet Protocol address (e.g. IP
              address), browser type, browser version, the pages you visit,
              the time and date of your visit, the time spent on those pages,
              and other diagnostic data.
            </p>
          </div>
        </div>
      </>
    ),
  },
  {
    id: "use-of-data",
    title: "3. Use of Data",
    icon: Settings2,
    content: (
      <>
        <p className="mb-4">Legalyze AI uses the collected data for various purposes:</p>
        <ul>
          <li>To provide and maintain our Service</li>
          <li>To notify you about changes to our Service</li>
          <li>To allow you to participate in interactive features of our Service</li>
          <li>To provide customer support</li>
          <li>To gather analysis or valuable information so that we can improve our Service</li>
          <li>To monitor the usage of our Service</li>
          <li>To detect, prevent and address technical issues</li>
        </ul>
      </>
    ),
  },
  {
    id: "security",
    title: "4. Security of Data",
    icon: Lock,
    content: (
      <p>
        The security of your data is important to us, but remember that no
        method of transmission over the Internet or method of electronic
        storage is 100% secure. While we strive to use commercially acceptable
        means to protect your Personal Data, we cannot guarantee its absolute
        security.
      </p>
    ),
  },
  {
    id: "changes",
    title: "5. Changes to This Privacy Policy",
    icon: History,
    content: (
      <p>
        We may update our Privacy Policy from time to time. We will notify you
        of any changes by posting the new Privacy Policy on this page and
        updating the &quot;effective date&quot; at the top of this Privacy
        Policy.
      </p>
    ),
  },
  {
    id: "contact",
    title: "6. Contact Us",
    icon: Mail,
    content: (
      <>
        <p className="mb-4">
          If you have any questions about this Privacy Policy, please contact
          us:
        </p>
        <p>
          Email:{" "}
          <a
            href="mailto:privacy@legalyze.ai"
            className="text-blue-600 font-medium hover:underline"
          >
            privacy@legalyze.ai
          </a>
        </p>
        <p>Website: www.legalyze.ai</p>
      </>
    ),
  },
  {
    id: "rights",
    title: "7. Your Rights",
    icon: UserCheck,
    content: (
      <>
        <p className="mb-4">
          Depending on your location, you may have certain rights regarding
          your personal data, including:
        </p>
        <ul>
          <li>The right to access your personal data</li>
          <li>The right to rectification of inaccurate data</li>
          <li>The right to erasure</li>
          <li>The right to restrict processing</li>
          <li>The right to data portability</li>
          <li>The right to object to processing</li>
        </ul>
      </>
    ),
  },
];

const PrivacyPage = () => {
  return (
    <LegalPageLayout
      eyebrow="Legal"
      title="Privacy Policy"
      description="How Legalyze AI collects, uses, and protects your personal data and the documents you upload for analysis."
      heroIcon={ShieldCheck}
      lastUpdated="July 2, 2026"
      sections={sections}
    />
  );
};

export default PrivacyPage;
