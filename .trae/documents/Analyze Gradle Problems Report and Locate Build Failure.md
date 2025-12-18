* Change per-shift amount to compute `hours * rate` and round the final value to 2 decimals, matching `totalPay`.

* Use `convertNumberToStringThenToNumber` on the product and display with `.toFixed(2)`.

* Keep `hours worked` display at 2 decimals but avoid using rounded hours for pay calculation.

