const ARTISTS = [
  ["Emily", "3m_ink"],
  ["Kyoka", "kyo.ca_tattoo"],
  ["Ayu", "maoayu_tattoo"],
  ["Yan", "y.a.n_tattoo"],
  ["Tomoko", "tmkoo.tattoo"],
  ["Sara", "rintattoos_"],
  ["Fuu", "fuu.tattoo"],
  ["Renee", "renee.nini_tattoo"],
  ["Gia", "dynam1tegirl"],
  ["Kou", "ikueiyi"],
  ["Pooja", "ink.pooja"],
  ["Ao", "ao_tattoo_ink"],
  ["Hisong", "hisong_tattoo"],
  ["Tiemi", "tiemi.tattoo"],
  ["Ayuri", "ayuri.tattoo"],
  ["Umar", "umarberat"],
  ["Or", "bubble_caat"]
];

const form = document.getElementById("booking");
const error = document.getElementById("error");
const success = document.getElementById("success");
const policy = form.querySelector('[data-slide="policy"]');
let index = 0;

function slides() {
  return [...form.querySelectorAll("[data-slide]")];
}

function artistChips(container, group) {
  container.replaceChildren();
  ARTISTS.forEach(([name, handle], i) => {
    const label = document.createElement("label");
    label.className = "chip";
    const input = document.createElement("input");
    input.type = "checkbox";
    input.name = group;
    input.value = name + " (" + handle + ")";
    label.append(input, document.createTextNode(name + " "));
    const small = document.createElement("small");
    small.textContent = handle;
    label.append(small);
    container.append(label);
    input.id = group + "-" + i;
  });
}

function bindFiles(slide) {
  const input = slide.querySelector('input[type="file"]');
  const list = slide.querySelector("[data-files]");
  if (!input || !list || input.dataset.bound) return;
  input.dataset.bound = "1";
  input.addEventListener("change", () => {
    const next = new DataTransfer();
    const messages = [];
    [...input.files].forEach((file) => {
      if (next.files.length >= 20) {
        messages.push("You can attach up to 20 files.");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        messages.push(file.name + " is over 5 MB.");
        return;
      }
      next.items.add(file);
    });
    input.files = next.files;
    list.replaceChildren();
    [...next.files].forEach((file) => {
      const li = document.createElement("li");
      li.textContent = file.name;
      list.append(li);
    });
    if (messages.length) showError(messages[0]);
  });
}

function showError(message) {
  error.hidden = !message;
  error.textContent = message || "";
}

function show(next) {
  const all = slides();
  all.forEach((slide, i) => {
    const on = i === next;
    slide.hidden = !on;
    slide.classList.toggle("is-active", on);
  });
  index = next;
  const total = all.length;
  document.getElementById("step-count").textContent = (index + 1) + " / " + total;
  document.getElementById("bar").style.width = ((index + 1) / total * 100) + "%";
  document.getElementById("back").hidden = index === 0;
  const nextBtn = document.getElementById("next");
  const last = index === total - 1;
  nextBtn.disabled = false;
  nextBtn.textContent = last ? "Submit" : "Next";
  showError("");
  const field = all[index].querySelector("input, textarea");
  if (field) field.focus({ preventScroll: true });
}

function checked(slide, name) {
  return slide.querySelector(`input[name="${name}"]:checked`) || slide.querySelector(`input[name^="${name}-"]:checked`);
}

function validate(slide) {
  const kind = slide.dataset.slide;
  if (kind === "contact") {
    const first = slide.querySelector('[name="firstName"]');
    const last = slide.querySelector('[name="lastName"]');
    const email = slide.querySelector('[name="email"]');
    if (!first.value.trim() || !last.value.trim()) return "Enter the contact person's first and last name.";
    if (!email.checkValidity() || !email.value.trim()) return "Enter a valid email.";
  }
  if (kind === "availability" && !slide.querySelector('[name="availability"]').value.trim()) {
    return "List your availability and the dates you prefer.";
  }
  if (kind === "client" || kind === "extra") {
    if (!checked(slide, "who")) return "Choose who will get this tattoo.";
    if (!slide.querySelector('[name="clientFirst"]').value.trim() || !slide.querySelector('[name="clientLast"]').value.trim()) {
      return "Enter the client's first and last name.";
    }
  }
  if (kind === "tattoo" || kind === "extra") {
    const size = slide.querySelector('[name="size"]');
    if (!size.value || Number(size.value) <= 0) return "Enter an approximate size in centimetres.";
  }
  if (kind === "extra" && !slide.querySelector('[name="description"]').value.trim()) {
    return "Describe this tattoo.";
  }
  if ((kind === "artist" || kind === "extra") && !checked(slide, "another")) {
    return "Choose whether this is the only tattoo.";
  }
  if (kind === "policy") {
    if (!slide.querySelector('[name="privacy"]').checked) return "Agree to the privacy policy to continue.";
    if (!slide.querySelector('[name="age"]').checked) return "Confirm that you are 18 or older.";
  }
  return "";
}

