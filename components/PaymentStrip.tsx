const marks = ["Mastercard", "Visa", "PayFast", "Instant EFT"];

export function PaymentStrip() {
  return (
    <section className="payment-strip" aria-label="Payment methods">
      <ul>
        {marks.map((mark) => (
          <li key={mark} className={mark === "Visa" ? "visa" : ""}>
            {mark}
          </li>
        ))}
      </ul>
    </section>
  );
}
