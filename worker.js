const PASSWORD = "12345678";

const SITE_NAME = "শিক্ষককণ্ঠ২৪";
const CLOUDINARY_CLOUD = "jg9ajdkn";
const CLOUDINARY_PRESET = "shikkhokkontho";

const CATEGORIES = [
  "শিক্ষা সংবাদ",
  "শিক্ষক সমাজ",
  "সাহিত্য",
  "মতামত",
  "গবেষণা",
  "চাকরি ও নিয়োগ",
  "জীবনধারা"
];

function esc(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=UTF-8",
      "cache-control": "no-store"
    }
  });
}

function html(content, status = 200) {
  return new Response(content, {
    status,
    headers: {
      "content-type": "text/html; charset=UTF-8",
      "cache-control": "no-store"
    }
  });
}

/* =========================
   DATABASE
========================= */

async function setupDB(db) {
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS news (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      excerpt TEXT DEFAULT '',
      body TEXT NOT NULL,
      content TEXT DEFAULT '',
      image_url TEXT DEFAULT '',
      category TEXT DEFAULT 'শিক্ষা সংবাদ',
      date TEXT DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      published INTEGER DEFAULT 1
    )
  `).run();

  /*
    পুরোনো ডাটাবেজে কোনো কলাম না থাকলে
    সেগুলো যোগ করার চেষ্টা করা হবে।
  */

  const columns = [
    ["excerpt", "TEXT DEFAULT ''"],
    ["body", "TEXT DEFAULT ''"],
    ["content", "TEXT DEFAULT ''"],
    ["image_url", "TEXT DEFAULT ''"],
    ["category", "TEXT DEFAULT 'শিক্ষা সংবাদ'"],
    ["date", "TEXT DEFAULT ''"],
    ["published", "INTEGER DEFAULT 1"]
  ];

  for (const [name, definition] of columns) {
    try {
      await db.prepare(
        `ALTER TABLE news ADD COLUMN ${name} ${definition}`
      ).run();
    } catch (e) {
      // কলাম আগে থেকেই থাকলে কিছু করার নেই
    }
  }
}

/* =========================
   NEWS FUNCTIONS
========================= */

async function allNews(db, includeUnpublished = false) {
  let sql = `
    SELECT
      id,
      title,
      excerpt,
      body,
      content,
      image_url,
      category,
      date,
      created_at,
      published
    FROM news
  `;

  if (!includeUnpublished) {
    sql += ` WHERE published = 1 `;
  }

  sql += `
    ORDER BY
      CASE
        WHEN date IS NULL OR date = '' THEN created_at
        ELSE date
      END DESC,
      id DESC
  `;

  const result = await db.prepare(sql).all();

  return result.results || [];
}

async function oneNews(db, id) {
  const result = await db.prepare(`
    SELECT
      id,
      title,
      excerpt,
      body,
      content,
      image_url,
      category,
      date,
      created_at,
      published
    FROM news
    WHERE id = ?
  `).bind(id).first();

  return result || null;
}

/* =========================
   ADMIN AUTH
========================= */

function isAdmin(request) {
  return request.headers.get("x-admin-password") === PASSWORD;
}

/* =========================
   SAVE NEWS
========================= */

async function saveNews(db, data) {

  const title = String(data.title || "").trim();
  const excerpt = String(data.excerpt || "").trim();
  const body = String(data.body || data.content || "").trim();
  const image_url = String(data.image_url || "").trim();
  const category = String(
    data.category || "শিক্ষা সংবাদ"
  ).trim();

  const date = String(
    data.date || new Date().toISOString().slice(0, 10)
  ).trim();

  const published =
    data.published === false ||
    data.published === 0 ||
    data.published === "0"
      ? 0
      : 1;

  if (!title) {
    return json({
      ok: false,
      error: "শিরোনাম লিখুন"
    }, 400);
  }

  if (!body) {
    return json({
      ok: false,
      error: "সংবাদের বিস্তারিত লিখুন"
    }, 400);
  }

  const id = data.id ? Number(data.id) : 0;

  if (id) {

    await db.prepare(`
      UPDATE news
      SET
        title = ?,
        excerpt = ?,
        body = ?,
        content = ?,
        image_url = ?,
        category = ?,
        date = ?,
        published = ?
      WHERE id = ?
    `).bind(
      title,
      excerpt,
      body,
      body,
      image_url,
      category,
      date,
      published,
      id
    ).run();

    return json({
      ok: true,
      message: "নিউজ আপডেট হয়েছে",
      id
    });
  }

  const result = await db.prepare(`
    INSERT INTO news
    (
      title,
      excerpt,
      body,
      content,
      image_url,
      category,
      date,
      published
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    title,
    excerpt,
    body,
    body,
    image_url,
    category,
    date,
    published
  ).run();

  return json({
    ok: true,
    message: "নিউজ প্রকাশ হয়েছে",
    id: result.meta.last_row_id
  });
}

