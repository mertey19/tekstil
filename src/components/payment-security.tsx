export function PaymentSecurity({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`payment-security${compact ? " compact" : ""}`} aria-label="Güvenli ödeme yöntemleri">
      <div className="payment-security-copy">
        <strong>Güvenli ödeme</strong>
        <span>Ödemeler iyzico altyapısıyla işlenir. Kart bilgileriniz sitemizde tutulmaz.</span>
      </div>
      <div className="payment-brands" aria-label="iyzico, Visa ve Mastercard">
        <span className="payment-brand iyzico-brand" aria-label="iyzico ile öde">iyzico ile öde</span>
        <span className="payment-brand visa-brand" aria-label="Visa">VISA</span>
        <span className="payment-brand mastercard-brand" aria-label="Mastercard">
          <i aria-hidden="true" /><i aria-hidden="true" />
          <b>mastercard</b>
        </span>
      </div>
    </div>
  );
}
