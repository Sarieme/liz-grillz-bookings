import type { Metadata } from "next";
import { Suspense } from "react";
import AuthForm from "./AuthForm";

export const metadata: Metadata = {
  title: "Account Access & Registration",
  description: "Sign in or register your Liz's Grillz catering organizer account.",
};

export default function AuthPage() {
  return (
    <div
      style={{
        maxWidth: "32rem",
        margin: "0 auto",
        padding: "2.5rem 1.25rem",
      }}
    >
      <Suspense fallback={<div style={{ textAlign: "center", padding: "2rem" }}>Loading account access...</div>}>
        <AuthForm />
      </Suspense>
    </div>
  );
}