/* =========================
   HOME PAGE
========================= */

async function homePage(db) {

  const news = await allNews(db, false);

  const cards = news.map(n => {

    const image = n.image_url
      ? `
        <img
          src="${esc(n.image_url)}"
          alt="${esc(n.title)}"
          class="news-img"
        >
      `
      : `
        <div class="no-image">
          শিক্ষককণ্ঠ২৪
        </div>
      `;

    return `
      <article class="card">

        ${image}

        <div class="card-body">

          <div class="category">
            ${esc(n.category)}
          </div>

          <h2>
            <a href="/news?id=${n.id}">
              ${esc(n.title)}
            </a>
          </h2>

          <div class="date">
            ${esc(n.date || "")}
          </div>

          <p>
            ${esc(n.excerpt || "")}
          </p>

          <a class="read" href="/news?id=${n.id}">
            বিস্তারিত পড়ুন →
          </a>

        </div>

      </article>
    `;
  }).join("");

  return `
<!DOCTYPE html>
<html lang="bn">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">

<title>${SITE_NAME}</title>

<style>

*{
  box-sizing:border-box;
}

body{
  margin:0;
  font-family:
    Arial,
    "Noto Sans Bengali",
    sans-serif;
  background:#f4f6f8;
  color:#222;
}

header{
  background:#ffffff;
  border-bottom:1px solid #ddd;
}

.header-inner{
  max-width:1100px;
  margin:auto;
  padding:18px 15px;
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:20px;
}

.logo{
  font-size:30px;
  font-weight:bold;
  color:#b40000;
  text-decoration:none;
}

.logo span{
  color:#222;
}

.admin-link{
  text-decoration:none;
  background:#111;
  color:#fff;
  padding:9px 15px;
  border-radius:6px;
}

.container{
  max-width:1100px;
  margin:25px auto;
  padding:0 15px;
}

.site-title{
  margin-bottom:25px;
}

.site-title h1{
  margin:0 0 8px;
}

.grid{
  display:grid;
  grid-template-columns:
    repeat(auto-fit,minmax(280px,1fr));
  gap:20px;
}

.card{
  background:#fff;
  border-radius:10px;
  overflow:hidden;
  box-shadow:0 2px 8px rgba(0,0,0,.08);
}

.news-img{
  width:100%;
  height:190px;
  object-fit:cover;
  display:block;
}

.no-image{
  height:190px;
  display:flex;
  align-items:center;
  justify-content:center;
  background:#eee;
  font-size:25px;
  font-weight:bold;
}

.card-body{
  padding:18px;
}

.category{
  color:#b40000;
  font-size:14px;
  font-weight:bold;
  margin-bottom:8px;
}

.card h2{
  margin:0 0 8px;
  font-size:22px;
  line-height:1.35;
}

.card h2 a{
  color:#222;
  text-decoration:none;
}

.date{
  color:#777;
  font-size:13px;
  margin-bottom:10px;
}

.card p{
  line-height:1.7;
  color:#555;
}

.read{
  color:#b40000;
  text-decoration:none;
  font-weight:bold;
}

.empty{
  background:white;
  padding:40px;
  text-align:center;
  border-radius:10px;
}

footer{
  margin-top:50px;
  padding:25px;
  text-align:center;
  background:#222;
  color:#fff;
}

</style>
</head>

<body>

<header>

  <div class="header-inner">

    <a class="logo" href="/">
      শিক্ষককণ্ঠ<span>২৪</span>
    </a>

    <a class="admin-link" href="/admin">
      Admin
    </a>

  </div>

</header>

<main class="container">

  <div class="site-title">
    <h1>সর্বশেষ সংবাদ</h1>
    <p>শিক্ষা, শিক্ষকতা, সাহিত্য ও সমসাময়িক বিষয়</p>
  </div>

  ${
    cards
      ? `<div class="grid">${cards}</div>`
      : `
        <div class="empty">
          এখনো কোনো সংবাদ প্রকাশিত হয়নি।
        </div>
      `
  }

</main>

<footer>
  © ${new Date().getFullYear()} ${SITE_NAME}
</footer>

</body>
</html>
`;
}

