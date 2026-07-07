"use client";

import {
  FileCheck,
  Key,
  ShieldAlert,
  AlertTriangle,
  FileWarning,
  Link2,
  RefreshCw,
  Scale,
  Mail,
  FileText,
} from "lucide-react";
import { LegalPageLayout, type LegalSection } from "@/components/legal/LegalPageLayout";

const sections: LegalSection[] = [
  {
    id: "agreement",
    title: "1. Agreement to Terms",
    icon: FileCheck,
    content: (
      <p>
        By accessing and using Legalyze AI, you accept and agree to be bound
        by the terms and provision of this agreement. If you do not agree to
        abide by the above, please do not use this service.
      </p>
    ),
  },
  {
    id: "license",
    title: "2. Use License",
    icon: Key,
    content: (
      <>
        <p className="mb-4">
          Permission is granted to temporarily download one copy of the
          materials (information or software) on Legalyze AI for personal,
          non-commercial transitory viewing only. This is the grant of a
          license, not a transfer of title, and under this license you may
          not:
        </p>
        <ul>
          <li>Modifying or copying the materials</li>
          <li>
            Using the materials for any commercial purpose or for any public
            display
          </li>
          <li>
            Attempting to decompile or reverse engineer any software contained
            on the service
          </li>
          <li>
            Transferring the materials to another person or
            &quot;mirroring&quot; the materials on any other server
          </li>
          <li>
            Removing any copyright or other proprietary notations from the
            materials
          </li>
          <li>
            Transmitting or receiving any unlawful, threatening, abusive,
            defamatory, obscene, or otherwise objectionable material
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "disclaimer",
    title: "3. Disclaimer",
    icon: ShieldAlert,
    content: (
      <p>
        The materials on Legalyze AI are provided &quot;as is&quot;. Legalyze
        AI makes no warranties, expressed or implied, and hereby disclaims and
        negates all other warranties including, without limitation, implied
        warranties or conditions of merchantability, fitness for a particular
        purpose, or non-infringement of intellectual property or other
        violation of rights.
      </p>
    ),
  },
  {
    id: "limitations",
    title: "4. Limitations",
    icon: AlertTriangle,
    content: (
      <p>
        In no event shall Legalyze AI or its suppliers be liable for any
        damages (including, without limitation, damages for loss of data or
        profit, or due to business interruption) arising out of the use or
        inability to use the materials on Legalyze AI.
      </p>
    ),
  },
  {
    id: "accuracy",
    title: "5. Accuracy of Materials",
    icon: FileWarning,
    content: (
      <p>
        The materials appearing on Legalyze AI could include technical,
        typographical, or photographic errors. Legalyze AI does not warrant
        that any of the materials on Legalyze AI are accurate, complete, or
        current. Legalyze AI may make changes to the materials contained on
        Legalyze AI at any time without notice.
      </p>
    ),
  },
  {
    id: "links",
    title: "6. Links",
    icon: Link2,
    content: (
      <p>
        Legalyze AI has not reviewed all of the sites linked to its website
        and is not responsible for the contents of any such linked site. The
        inclusion of any link does not imply endorsement by Legalyze AI of the
        site. Use of any such linked website is at the user&apos;s own risk.
      </p>
    ),
  },
  {
    id: "modifications",
    title: "7. Modifications",
    icon: RefreshCw,
    content: (
      <p>
        Legalyze AI may revise these terms of service for Legalyze AI at any
        time without notice. By using this website, you are agreeing to be
        bound by the then current version of these terms of service.
      </p>
    ),
  },
  {
    id: "governing-law",
    title: "8. Governing Law",
    icon: Scale,
    content: (
      <p>
        These terms and conditions are governed by and construed in
        accordance with the laws of the jurisdiction in which Legalyze AI is
        located, and you irrevocably submit to the exclusive jurisdiction of
        the courts in that location.
      </p>
    ),
  },
  {
    id: "contact",
    title: "9. Contact Us",
    icon: Mail,
    content: (
      <p>
        If you have any questions about these Terms of Service, please contact
        us at{" "}
        <a
          href="mailto:support@legalyze.ai"
          className="text-blue-600 font-medium hover:underline"
        >
          support@legalyze.ai
        </a>
        .
      </p>
    ),
  },
];

const TermsPage = () => {
  return (
    <LegalPageLayout
      eyebrow="Legal"
      title="Terms of Service"
      description="The rules and guidelines for using Legalyze AI. Please read them carefully before using our document analysis service."
      heroIcon={FileText}
      lastUpdated="July 2, 2026"
      sections={sections}
    />
  );
};

export default TermsPage;
