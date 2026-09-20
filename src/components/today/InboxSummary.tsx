import { ArrowRight, Inbox } from "lucide-react";
import { useNavigate } from "react-router-dom";

type InboxSummaryProps = {
  count: number;
};

export function InboxSummary({ count }: InboxSummaryProps) {
  const navigate = useNavigate();

  return (
    <section className="mt-7 pb-4">
      <div className="rounded-2xl border border-gray-200 bg-white p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100">
            <Inbox size={20} className="text-gray-700" />
          </div>

          <div className="flex-1">
            <p className="font-semibold text-gray-900">
              {count === 0
                ? "Inbox en orden"
                : `${count} ${count === 1 ? "cosa por organizar" : "cosas por organizar"}`}
            </p>

            <p className="mt-1 text-sm text-gray-500">
              {count === 0
                ? "No tienes nada pendiente por organizar."
                : "Revisa lo que has capturado y decide qué hacer con ello."}
            </p>

            {count > 0 && (
              <button
                type="button"
                onClick={() => navigate("/inbox")}
                className="mt-4 inline-flex h-10 items-center gap-2 rounded-xl bg-gray-900 px-4 text-sm font-semibold text-white"
              >
                Organizar Inbox
                <ArrowRight size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
