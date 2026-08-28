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
        className="min-h-12 rounded-xl px-5 font-semibold text-red-300 transition hover:bg-red-400/10 hover:text-red-200"
      >
        Revogar consentimento
      </button>
    </form>
  );
}
