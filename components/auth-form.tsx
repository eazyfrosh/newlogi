"use client";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { ArrowRight, LoaderCircle } from "lucide-react";
import { auth } from "@/lib/firebase-client";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    if (!auth) {
      setError(
        "Firebase is not configured. Add the public Firebase settings in .env.local to enable accounts.",
      );
      return;
    }
    setBusy(true);
    try {
      const credential =
        mode === "register"
          ? await createUserWithEmailAndPassword(auth, email, password)
          : await signInWithEmailAndPassword(auth, email, password);
      const idToken = await credential.user.getIdToken(true);
      const response = await fetch("/api/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken, name }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        setError(
          data?.error ??
            `The server returned HTTP ${response.status} while starting your session. Check Vercel Runtime Logs for /api/session.`,
        );
        return;
      }
      if (!data)
        throw new Error("The server returned an empty response while starting your session.");
      router.push(data.role === "customer" ? "/dashboard" : "/admin");
      router.refresh();
    } catch (e) {
      const code =
        typeof e === "object" && e && "code" in e
          ? String((e as { code: string }).code)
          : "";
      setError(
        e instanceof Error && e.message.includes("Firebase")
          ? e.message
          : code.includes("wrong-password") ||
              code.includes("invalid-credential")
            ? "Email or password is incorrect."
            : code.includes("email-already-in-use")
              ? "An account already exists for this email."
              : code.includes("weak-password")
                ? "Choose a password with at least 6 characters."
                : code.includes("network-request-failed")
                  ? "Could not reach Firebase. Check your connection and try again."
                  : "We couldn't sign you in. Check your details and try again.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <form className="auth-form" onSubmit={submit}>
      {mode === "register" && (
        <label>
          Full name
          <input
            required
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
          />
        </label>
      )}
      <label>
        Email address
        <input
          required
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
        />
      </label>
      <label>
        Password
        <input
          required
          minLength={6}
          type="password"
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="At least 6 characters"
        />
      </label>
      {error && (
        <p className="form-note form-error" role="alert">
          {error}
        </p>
      )}
      <button className="button button-dark auth-submit" disabled={busy}>
        {busy ? (
          <>
            <LoaderCircle className="spin" size={16} /> Please wait
          </>
        ) : (
          <>
            {mode === "login" ? "Sign in" : "Create account"}
            <ArrowRight size={16} />
          </>
        )}
      </button>
      <p className="auth-switch">
        {mode === "login" ? "New to NewLogi?" : "Already have an account?"}{" "}
        <Link href={mode === "login" ? "/register" : "/login"}>
          {mode === "login" ? "Create an account" : "Sign in"}
        </Link>
      </p>
    </form>
  );
}