/* =========================
   NEWS DETAILS
========================= */

async function newsPage(db, id) {

  const n = await oneNews(db, id);

  if (!n || Number(n.published) !== 1) {
    return html(`
      <!DOCTYPE html>
      <html lang="bn">
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width,initial-scale=1">
      <body style="
        font-family:Arial;
        padding:50px;
        text-align:center;
      ">
        <h2>সংবাদ পাওয়া যায়নি</h2>
        <a href="/">হোমপেজে ফিরে যান</a>
      </body>
      </html>
    `, 404);
  }

  const image = n.image_url
    ? `
      <img
        src="${esc(n.image_url)}"
        style="
          width:100%;
          max-height:500px;
          object-fit:cover;
          border-radius:10px;
          margin:20px 0;
        "
      >
    `
    : "";

  const body = esc(n.body || n.content || "")
    .replace(/\n/g, "<br>");

  return html(`
<!DOCTYPE html>
<html lang="bn">

<head>

<meta charset="UTF-8">

<meta
  name="viewport"
  content="width=device-width,initial-scale=1"
>

<title>${esc(n.title)} - ${SITE_NAME}</title>

<style>

body{
  margin:0;
  background:#f5f5f5;
  font-family:
    Arial,
    "Noto Sans Bengali",
    sans-serif;
  color:#222;
}

header{
  background:white;
  padding:18px;
  border-bottom:1px solid #ddd;
}

header a{
  color:#b40000;
  text-decoration:none;
  font-size:28px;
  font-weight:bold;
}

.container{
  max-width:900px;
  margin:30px auto;
  padding:0 15px;
}

.article{
  background:white;
  padding:25px;
  border-radius:10px;
}

.category{
  color:#b40000;
  font-weight:bold;
}

h1{
  font-size:36px;
  line-height:1.35;
}

.date{
  color:#777;
}

.content{
  font-size:19px;
  line-height:2;
}

.back{
  display:inline-block;
  margin-top:25px;
  color:#b40000;
}

@media(max-width:600px){

  h1{
    font-size:27px;
  }

  .article{
    padding:18px;
  }

  .content{
    font-size:18px;
  }

}

</style>

</head>

<body>

<header>
  <a href="/">শিক্ষককণ্ঠ২৪</a>
</header>

<main class="container">

  <article class="article">

    <div class="category">
      ${esc(n.category)}
    </div>

    <h1>
      ${esc(n.title)}
    </h1>

    <div class="date">
      ${esc(n.date || "")}
    </div>

    ${image}

    ${
      n.excerpt
        ? `<p><strong>${esc(n.excerpt)}</strong></p>`
        : ""
    }

    <div class="content">
      ${body}
    </div>

    <a class="back" href="/">
      ← সব সংবাদ
    </a>

  </article>

</main>

</body>
</html>
`);
}

/* =========================
   ADMIN PAGE
========================= */

