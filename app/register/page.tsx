import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AuthForm } from "@/components/auth-form";
export default function RegisterPage() {
  return (
    <main className="auth-screen">
      <section className="auth-visual">
        <Link className="brand brand-light" href="/">
          <span className="brand-mark">N</span>
          <span>
            newlogi<span className="brand-dot">.</span>
          </span>
        </Link>
        <div>
          <span className="eyebrow eyebrow-orange">A CLEARER WAY TO MOVE</span>
          <h1>
            Make every
            <br />
            move count.
          </h1>
          <p>
            Create an account to bring shipments, requests, and updates together
            in one place.
          </p>
        </div>
      </section>
      <section className="auth-panel">
        <div className="auth-box">
          <Link className="auth-back" href="/">
            <ArrowLeft size={13} /> Back to NewLogi
          </Link>
          <h2>Let’s get started.</h2>
          <p>Create your customer workspace.</p>
          <AuthForm mode="register" />
        </div>
      </section>
    </main>
  );
}