function addExtra() {
  const node = document.getElementById("extra-template").content.firstElementChild.cloneNode(true);
  const n = form.querySelectorAll('[data-slide="extra"]').length + 2;
  node.querySelector("h2").textContent = "Tattoo " + n;
  node.querySelectorAll('input[name="who"]').forEach((input) => { input.name = "who-" + n; input.required = true; });
  node.querySelectorAll('input[name="another"]').forEach((input) => { input.name = "another-" + n; });
  const only = node.querySelector('input[value="only"]');
  if (only) only.checked = true;
  policy.before(node);
  artistChips(node.querySelector("[data-artists]"), "artists-" + n);
  bindFiles(node);
  return node;
}

function value(slide, name) {
  const field = slide.querySelector(`[name="${name}"]`);
  return field ? field.value.trim() : "";
}

function selectedArtists(slide) {
  return [...slide.querySelectorAll('input[type="checkbox"]:checked')].map((input) => input.value);
}

function collect() {
  const contact = form.querySelector('[data-slide="contact"]');
  const rows = [
    ["Contact", value(contact, "firstName") + " " + value(contact, "lastName")],
    ["Email", value(contact, "email")],
    ["Availability", value(form.querySelector('[data-slide="availability"]'), "availability")],
    ["People", (checked(form.querySelector('[data-slide="people"]'), "people") || {}).value || "1"]
  ];
  slides().forEach((slide) => {
    if (slide.dataset.slide === "client" || slide.dataset.slide === "extra" || slide.dataset.slide === "tattoo" || slide.dataset.slide === "artist") {
      const title = slide.querySelector("h2").textContent;
      const who = slide.querySelector('input[type="radio"][name^="who"]:checked');
      if (who) rows.push([title + " — who", who.value]);
      const client = [value(slide, "clientFirst"), value(slide, "clientLast")].filter(Boolean).join(" ");
      if (client) rows.push([title + " — client", client]);
      if (value(slide, "description")) rows.push([title + " — description", value(slide, "description")]);
      if (value(slide, "placement")) rows.push([title + " — placement", value(slide, "placement")]);
      if (value(slide, "size")) rows.push([title + " — size", value(slide, "size") + " cm"]);
      const artists = selectedArtists(slide);
      if (artists.length) rows.push([title + " — artists", artists.join(", ")]);
      if (value(slide, "budget")) rows.push([title + " — budget", "¥" + Number(value(slide, "budget")).toLocaleString("en-US")]);
      const photos = slide.querySelector('input[type="file"]');
      if (photos && photos.files.length) {
        rows.push([title + " — files", [...photos.files].map((file) => file.name).join(", ")]);
      }
    }
  });
  return rows;
}

const STUDIO = "Ink.pooja29@gmail.com";

function photoFiles() {
  const files = [];
  slides().forEach((slide) => {
    const photos = slide.querySelector('input[type="file"]');
    if (photos) files.push(...photos.files);
  });
  return files;
}

function showThanks() {
  form.hidden = true;
  document.querySelector(".intro").hidden = true;
  success.hidden = false;
}

function mailSubject(rows) {
  const contact = rows.find(([label]) => label === "Contact");
  const name = contact && contact[1] ? contact[1] : "New request";
  const when = new Date().toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
  return "Appointment request — Ink Pooja — " + name + " — " + when;
}

function emailPayload(rows) {
  const data = new FormData();
  data.append("_subject", mailSubject(rows));
  data.append("_template", "table");
  data.append("_captcha", "false");
  data.append("_honey", "");
  const contactEmail = rows.find(([label]) => label === "Email");
  if (contactEmail) data.append("_replyto", contactEmail[1]);
  rows.forEach(([label, text]) => data.append(label.replaceAll("—", "-"), text));
  return data;
}