function adminPage() {

  const categoryOptions = CATEGORIES
    .map(c => `<option value="${esc(c)}">${esc(c)}</option>`)
    .join("");

  return `
<!DOCTYPE html>

<html lang="bn">

<head>

<meta charset="UTF-8">

<meta
  name="viewport"
  content="width=device-width,initial-scale=1"
>

<title>Admin - ${SITE_NAME}</title>

<style>

*{
  box-sizing:border-box;
}

body{
  margin:0;
  background:#f2f4f7;
  font-family:
    Arial,
    "Noto Sans Bengali",
    sans-serif;
}

header{
  background:#111;
  color:white;
  padding:18px;
}

header div{
  max-width:1100px;
  margin:auto;
  display:flex;
  justify-content:space-between;
  align-items:center;
}

.container{
  max-width:1100px;
  margin:25px auto;
  padding:0 15px;
}

.login,
.panel{
  background:white;
  padding:25px;
  border-radius:10px;
  margin-bottom:20px;
  box-shadow:0 2px 8px rgba(0,0,0,.07);
}

input,
textarea,
select{
  width:100%;
  padding:12px;
  margin:6px 0 15px;
  border:1px solid #ccc;
  border-radius:6px;
  font-size:16px;
}

textarea{
  min-height:180px;
  resize:vertical;
}

button{
  border:0;
  padding:11px 17px;
  border-radius:6px;
  cursor:pointer;
  font-size:15px;
}

.primary{
  background:#b40000;
  color:white;
}

.dark{
  background:#222;
  color:white;
}

.gray{
  background:#ddd;
}

.danger{
  background:#c62828;
  color:white;
}

.news-item{
  background:#fafafa;
  border:1px solid #ddd;
  padding:15px;
  margin-bottom:12px;
  border-radius:7px;
}

.news-item h3{
  margin-top:0;
}

.small{
  color:#777;
  font-size:13px;
}

#dashboard{
  display:none;
}

#loginBox{
  max-width:450px;
  margin:60px auto;
}

.status{
  padding:12px;
  margin-bottom:15px;
  border-radius:6px;
  display:none;
}

.success{
  background:#dff3e4;
  color:#176b2c;
}

.error{
  background:#ffe0e0;
  color:#9b0000;
}

.thumb{
  width:120px;
  height:80px;
  object-fit:cover;
  border-radius:5px;
  margin-bottom:10px;
}

.top-buttons{
  display:flex;
  gap:8px;
  flex-wrap:wrap;
  margin-bottom:15px;
}

</style>

</head>

<body>

<header>

<div>

<strong>${SITE_NAME} — Admin</strong>

<a
  href="/"
  style="color:white;text-decoration:none"
>
  Website
</a>

</div>

</header>

<div class="container">

<!-- LOGIN -->

<div id="loginBox" class="login">

<h2>Admin Login</h2>

<input
  id="password"
  type="password"
  placeholder="Password"
/>

<button
  class="primary"
  onclick="login()"
>
  Login
</button>

<div
  id="loginError"
  class="error"
  style="margin-top:12px;display:none"
></div>

</div>


<!-- DASHBOARD -->

<div id="dashboard">

<div class="panel">

<div class="top-buttons">

<button
  class="primary"
  onclick="newNews()"
>
  + নতুন নিউজ
</button>

<button
  class="dark"
  onclick="loadNews()"
>
  ↻ Refresh
</button>

<button
  class="gray"
  onclick="logout()"
>
  Logout
</button>

</div>

<h2 id="formTitle">
নতুন নিউজ প্রকাশ
</h2>

<div
  id="status"
  class="status"
></div>

<input
  type="hidden"
  id="newsId"
/>

<label>শিরোনাম</label>

<input
  id="title"
  placeholder="সংবাদের শিরোনাম"
/>

<label>ক্যাটাগরি</label>

<select id="category">

${categoryOptions}

</select>

<label>তারিখ</label>

<input
  id="date"
  type="date"
/>

<label>ছবির URL</label>

<input
  id="image"
  placeholder="Cloudinary image URL"
/>

<button
  type="button"
  class="dark"
  onclick="uploadImage()"
>
  Cloudinary থেকে ছবি আপলোড
</button>

<input
  id="file"
  type="file"
  accept="image/*"
  style="display:none"
/>

<div
  id="imageStatus"
  class="small"
  style="margin:10px 0"
></div>

<label>সংক্ষিপ্ত বিবরণ</label>

<textarea
  id="excerpt"
  style="min-height:100px"
  placeholder="সংবাদের সংক্ষিপ্ত বিবরণ"
></textarea>

<label>বিস্তারিত সংবাদ</label>

<textarea
  id="body"
  placeholder="বিস্তারিত সংবাদ লিখুন"
></textarea>

<label>

<input
  id="published"
  type="checkbox"
  checked
  style="width:auto"
>

 প্রকাশিত থাকবে

</label>

<br><br>

<button
  class="primary"
  onclick="saveNews()"
>
  নিউজ সংরক্ষণ
</button>

<button
  class="gray"
  onclick="newNews()"
>
  বাতিল
</button>

</div>


<div class="panel">

<h2>প্রকাশিত / সংরক্ষিত নিউজ</h2>

<div id="newsList">
লোড হচ্ছে...
</div>

</div>

</div>

</div>


<script>

let ADMIN_PASSWORD = "";
let editingId = 0;


/* =========================
   LOGIN
========================= */

function login(){

  const p =
    document.getElementById("password").value;

  if(!p){
    showLoginError("Password দিন");
    return;
  }

  ADMIN_PASSWORD = p;

  fetch("/api/news?admin=1",{
    headers:{
      "x-admin-password":ADMIN_PASSWORD
    }
  })
  .then(async r => {

    if(!r.ok){

      let text = await r.text();

      throw new Error(
        text || "Login failed"
      );
    }

    return r.json();

  })
  .then(() => {

    localStorage.setItem(
      "shikkhok_admin_password",
      ADMIN_PASSWORD
    );

    document.getElementById(
      "loginBox"
    ).style.display="none";

    document.getElementById(
      "dashboard"
    ).style.display="block";

    setToday();

    loadNews();

  })
  .catch(err => {

    showLoginError(
      "Password সঠিক নয় অথবা Server সমস্যা হয়েছে"
    );

  });
}


function showLoginError(text){

  const box =
    document.getElementById("loginError");

  box.innerText = text;

  box.style.display="block";
}


/* =========================
   START
========================= */

window.addEventListener(
  "load",
  () => {

    const saved =
      localStorage.getItem(
        "shikkhok_admin_password"
      );

    if(saved){

      ADMIN_PASSWORD = saved;

      fetch("/api/news?admin=1",{
        headers:{
          "x-admin-password":
            ADMIN_PASSWORD
        }
      })
      .then(r => {

        if(!r.ok)
          throw new Error();

        document.getElementById(
          "loginBox"
        ).style.display="none";

        document.getElementById(
          "dashboard"
        ).style.display="block";

        setToday();

        loadNews();

      })
      .catch(() => {

        localStorage.removeItem(
          "shikkhok_admin_password"
        );

      });

    }

  }
);


/* =========================
   DATE
========================= */

function setToday(){

  if(!document.getElementById("date").value){

    document.getElementById("date").value =
      new Date()
        .toISOString()
        .slice(0,10);

  }

}


/* =========================
   LOAD NEWS
========================= */

function loadNews(){

  fetch("/api/news?admin=1",{

    headers:{
      "x-admin-password":
        ADMIN_PASSWORD
    }

  })
  .then(r => r.json())
  .then(data => {

    const list =
      document.getElementById("newsList");

    if(!data.length){

      list.innerHTML =
        "<p>এখনো কোনো নিউজ নেই।</p>";

      return;
    }

    list.innerHTML =
      data.map(n => {

        const image =
          n.image_url
            ? `
              <img
                class="thumb"
                src="${n.image_url}"
              >
            `
            : "";

        return `
          <div class="news-item">

            ${image}

            <h3>
              ${escapeHtml(n.title)}
            </h3>

            <div class="small">
              ${escapeHtml(n.category)}
              —
              ${escapeHtml(n.date || "")}
            </div>

            <p>
              ${escapeHtml(
                n.excerpt || ""
              )}
            </p>

            <button
              class="dark"
              onclick='editNews(${JSON.stringify(n)})'
            >
              Edit
            </button>

            <button
              class="danger"
              onclick="deleteNews(${n.id})"
            >
              Delete
            </button>

          </div>
        `;

      }).join("");

  })
  .catch(() => {

    document.getElementById(
      "newsList"
    ).innerHTML =
      "<p>নিউজ লোড করা যায়নি।</p>";

  });

}


/* =========================
   NEW NEWS
========================= */

function newNews(){

  editingId = 0;

  document.getElementById(
    "newsId"
  ).value="";

  document.getElementById(
    "formTitle"
  ).innerText =
    "নতুন নিউজ প্রকাশ";

  document.getElementById(
    "title"
  ).value="";

  document.getElementById(
    "excerpt"
  ).value="";

  document.getElementById(
    "body"
  ).value="";

  document.getElementById(
    "image"
  ).value="";

  document.getElementById(
    "published"
  ).checked=true;

  setToday();

  window.scrollTo({
    top:0,
    behavior:"smooth"
  });

}


/* =========================
   EDIT
========================= */

function editNews(n){

  editingId = Number(n.id);

  document.getElementById(
    "newsId"
  ).value=n.id;

  document.getElementById(
    "formTitle"
  ).innerText =
    "নিউজ সম্পাদনা";

  document.getElementById(
    "title"
  ).value=n.title || "";

  document.getElementById(
    "category"
  ).value=n.category || "শিক্ষা সংবাদ";

  document.getElementById(
    "date"
  ).value=n.date || "";

  document.getElementById(
    "image"
  ).value=n.image_url || "";

  document.getElementById(
    "excerpt"
  ).value=n.excerpt || "";

  document.getElementById(
    "body"
  ).value=n.body || n.content || "";

  document.getElementById(
    "published"
  ).checked =
    Number(n.published) === 1;

  window.scrollTo({
    top:0,
    behavior:"smooth"
  });

}


/* =========================
   SAVE
========================= */

function saveNews(){

  const data = {

    id: editingId || 0,

    title:
      document.getElementById(
        "title"
      ).value,

    category:
      document.getElementById(
        "category"
      ).value,

    date:
      document.getElementById(
        "date"
      ).value,

    image_url:
      document.getElementById(
        "image"
      ).value,

    excerpt:
      document.getElementById(
        "excerpt"
      ).value,

    body:
      document.getElementById(
        "body"
      ).value,

    published:
      document.getElementById(
        "published"
      ).checked

  };

  fetch("/api/admin/news",{

    method:"POST",

    headers:{
      "content-type":
        "application/json",

      "x-admin-password":
        ADMIN_PASSWORD
    },

    body:JSON.stringify(data)

  })
  .then(r => r.json())
  .then(result => {

    if(!result.ok){

      showStatus(
        result.error ||
        "সংরক্ষণ করা যায়নি",
        false
      );

      return;
    }

    showStatus(
      result.message ||
      "সফল হয়েছে",
      true
    );

    newNews();

    loadNews();

  })
  .catch(() => {

    showStatus(
      "Server error হয়েছে",
      false
    );

  });

}


/* =========================
   DELETE
========================= */

function deleteNews(id){

  if(!confirm(
    "এই নিউজটি মুছে ফেলতে চান?"
  )){
    return;
  }

  fetch(
    "/api/admin/news?id=" + id,
    {
      method:"DELETE",
      headers:{
        "x-admin-password":
          ADMIN_PASSWORD
      }
    }
  )
  .then(r => r.json())
  .then(result => {

    if(result.ok){

      loadNews();

    }else{

      alert(
        result.error ||
        "Delete করা যায়নি"
      );

    }

  });

}


/* =========================
   CLOUDINARY
========================= */

function uploadImage(){

  document.getElementById(
    "file"
  ).click();

}


document.getElementById(
  "file"
).addEventListener(
  "change",
  function(){

    const file = this.files[0];

    if(!file) return;

    const status =
      document.getElementById(
        "imageStatus"
      );

    status.innerText =
      "ছবি আপলোড হচ্ছে...";

    const form =
      new FormData();

    form.append(
      "file",
      file
    );

    form.append(
      "upload_preset",
      "${CLOUDINARY_PRESET}"
    );

    fetch(
      "https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload",
      {
        method:"POST",
        body:form
      }
    )
    .then(r => r.json())
    .then(data => {

      if(data.secure_url){

        document.getElementById(
          "image"
        ).value =
          data.secure_url;

        status.innerText =
          "ছবি সফলভাবে আপলোড হয়েছে";

      }else{

        status.innerText =
          "ছবি আপলোড হয়নি";

      }

    })
    .catch(() => {

      status.innerText =
        "ছবি আপলোডে সমস্যা হয়েছে";

    });

  }
);


/* =========================
   STATUS
========================= */

function showStatus(
  text,
  success
){

  const box =
    document.getElementById(
      "status"
    );

  box.innerText=text;

  box.className =
    "status " +
    (success
      ? "success"
      : "error");

  box.style.display="block";

  setTimeout(() => {

    box.style.display="none";

  },4000);

}


/* =========================
   LOGOUT
========================= */

function logout(){

  localStorage.removeItem(
    "shikkhok_admin_password"
  );

  location.reload();

}


/* =========================
   ESCAPE
========================= */

function escapeHtml(value){

  return String(value || "")
    .replace(/&/g,"&amp;")
    .replace(/</g,"&lt;")
    .replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;")
    .replace(/'/g,"&#039;");

}

</script>

</body>
</html>
`;
}


