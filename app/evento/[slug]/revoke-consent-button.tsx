"use client";

import { revokeConsent } from "./actions";

export function RevokeConsentButton({ eventSlug }: { eventSlug: string }) {
  return (
    <form
      action={revokeConsent}
      onSubmit={(event) => {
        const confirmed = window.confirm(
          "Revogar seu consentimento? Você perderá o acesso ao evento até aceitar os termos novamente.",
        );

        if (!confirmed) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="eventSlug" value={eventSlug} />
      <button
        type="submit"
        className="rounded-xl px-3 py-2 text-sm font-semibold text-red-300/70 transition hover:bg-red-400/8 hover:text-red-200"
      >
        Revogar consentimento
      </button>
    </form>
  );
}
