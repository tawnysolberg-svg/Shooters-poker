"use client";

import { useEffect, useState } from "react";

export default function RulesPage() {
  const [content, setContent] = useState("");
  const [updatedAt, setUpdatedAt] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/rules", { cache: "no-store" });
    const json = await res.json();
    setContent(json.houseRules.content);
    setUpdatedAt(json.houseRules.updatedAt);
    setDraft(json.houseRules.content);
  }

  useEffect(() => {
    load();
    fetch("/api/admin/auth")
      .then((r) => r.json())
      .then((j) => setIsAdmin(Boolean(j.authenticated)))
      .catch(() => {});
  }, []);

  async function save() {
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/rules", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: draft }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed");
      setContent(json.houseRules.content);
      setUpdatedAt(json.houseRules.updatedAt);
      setEditing(false);
      setMsg("Rules updated");
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Error");
    } finally {
      setBusy(false);
    }
  }

  const sections = content.split(/\n(?=\d+\.\s)/).filter(Boolean);

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="page-title">House Rules</h1>
          <p className="mt-1 text-sm text-cream-muted">Shooters Poker Room</p>
        </div>
        {isAdmin && !editing && (
          <button type="button" className="btn-secondary text-sm py-2 px-3" onClick={() => setEditing(true)}>
            Edit
          </button>
        )}
      </div>

      {msg && (
        <div className="rounded-xl bg-felt-mid border border-felt-light px-4 py-3 text-sm">{msg}</div>
      )}

      {editing ? (
        <div className="space-y-3">
          <textarea
            className="input min-h-[420px] font-mono text-sm leading-relaxed"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
          />
          <div className="flex gap-2">
            <button type="button" className="btn-ghost flex-1" onClick={() => setEditing(false)}>
              Cancel
            </button>
            <button type="button" className="btn-primary flex-1" disabled={busy} onClick={save}>
              {busy ? "Saving…" : "Save rules"}
            </button>
          </div>
        </div>
      ) : (
        <article className="card space-y-4 prose-invert">
          {sections.map((sec, i) => {
            const lines = sec.trim().split("\n");
            const title = lines[0];
            const body = lines.slice(1).join("\n").trim();
            return (
              <section key={i}>
                <h2 className="text-base font-bold text-gold mb-1.5">{title}</h2>
                {body && (
                  <p className="text-sm text-cream-muted leading-relaxed whitespace-pre-wrap">
                    {body}
                  </p>
                )}
              </section>
            );
          })}
          {updatedAt && (
            <p className="text-xs text-cream-dim pt-2 border-t border-charcoal-light">
              Updated {new Date(updatedAt).toLocaleString()}
            </p>
          )}
        </article>
      )}
    </div>
  );
}
