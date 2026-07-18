import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Star, Trash2 } from "lucide-react";

export const Route = createFileRoute("/account/addresses")({
  head: () => ({
    meta: [
      { title: "Saved Addresses — House Of Kanti" },
      { name: "description", content: "Manage delivery addresses for your House Of Kanti orders." },
      { name: "robots", content: "noindex, follow" },
      { property: "og:title", content: "Saved Addresses — House Of Kanti" },
      { property: "og:description", content: "Manage your House Of Kanti delivery addresses." },
    ],
    links: [{ rel: "canonical", href: "https://houseofkanti.ai.studio/account/addresses" }],
  }),
  component: AddressesPage,
});

type Address = {
  id: string;
  label: string | null;
  full_name: string;
  phone: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  pincode: string;
  is_default: boolean;
};

const empty = {
  label: "Home",
  full_name: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  pincode: "",
  is_default: false,
};

function AddressesPage() {
  const { user } = useAuth();
  const [list, setList] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(empty);

  async function load() {
    if (!user) return;
    const { data } = await supabase
      .from("addresses")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setList((data ?? []) as Address[]);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    const { error } = await supabase.from("addresses").insert({ ...form, user_id: user.id });
    if (error) return toast.error(error.message);
    toast.success("Address added");
    setForm(empty);
    setShowForm(false);
    load();
  }

  async function remove(id: string) {
    await supabase.from("addresses").delete().eq("id", id);
    load();
  }

  async function setDefault(id: string) {
    await supabase.from("addresses").update({ is_default: true }).eq("id", id);
    load();
  }

  if (loading) return <div className="text-muted-foreground">Loading…</div>;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-700 text-foreground">Saved addresses</h2>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" /> Add new
          </button>
        )}
      </div>

      {showForm && (
        <form
          onSubmit={save}
          className="rounded-3xl border border-border/60 bg-card p-6 shadow-card"
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              placeholder="Label (Home, Work)"
              value={form.label ?? ""}
              onChange={(v) => setForm({ ...form, label: v })}
            />
            <Input
              placeholder="Full name"
              required
              value={form.full_name}
              onChange={(v) => setForm({ ...form, full_name: v })}
            />
            <Input
              placeholder="Phone"
              required
              value={form.phone}
              onChange={(v) => setForm({ ...form, phone: v })}
            />
            <Input
              placeholder="Pincode"
              required
              value={form.pincode}
              onChange={(v) => setForm({ ...form, pincode: v })}
            />
            <Input
              className="sm:col-span-2"
              placeholder="Address line 1"
              required
              value={form.line1}
              onChange={(v) => setForm({ ...form, line1: v })}
            />
            <Input
              className="sm:col-span-2"
              placeholder="Address line 2 (optional)"
              value={form.line2 ?? ""}
              onChange={(v) => setForm({ ...form, line2: v })}
            />
            <Input
              placeholder="City"
              required
              value={form.city}
              onChange={(v) => setForm({ ...form, city: v })}
            />
            <Input
              placeholder="State"
              required
              value={form.state}
              onChange={(v) => setForm({ ...form, state: v })}
            />
          </div>
          <label className="mt-4 flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.is_default}
              onChange={(e) => setForm({ ...form, is_default: e.target.checked })}
            />
            Set as default
          </label>
          <div className="mt-5 flex gap-3">
            <button className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
              Save address
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-full border border-border px-5 py-2 text-sm font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {list.length === 0 && !showForm ? (
        <div className="rounded-3xl border border-dashed border-border/80 bg-card p-12 text-center text-sm text-muted-foreground">
          No saved addresses yet.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {list.map((a) => (
            <article
              key={a.id}
              className="relative rounded-2xl border border-border/60 bg-card p-5 shadow-card"
            >
              {a.is_default && (
                <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-accent px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-accent-foreground">
                  <Star className="h-3 w-3" /> Default
                </span>
              )}
              <div className="text-xs font-semibold uppercase tracking-wider text-terracotta">
                {a.label || "Address"}
              </div>
              <div className="mt-2 font-display text-lg font-700 text-foreground">
                {a.full_name}
              </div>
              <div className="mt-1 text-sm text-muted-foreground">
                {a.line1}
                {a.line2 ? `, ${a.line2}` : ""}
                <br />
                {a.city}, {a.state} — {a.pincode}
                <br />
                {a.phone}
              </div>
              <div className="mt-4 flex gap-2">
                {!a.is_default && (
                  <button
                    onClick={() => setDefault(a.id)}
                    className="rounded-full border border-border px-3 py-1.5 text-xs font-medium hover:border-primary/40 hover:text-primary"
                  >
                    Set default
                  </button>
                )}
                <button
                  onClick={() => remove(a.id)}
                  className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/5"
                >
                  <Trash2 className="h-3 w-3" /> Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

function Input({
  className = "",
  value,
  onChange,
  ...rest
}: { value: string; onChange: (v: string) => void; className?: string } & Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "value" | "onChange"
>) {
  return (
    <input
      {...rest}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`block w-full rounded-lg border border-border bg-transparent px-3.5 py-2.5 text-sm outline-none focus:border-primary ${className}`}
    />
  );
}
