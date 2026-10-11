"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  Calendar,
  CheckCircle2,
  Radio,
  Send,
  Sparkles,
  Video,
} from "lucide-react";
import LoginComponent from "@/components/auth/login";
import { Badge } from "@/components/ui/badge";
import SmoothButton from "@/components/smoothui/smooth-button";

const hasAuthCodeInUrl = (): boolean => {
  if (typeof window === "undefined") return false;
  return (
    window.location.search.includes("code=") ||
    window.location.search.includes("descope-login-flow=")
  );
};

const LoginPage = () => {
  const [hasCode, setHasCode] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [contactName, setContactName] = useState("");
  const [contactMessage, setContactMessage] = useState("");

  useEffect(() => {
    if (hasAuthCodeInUrl()) {
      setHasCode(true);
    }
  }, []);

  if (hasCode) {
    return <LoginComponent />;
  }

  const handleNavClick = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactMessage.trim()) return;
    setContactSubmitted(true);
    setContactName("");
    setContactMessage("");
  };


  const renderNavbar = () => {
    return (
      <nav className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-white/15 bg-black/85 px-6 backdrop-blur-md md:px-12">
        <motion.div
          className="flex items-center gap-3 cursor-pointer"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <div className="flex size-9 items-center justify-center rounded-xl border border-periwinkle/40 bg-periwinkle/15 text-periwinkle shadow-md shadow-periwinkle/10">
            <Radio className="size-4" />
          </div>
          <span className="text-base font-bold tracking-wider text-white">
            ORBIT
          </span>
        </motion.div>

        <div className="hidden items-center gap-8 text-xs font-medium text-white/70 md:flex">
          <motion.button
            type="button"
            onClick={() => handleNavClick("features")}
            whileHover={{ y: -2, color: "#ffffff" }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            className="cursor-pointer transition-colors hover:text-white"
          >
            Features
          </motion.button>
          <motion.button
            type="button"
            onClick={() => handleNavClick("workflow")}
            whileHover={{ y: -2, color: "#ffffff" }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            className="cursor-pointer transition-colors hover:text-white"
          >
            Workflow
          </motion.button>
          <motion.button
            type="button"
            onClick={() => handleNavClick("contact")}
            whileHover={{ y: -2, color: "#ffffff" }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            className="cursor-pointer transition-colors hover:text-white"
          >
            Contact
          </motion.button>
        </div>

        <div className="flex items-center gap-3">
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
            <SmoothButton
              variant="outline"
              color="neutral"
              size="sm"
              onClick={() => setAuthModalOpen(true)}
              className="rounded-xl border border-white/20 bg-white/[0.05] text-xs font-medium text-white hover:border-white/35 hover:bg-white/10"
            >
              Sign in
            </SmoothButton>
          </motion.div>
        </div>
      </nav>
    );
  };

  const renderHeroSection = () => {
    return (
      <section className="relative flex min-h-[calc(100vh-4rem)] w-full flex-col items-center justify-center px-6 py-20 text-center md:px-12">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-6">
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <Badge
              variant="secondary"
              className="rounded-full border border-periwinkle/40 bg-periwinkle/15 px-3.5 py-1 text-xs font-medium text-periwinkle shadow-sm shadow-periwinkle/10"
            >
              <Sparkles className="mr-1.5 size-3.5" />
              Autonomous Schedule Intelligence
            </Badge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
            className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl sm:leading-tight"
          >
            Schedule Planning for High-Output Teams
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            className="max-w-xl text-sm leading-relaxed text-white/70 sm:text-base"
          >
            Connect your calendar to schedule meetings, plan events, detect agenda conflicts, and generate instant video meeting links with an intelligent assistant built for flow.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
            className="flex flex-wrap items-center justify-center gap-3 pt-4"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <SmoothButton
                variant="solid"
                color="accent"
                size="lg"
                shape="pill"
                onClick={() => setAuthModalOpen(true)}
                prefix={<Sparkles className="size-4" />}
                className="rounded-full bg-periwinkle px-7 text-sm font-semibold text-black hover:bg-periwinkle/90 shadow-xl shadow-periwinkle/20"
              >
                Get Started
              </SmoothButton>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <SmoothButton
                variant="outline"
                color="neutral"
                size="lg"
                shape="pill"
                onClick={() => handleNavClick("features")}
                className="rounded-full border border-white/20 bg-white/[0.05] px-6 text-sm text-white hover:border-white/35 hover:bg-white/10"
              >
                Learn More
              </SmoothButton>
            </motion.div>
          </motion.div>
        </div>
      </section>
    );
  };

  const renderFeaturesSection = () => {
    return (
      <motion.section
        id="features"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full border-t border-white/15 bg-zinc-950/40 px-6 py-24 md:px-12"
      >
        <div className="mx-auto flex max-w-5xl flex-col gap-14">
          <div className="flex flex-col items-center text-center gap-3">
            <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Engineered for Calendar Harmony
            </h2>
            <p className="max-w-lg text-xs leading-relaxed text-white/70">
              Autonomous calendar scheduling, conflict resolution, and video meeting coordination.
            </p>
          </div>

          <div className="grid grid-cols-1 divide-y divide-white/10 border-y border-white/10 sm:grid-cols-3 sm:divide-y-0 sm:divide-x">
            <div className="flex flex-col gap-3.5 py-6 sm:px-6 sm:first:pl-0 sm:last:pr-0">
              <div className="flex size-10 items-center justify-center rounded-xl border border-periwinkle/40 bg-periwinkle/15 text-periwinkle">
                <Calendar className="size-5" />
              </div>
              <h3 className="text-base font-semibold text-white">
                Calendar Sync
              </h3>
              <p className="text-xs text-white/70 leading-relaxed">
                Connect your calendar to inspect schedules, find free slots, book new events, and reschedule appointments effortlessly.
              </p>
            </div>

            <div className="flex flex-col gap-3.5 py-6 sm:px-6 sm:first:pl-0 sm:last:pr-0">
              <div className="flex size-10 items-center justify-center rounded-xl border border-blue-400/40 bg-blue-500/15 text-blue-400">
                <Video className="size-5" />
              </div>
              <h3 className="text-base font-semibold text-white">
                Meeting Spaces
              </h3>
              <p className="text-xs text-white/70 leading-relaxed">
                Automatic video conference room creation with secure meeting links attached directly to your scheduled events.
              </p>
            </div>

            <div className="flex flex-col gap-3.5 py-6 sm:px-6 sm:first:pl-0 sm:last:pr-0">
              <div className="flex size-10 items-center justify-center rounded-xl border border-lime/40 bg-lime/15 text-lime">
                <Sparkles className="size-5" />
              </div>
              <h3 className="text-base font-semibold text-white">
                Smart Scheduling
              </h3>
              <p className="text-xs text-white/70 leading-relaxed">
                Conversational assistant that understands your priorities, avoids double-bookings, and protects deep focus time.
              </p>
            </div>
          </div>
        </div>
      </motion.section>
    );
  };

  const renderWorkflowSection = () => {
    return (
      <motion.section
        id="workflow"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full border-t border-white/15 px-6 py-24 md:px-12"
      >
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-14 text-center">
          <div className="flex flex-col items-center gap-3">
            <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              How Orbit Works
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3 text-left">
            <div className="flex flex-col gap-2.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-periwinkle">Connect</span>
              <h3 className="text-sm font-semibold text-white">Link Your Calendar</h3>
              <p className="text-xs text-white/70 leading-relaxed">
                Link your calendar in seconds to give Orbit secure access to your availability and schedule.
              </p>
            </div>

            <div className="flex flex-col gap-2.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-periwinkle">Instruct</span>
              <h3 className="text-sm font-semibold text-white">Direct Your Assistant</h3>
              <p className="text-xs text-white/70 leading-relaxed">
                Prompt Orbit to summarize your day, check team availability, schedule events, or resolve overlaps.
              </p>
            </div>

            <div className="flex flex-col gap-2.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-periwinkle">Execute</span>
              <h3 className="text-sm font-semibold text-white">Instant Coordination</h3>
              <p className="text-xs text-white/70 leading-relaxed">
                Watch Orbit coordinate events in real time, generate meeting links, and confirm updates directly on your calendar.
              </p>
            </div>
          </div>
        </div>
      </motion.section>
    );
  };

  const renderContactFormView = () => {
    return (
      <form onSubmit={handleContactSubmit} className="flex w-full flex-col gap-4 text-left">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-white/85">
            Name
          </label>
          <input
            type="text"
            required
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
            placeholder="Your full name"
            className="rounded-xl border border-white/20 bg-white/[0.05] px-3.5 py-2.5 text-xs text-white placeholder:text-white/40 transition-colors focus:border-periwinkle/60 focus:bg-white/[0.08] focus:outline-none"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-white/85">
            Message
          </label>
          <textarea
            required
            rows={4}
            value={contactMessage}
            onChange={(e) => setContactMessage(e.target.value)}
            placeholder="How can we help your team?"
            className="rounded-xl border border-white/20 bg-white/[0.05] px-3.5 py-2.5 text-xs text-white placeholder:text-white/40 transition-colors focus:border-periwinkle/60 focus:bg-white/[0.08] focus:outline-none resize-none"
          />
        </div>

        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <SmoothButton
            type="submit"
            variant="solid"
            color="accent"
            prefix={<Send className="size-3.5" />}
            className="mt-2 w-full justify-center rounded-xl bg-periwinkle text-xs font-semibold text-black hover:bg-periwinkle/90"
          >
            Send Message
          </SmoothButton>
        </motion.div>
      </form>
    );
  };

  const renderContactSuccessView = () => {
    return (
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex w-full flex-col items-center gap-3 rounded-2xl border border-lime/40 bg-lime/10 p-6 text-center"
      >
        <CheckCircle2 className="size-6 text-lime" />
        <span className="text-sm font-medium text-white">
          Message Received
        </span>
        <p className="text-xs text-white/70">
          Thank you for contacting us. We will review your message shortly.
        </p>
      </motion.div>
    );
  };

  const renderContactSection = () => {
    return (
      <motion.section
        id="contact"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full border-t border-white/15 bg-zinc-950/40 px-6 py-24 md:px-12"
      >
        <div className="mx-auto flex max-w-xl flex-col items-center gap-8 text-center">
          <div className="flex flex-col items-center gap-2">
            <h2 className="text-2xl font-bold text-white sm:text-3xl">
              Contact Us
            </h2>
            <p className="text-xs text-white/70">
              Send us a direct inquiry or feedback and our team will get back to you.
            </p>
          </div>

          <div className="w-full rounded-2xl border border-white/20 bg-zinc-950/80 p-7 shadow-lg shadow-black/40">
            {contactSubmitted ? renderContactSuccessView() : renderContactFormView()}
          </div>
        </div>
      </motion.section>
    );
  };

  const renderAuthModal = () => {
    return (
      <LoginComponent
        open={authModalOpen}
        onOpenChange={setAuthModalOpen}
      />
    );
  };

  return (
    <div className="min-h-screen w-full bg-black text-white selection:bg-periwinkle selection:text-black">
      {renderNavbar()}
      {renderHeroSection()}
      {renderFeaturesSection()}
      {renderWorkflowSection()}
      {renderContactSection()}
      {renderAuthModal()}
    </div>
  );
};

export default LoginPage;