function postInBrowser(rows, files) {
  const post = document.createElement("form");
  post.method = "POST";
  post.action = "https://formsubmit.co/" + STUDIO;
  post.enctype = "multipart/form-data";
  post.acceptCharset = "UTF-8";
  post.hidden = true;
  const add = (name, value) => {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = name;
    input.value = value;
    post.append(input);
  };
  add("_subject", mailSubject(rows));
  add("_template", "table");
  add("_captcha", "false");
  add("_honey", "");
  add("_next", location.origin + location.pathname + "?sent=1");
  const contactEmail = rows.find(([label]) => label === "Email");
  if (contactEmail) add("_replyto", contactEmail[1]);
  rows.forEach(([label, text]) => add(label.replaceAll("—", "-"), text));
  files.forEach((file) => {
    const input = document.createElement("input");
    input.type = "file";
    input.name = "attachment";
    const transfer = new DataTransfer();
    transfer.items.add(file);
    input.files = transfer.files;
    post.append(input);
  });
  document.body.append(post);
  post.submit();
}

async function finish() {
  const nextBtn = document.getElementById("next");
  const rows = collect();
  const files = photoFiles();
  const total = files.reduce((sum, file) => sum + file.size, 0);
  if (total > 10 * 1024 * 1024) {
    showError("Reference photos together must be under 10 MB so they can be emailed.");
    return;
  }

  if (location.protocol === "file:") {
    showError("Open this page from a web address, not as a saved file, so the request can be emailed.");
    return;
  }

  nextBtn.disabled = true;
  nextBtn.textContent = "Sending…";
  showError("");

  if (files.length) {
    postInBrowser(rows, files);
    return;
  }

  try {
    const res = await fetch("https://formsubmit.co/ajax/" + encodeURIComponent(STUDIO), {
      method: "POST",
      headers: { Accept: "application/json" },
      body: emailPayload(rows)
    });
    const json = await res.json().catch(() => ({}));
    const ok = json.success === true || json.success === "true" || json.ok === true;
    if (!res.ok || !ok) {
      const raw = json.message || (json.error && json.error.message) || "";
      const message = /activat/i.test(raw)
        ? "The studio inbox still needs a one-time confirmation. Open that email, activate the form, then submit again."
        : (raw || "Could not email this request. Try again.");
      showError(message);
      nextBtn.disabled = false;
      nextBtn.textContent = "Submit";
      return;
    }
  } catch (err) {
    postInBrowser(rows, files);
    return;
  }

  showThanks();
}

bindFiles(form.querySelector('[data-slide="tattoo"]'));

form.querySelector('[data-slide="client"]').addEventListener("change", (event) => {
  if (event.target.name !== "who" || event.target.value !== "Myself (Contact Person)") return;
  const first = form.querySelector('[name="clientFirst"]');
  const last = form.querySelector('[name="clientLast"]');
  if (!first.value) first.value = form.querySelector('[name="firstName"]').value;
  if (!last.value) last.value = form.querySelector('[name="lastName"]').value;
});

document.getElementById("next").addEventListener("click", () => {
  const all = slides();
  const slide = all[index];
  const message = validate(slide);
  if (message) {
    showError(message);
    return;
  }
  const another = slide.querySelector('input[name^="another"]:checked');
  if (another && another.value === "only") {
    let sibling = slide.nextElementSibling;
    while (sibling && sibling.dataset.slide === "extra") {
      const nextSibling = sibling.nextElementSibling;
      sibling.remove();
      sibling = nextSibling;
    }
  }
  if (another && another.value === "more") {
    const following = [...form.querySelectorAll('[data-slide="extra"]')].filter((item) => slide.compareDocumentPosition(item) & Node.DOCUMENT_POSITION_FOLLOWING);
    if (!following.length) {
      if (form.querySelectorAll('[data-slide="extra"]').length >= 4) {
        showError("You can include up to 5 tattoos in one request.");
        return;
      }
      addExtra();
    }
  }
  if (index >= slides().length - 1) {
    finish();
    return;
  }
  show(index + 1);
});

document.getElementById("back").addEventListener("click", () => {
  if (index > 0) show(index - 1);
});

if (new URLSearchParams(location.search).get("sent") === "1") {
  showThanks();
} else {
  show(0);
}