/* =========================
   MAIN WORKER
========================= */

export default {

  async fetch(request, env) {

    try {

      if(!env.DB){

        return new Response(
          "ERROR: D1 binding 'DB' পাওয়া যায়নি।",
          {
            status:500,
            headers:{
              "content-type":
                "text/plain; charset=UTF-8"
            }
          }
        );

      }

      const db = env.DB;

      await setupDB(db);

      const url =
        new URL(request.url);

      /* =====================
         API — PUBLIC NEWS
      ===================== */

      if(
        url.pathname === "/api/news" &&
        request.method === "GET"
      ){

        const admin =
          url.searchParams.get("admin");

        if(admin === "1"){

          if(!isAdmin(request)){

            return json({
              ok:false,
              error:"Unauthorized"
            },401);

          }

          const news =
            await allNews(
              db,
              true
            );

          return json(news);
        }

        const id =
          url.searchParams.get("id");

        if(id){

          const n =
            await oneNews(db,id);

          if(!n ||
             Number(n.published) !== 1){

            return json({});
          }

          return json(n);
        }

        const news =
          await allNews(
            db,
            false
          );

        return json(news);
      }


      /* =====================
         API — SAVE
      ===================== */

      if(
        url.pathname === "/api/admin/news" &&
        request.method === "POST"
      ){

        if(!isAdmin(request)){

          return json({
            ok:false,
            error:"Unauthorized"
          },401);

        }

        const data =
          await request.json();

        return await saveNews(
          db,
          data
        );
      }


      /* =====================
         API — DELETE
      ===================== */

      if(
        url.pathname === "/api/admin/news" &&
        request.method === "DELETE"
      ){

        if(!isAdmin(request)){

          return json({
            ok:false,
            error:"Unauthorized"
          },401);

        }

        const id =
          Number(
            url.searchParams.get("id")
          );

        if(!id){

          return json({
            ok:false,
            error:"ID পাওয়া যায়নি"
          },400);

        }

        await db.prepare(
          "DELETE FROM news WHERE id = ?"
        ).bind(id).run();

        return json({
          ok:true,
          message:"নিউজ মুছে ফেলা হয়েছে"
        });
      }


      /* =====================
         ADMIN
      ===================== */

      if(
        url.pathname === "/admin" ||
        url.pathname === "/admin/"
      ){

        return html(
          adminPage()
        );
      }


      /* =====================
         NEWS DETAILS
      ===================== */

      if(
        url.pathname === "/news"
      ){

        const id =
          url.search
