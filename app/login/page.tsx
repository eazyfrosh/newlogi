import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AuthForm } from "@/components/auth-form";
export default function LoginPage() {
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
          <span className="eyebrow eyebrow-orange">
            YOUR BUSINESS, IN GOOD HANDS
          </span>
          <h1>
            Keep your
            <br />
            shipments in view.
          </h1>
          <p>
            Sign in to review shipment updates, request a pickup, or connect
            with our team.
          </p>
        </div>
      </section>
      <section className="auth-panel">
        <div className="auth-box">
          <Link className="auth-back" href="/">
            <ArrowLeft size={13} /> Back to NewLogi
          </Link>
          <h2>Welcome back.</h2>
          <p>Sign in to your NewLogi workspace.</p>
          <AuthForm mode="login" />
        </div>
      </section>
    </main>
  );
}
