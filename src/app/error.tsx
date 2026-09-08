"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="container not-found">
      <h1>Sayfa şu anda yüklenemedi.</h1>
      <p>Lütfen yeniden deneyin.</p>
      <button className="button primary" onClick={reset}>
        Yeniden Dene
      </button>
    </div>
  );
}
