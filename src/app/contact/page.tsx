"use client";

import { useState, useRef } from "react";
import type React from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  ArrowLeft,
  Mail,
  MessageSquare,
  User,
  FileText,
  Send,
  Loader2,
  CheckCircle,
  AlertCircle,
  Clock,
  Github,
  Linkedin,
  Globe,
  Twitter,
} from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { PageWrapper } from "@/components/ui/PageWrapper";

const SOCIALS = [
  { name: "GitHub", icon: Github, href: "https://github.com/AbdulSamad94" },
  {
    name: "LinkedIn",
    icon: Linkedin,
    href: "https://www.linkedin.com/in/abdul-samad-siddiqui-d3v/",
  },
  { name: "X", icon: Twitter, href: "https://x.com/abdulsamad77870" },
  {
    name: "Portfolio",
    icon: Globe,
    href: "https://abdulsamadsiddiqui.vercel.app/",
  },
];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type FieldErrors = Partial<Record<"name" | "email" | "subject" | "message", string>>;

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const subjectRef = useRef<HTMLInputElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);

  const validate = (): FieldErrors => {
    const next: FieldErrors = {};
    if (!name.trim()) next.name = "Please enter your name.";
    if (!email.trim()) next.email = "Please enter your email address.";
    else if (!EMAIL_REGEX.test(email)) next.email = "Please enter a valid email address.";
    if (!subject.trim()) next.subject = "Please enter a subject.";
    if (!message.trim()) next.message = "Please enter a message.";
    else if (message.trim().length < 10) next.message = "Please provide a bit more detail (at least 10 characters).";
    return next;
  };

  const handleBlur = (field: keyof FieldErrors) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors(validate());
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const validationErrors = validate();
    setErrors(validationErrors);
    setTouched({ name: true, email: true, subject: true, message: true });

    if (Object.keys(validationErrors).length > 0) {
      if (validationErrors.name) nameRef.current?.focus();
      else if (validationErrors.email) emailRef.current?.focus();
      else if (validationErrors.subject) subjectRef.current?.focus();
      else if (validationErrors.message) messageRef.current?.focus();
      return;
    }

    setLoading(true);
    setStatus("idle");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, subject, message }),
      });

      if (res.ok) {
        setStatus("success");
        setName("");
        setEmail("");
        setSubject("");
        setMessage("");
        setTouched({});
        setErrors({});
      } else {
        setStatus("error");
      }
    } catch (err) {
      console.error(err);
      setStatus("error");
    } finally {
      setLoading(false);
    }
  }

  const fieldClass = (hasError: boolean) =>
    `block w-full pl-10 pr-3 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 text-sm sm:text-base text-slate-900 bg-slate-50 focus:bg-white ${
      hasError
        ? "border-red-300 focus:ring-red-500"
        : "border-slate-200 focus:ring-blue-500"
    }`;

  return (
    <PageWrapper>
      <Header />

      <main className="pt-24 pb-16">
        {/* Hero */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors mb-6"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl sm:rounded-3xl p-6 sm:p-10 lg:p-12 text-white shadow-2xl"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/20 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0">
                <MessageSquare className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
              </div>
              <span className="uppercase tracking-wide text-xs sm:text-sm font-semibold text-blue-100">
                Get in Touch
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3">
              Contact Us
            </h1>
            <p className="text-blue-100 text-base sm:text-lg max-w-2xl leading-relaxed">
              Questions, feedback, or a partnership idea? Send us a message and
              we&apos;ll get back to you as soon as we can.
            </p>
          </motion.div>
        </div>

        {/* Content */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 lg:mt-10 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 lg:gap-8 items-start">
          {/* Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.4 }}
            className="bg-white rounded-2xl border border-slate-200/70 shadow-sm p-6 sm:p-8"
          >
            <AnimatePresence mode="wait">
              {status === "success" ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="text-center py-10"
                  role="status"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.15, type: "spring", stiffness: 400, damping: 25 }}
                    className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4"
                  >
                    <CheckCircle className="h-8 w-8 text-emerald-600" />
                  </motion.div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">
                    Message sent!
                  </h2>
                  <p className="text-slate-600 max-w-sm mx-auto mb-6">
                    Thanks for reaching out — we typically reply within 24-48
                    hours.
                  </p>
                  <button
                    type="button"
                    onClick={() => setStatus("idle")}
                    className="text-blue-600 font-medium hover:underline cursor-pointer"
                  >
                    Send another message
                  </button>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleSubmit}
                  noValidate
                  className="space-y-5"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label htmlFor="contact-name" className="block text-sm font-semibold text-slate-700 mb-1.5">
                        Name <span className="text-blue-500">*</span>
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" aria-hidden="true" />
                        <input
                          id="contact-name"
                          ref={nameRef}
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          onBlur={() => handleBlur("name")}
                          aria-invalid={Boolean(touched.name && errors.name)}
                          aria-describedby={touched.name && errors.name ? "contact-name-error" : undefined}
                          className={fieldClass(Boolean(touched.name && errors.name))}
                          placeholder="Jane Doe"
                        />
                      </div>
                      {touched.name && errors.name && (
                        <p id="contact-name-error" role="alert" className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                          <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                          {errors.name}
                        </p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="contact-email" className="block text-sm font-semibold text-slate-700 mb-1.5">
                        Email <span className="text-blue-500">*</span>
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" aria-hidden="true" />
                        <input
                          id="contact-email"
                          ref={emailRef}
                          type="email"
                          autoComplete="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          onBlur={() => handleBlur("email")}
                          aria-invalid={Boolean(touched.email && errors.email)}
                          aria-describedby={touched.email && errors.email ? "contact-email-error" : undefined}
                          className={fieldClass(Boolean(touched.email && errors.email))}
                          placeholder="jane@example.com"
                        />
                      </div>
                      {touched.email && errors.email && (
                        <p id="contact-email-error" role="alert" className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                          <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                          {errors.email}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="contact-subject" className="block text-sm font-semibold text-slate-700 mb-1.5">
                      Subject <span className="text-blue-500">*</span>
                    </label>
                    <div className="relative">
                      <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" aria-hidden="true" />
                      <input
                        id="contact-subject"
                        ref={subjectRef}
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        onBlur={() => handleBlur("subject")}
                        aria-invalid={Boolean(touched.subject && errors.subject)}
                        aria-describedby={touched.subject && errors.subject ? "contact-subject-error" : undefined}
                        className={fieldClass(Boolean(touched.subject && errors.subject))}
                        placeholder="What's this about?"
                      />
                    </div>
                    {touched.subject && errors.subject && (
                      <p id="contact-subject-error" role="alert" className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                        {errors.subject}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="contact-message" className="block text-sm font-semibold text-slate-700 mb-1.5">
                      Message <span className="text-blue-500">*</span>
                    </label>
                    <div className="relative">
                      <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-slate-400" aria-hidden="true" />
                      <textarea
                        id="contact-message"
                        ref={messageRef}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onBlur={() => handleBlur("message")}
                        rows={5}
                        aria-invalid={Boolean(touched.message && errors.message)}
                        aria-describedby={touched.message && errors.message ? "contact-message-error" : undefined}
                        className={`${fieldClass(Boolean(touched.message && errors.message))} resize-none`}
                        placeholder="Tell us how we can help..."
                      />
                    </div>
                    {touched.message && errors.message && (
                      <p id="contact-message-error" role="alert" className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                        {errors.message}
                      </p>
                    )}
                  </div>

                  <AnimatePresence>
                    {status === "error" && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        role="alert"
                        aria-live="polite"
                        className="flex items-center gap-2 p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700"
                      >
                        <AlertCircle className="h-4 w-4 flex-shrink-0" />
                        <p className="text-sm font-medium">
                          Something went wrong sending your message. Please try again.
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    type="submit"
                    disabled={loading}
                    className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <Send className="h-5 w-5" />
                        <span>Send Message</span>
                      </>
                    )}
                  </motion.button>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Info sidebar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.4, delay: 0.05 }}
            className="space-y-6"
          >
            <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <Clock className="h-5 w-5 text-blue-600" aria-hidden="true" />
                </div>
                <h2 className="text-lg font-bold text-slate-900">Response Time</h2>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed">
                We aim to reply to every message within 24-48 hours. For bug
                reports, use the bug icon in the corner of any page for the
                fastest response.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <Globe className="h-5 w-5 text-blue-600" aria-hidden="true" />
                </div>
                <h2 className="text-lg font-bold text-slate-900">Connect</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {SOCIALS.map((social) => (
                  <Link
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.name}
                    title={social.name}
                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition-all cursor-pointer"
                  >
                    <social.icon className="h-5 w-5" />
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </PageWrapper>
  );
}
