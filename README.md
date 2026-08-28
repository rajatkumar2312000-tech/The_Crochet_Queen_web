# The_Crochet_Queen_web

# The Crochet Queen 🧶

A modern, responsive, single-page e-commerce website for a handmade crochet
business — built as a **static site** (HTML, CSS, vanilla JavaScript only)
so it can be hosted for free on **GitHub Pages**. No backend, no database,
no build step.

Live user journey: Home → Shop Collection → Browse Products → Add to Cart →
Adjust Quantity → Go to Cart → Review Order → Enter Details → Place Order →
Order Confirmation — all without a single page reload.

---

## 1. Project structure

```
/
├── index.html          Page markup (hero, products, cart, checkout, modal)
├── css/
│   └── style.css       All styling (design tokens at the top of the file)
├── js/
│   └── script.js       Product data, cart logic, checkout, Web3Forms
├── images/             Put your own local product photos here (optional)
└── README.md           This file
```

---

## 2. Running it locally

No install step is required. Any of the following work:

- **Easiest:** double-click `index.html` to open it in your browser.
- **Recommended (avoids some browser quirks):** serve it locally, e.g.
  - With VS Code: install the "Live Server" extension and click "Go Live".
  - With Python installed: run `python3 -m http.server` in the project
    folder, then open `http://localhost:8000`.

---

## 3. Adding, editing, or removing products

Open `js/script.js` and find the `products` array near the top of the file
(clearly marked with a comment block). Each product is a plain object:

```js
{
  id: 9,
  name: "Crochet Sunflower Coaster",
  code: "CQ009",
  description: "A cheerful sunflower coaster made to order.",
  price: 549,
  image: "images/sunflower-coaster.jpg"
}
```

To **add** a product: copy one object, paste it at the end of the array,
give it a **unique `id`** (never reuse an existing id — the cart uses it to
tell products apart), and update the rest of the fields.

To **edit** a product: change the values directly in its object.

To **remove** a product: delete its object from the array.

The product grid, product cards, cart, checkout summary, and order email
are all generated automatically from this array — you never need to touch
the HTML.

---

## 4. Replacing images

Each product's `image` field can be:

- A local file path, e.g. `"images/tote-bag.jpg"` (put the actual image
  file inside the `images/` folder), or
- A remote URL, e.g. `"https://yourcdn.com/tote-bag.jpg"`.

The site currently ships with soft placeholder images (generated with
[placehold.co](https://placehold.co)) so you can see the layout before you
have real product photography. If any image URL ever fails to load, the
site automatically shows a graceful text fallback instead of a broken
image icon — the layout never breaks.

The hero banner image is set in `index.html` inside the `<section class="hero">`
block (`id="hero-image"`) — replace that `src` with your own photo.

For best results, use roughly square photos (1:1) for products, and a wide
landscape photo for the hero.

---

## 5. Configuring Web3Forms (order emails)

Orders are submitted using [Web3Forms](https://web3forms.com), a free
service that forwards form submissions to your email — no backend needed.

**Step 1 — Get a free Access Key**

1. Go to [web3forms.com](https://web3forms.com) and sign up (or just enter
   your email — no account required for the free tier).
2. Create a form and copy the **Access Key** it gives you.

**Step 2 — Add your key and email to the code**

Open `js/script.js` and find this block near the top:

```js
const WEB3FORMS_CONFIG = {
  accessKey: "YOUR_WEB3FORMS_ACCESS_KEY",
  receivingEmail: "YOUR_ORDER_RECEIVING_EMAIL@example.com",
  endpoint: "https://api.web3forms.com/submit"
};
```

Replace:

- `"YOUR_WEB3FORMS_ACCESS_KEY"` with the access key from Web3Forms.
- `"YOUR_ORDER_RECEIVING_EMAIL@example.com"` with the email address where
  you want to receive orders (this should match the email you used to
  create the Web3Forms access key).

That's it — no other code changes are needed. Every completed order will
arrive in that inbox with the customer's details and the full itemised
order (product name, code, quantity, price, subtotal, and grand total).

**⚠️ Important limitation of static sites**

Because this is a purely static site with no backend, the Web3Forms access
key **will be visible** to anyone who views the page source or the
JavaScript file — this is unavoidable on GitHub Pages. This is expected and
safe by design: a Web3Forms access key only allows submitting *new* form
entries to your inbox. It cannot be used to read your account, view past
submissions, or access anything else. Do not put any secret that needs to
stay private into a static frontend.

If you later need spam protection, Web3Forms supports adding hCaptcha or a
honeypot field — see their documentation for details.

---

## 6. How the cart & checkout work (technical overview)

- **Cart storage:** the cart is a simple array of `{ id, quantity }` objects,
  saved to the browser's `localStorage` under the key `crochetQueenCart`
  every time it changes. This means the cart survives page refreshes, but
  it is specific to one browser on one device — it is not a shared/synced
  account cart.
- **Quantities & totals:** all subtotals, item counts, and the grand total
  are recalculated live from the `products` array and the cart, so editing
  a price in `products` will immediately be reflected everywhere.
- **Checkout:** clicking "Go to Checkout" renders an order summary built
  directly from the current cart, then shows a form (name, contact number,
  email, delivery address) with basic client-side validation.
- **Placing an order:** on submit, the code builds a single plain-text
  message containing the customer's details and the full itemised order,
  and sends it to Web3Forms via `fetch()` as JSON. While the request is in
  flight, the "Place Order" button is disabled to prevent duplicate
  submissions.
- **Success:** a confirmation modal appears with the required message, the
  cart is cleared (including `localStorage`), and the form resets.
- **Failure:** (network issue, invalid access key, etc.) the cart is
  **not** cleared, a friendly error message is shown, and the customer can
  simply try again.

---

## 7. Deploying to GitHub Pages

1. Create a new repository on GitHub (e.g. `crochet-queen`).
2. Push this project's files to the repository:
   ```bash
   git init
   git add .
   git commit -m "Initial commit — The Crochet Queen"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/crochet-queen.git
   git push -u origin main
   ```
3. On GitHub, go to **Settings → Pages**.
4. Under **Build and deployment → Source**, choose **Deploy from a branch**.
5. Under **Branch**, choose `main` and folder `/ (root)`, then **Save**.
6. Wait a minute, then your site will be live at:
   `https://YOUR_USERNAME.github.io/crochet-queen/`

Remember to update `WEB3FORMS_CONFIG` (Section 5 above) **before** sharing
the live link, otherwise orders won't reach your inbox.

---

## 8. Accessibility & performance notes

- Semantic HTML (`<header>`, `<main>`, `<section>`, `<footer>`, proper
  heading order) and labelled form fields throughout.
- Visible keyboard focus states on all interactive elements.
- Respects `prefers-reduced-motion` for users who disable animations.
- Product images use `loading="lazy"` and fail gracefully if a URL breaks.

Enjoy — and happy crocheting! 🧵
