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

function esc(v) {
  return String(v || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function json(data, status) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: {
      "content-type": "application/json; charset=UTF-8",
      "cache-control": "no-store"
    }
  });
}

function page(body, status) {
  return new Response(body, {
    status: status || 200,
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
      body TEXT DEFAULT '',
      content TEXT DEFAULT '',
      image_url TEXT DEFAULT '',
      category TEXT DEFAULT 'শিক্ষা সংবাদ',
      date TEXT DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      published INTEGER DEFAULT 1
    )
  `).run();

  const columns = [
    ["excerpt", "TEXT DEFAULT ''"],
    ["body", "TEXT DEFAULT ''"],
    ["content", "TEXT DEFAULT ''"],
    ["image_url", "TEXT DEFAULT ''"],
    ["category", "TEXT DEFAULT 'শিক্ষা সংবাদ'"],
    ["date", "TEXT DEFAULT ''"],
    ["published", "INTEGER DEFAULT 1"]
  ];

  for (const item of columns) {
    try {
      await db.prepare(
        "ALTER TABLE news ADD COLUMN " +
        item[0] + " " + item[1]
      ).run();
    } catch (e) {}
  }
}

async function getNews(db, admin) {
  let sql =
    "SELECT id,title,excerpt,body,content,image_url," +
    "category,date,created_at,published FROM news ";

  if (!admin) {
    sql += "WHERE published = 1 ";
  }

  sql +=
    "ORDER BY id DESC";

  const result = await db.prepare(sql).all();
  return result.results || [];
}

async function getOne(db, id) {
  return await db.prepare(
    "SELECT id,title,excerpt,body,content,image_url," +
    "category,date,created_at,published " +
    "FROM news WHERE id = ?"
  ).bind(id).first();
}

/* =========================
   SAVE
========================= */

async function saveNews(db, data) {

  const title = String(data.title || "").trim();
  const excerpt = String(data.excerpt || "").trim();
  const body = String(
    data.body || data.content || ""
  ).trim();

  const image = String(
    data.image_url || ""
  ).trim();

  const category = String(
    data.category || "শিক্ষা সংবাদ"
  ).trim();

  const date = String(
    data.date || new Date().toISOString().slice(0, 10)
  );

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
      error: "বিস্তারিত সংবাদ লিখুন"
    }, 400);
  }

  const id = Number(data.id || 0);

  if (id > 0) {

    await db.prepare(
      "UPDATE news SET " +
      "title=?, excerpt=?, body=?, content=?, " +
      "image_url=?, category=?, date=?, published=? " +
      "WHERE id=?"
    ).bind(
      title,
      excerpt,
      body,
      body,
      image,
      category,
      date,
      published,
      id
    ).run();

    return json({
      ok: true,
      message: "নিউজ আপডেট হয়েছে",
      id: id
    });
  }

  const result = await db.prepare(
    "INSERT INTO news " +
    "(title,excerpt,body,content,image_url,category,date,published) " +
    "VALUES (?,?,?,?,?,?,?,?)"
  ).bind(
    title,
    excerpt,
    body,
    body,
    image,
    category,
    date,
    published
  ).run();

  return json({
    ok: true,
    message: "নিউজ সংরক্ষণ হয়েছে",
    id: result.meta.last_row_id
  });
}

/* =========================
   HOME
========================= */

async function home(db) {

  const news = await getNews(db, false);

  let cards = "";

  for (const n of news) {

    let image = "";

    if (n.image_url) {
      image =
        '<img class="news-image" src="' +
        esc(n.image_url) +
        '" alt="' +
        esc(n.title) +
        '">';
    } else {
      image =
        '<div class="no-image">শিক্ষককণ্ঠ২৪</div>';
    }

    cards +=
      '<article class="card">' +
        image +
        '<div class="card-body">' +
          '<div class="cat">' +
            esc(n.category) +
          '</div>' +
          '<h2>' +
            '<a href="/news?id=' +
            n.id +
            '">' +
            esc(n.title) +
            '</a>' +
          '</h2>' +
          '<div class="date">' +
            esc(n.date) +
          '</div>' +
          '<p>' +
            esc(n.excerpt) +
          '</p>' +
          '<a class="read" href="/news?id=' +
            n.id +
          '">বিস্তারিত পড়ুন →</a>' +
        '</div>' +
      '</article>';
  }

  if (!cards) {
    cards =
      '<div class="empty">' +
      'এখনো কোনো সংবাদ প্রকাশিত হয়নি।' +
      '</div>';
  }

  return `
<!DOCTYPE html>
<html lang="bn">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${SITE_NAME}</title>
<style>
*{box-sizing:border-box}
body{
margin:0;
font-family:Arial,"Noto Sans Bengali",sans-serif;
background:#f4f6f8;
color:#222
}
header{
background:#fff;
border-bottom:1px solid #ddd
}
.header{
max-width:1100px;
margin:auto;
padding:18px 15px;
display:flex;
align-items:center;
justify-content:space-between
}
.logo{
font-size:30px;
font-weight:bold;
text-decoration:none;
color:#c00000
}
.logo span{color:#222}
.admin{
background:#222;
color:white;
padding:9px 14px;
border-radius:6px;
text-decoration:none
}
.container{
max-width:1100px;
margin:25px auto;
padding:0 15px
}
.grid{
display:grid;
grid-template-columns:repeat(auto-fit,minmax(280px,1fr));
gap:20px
}
.card{
background:white;
border-radius:10px;
overflow:hidden;
box-shadow:0 2px 8px rgba(0,0,0,.08)
}
.news-image{
width:100%;
height:190px;
object-fit:cover
}
.no-image{
height:190px;
display:flex;
align-items:center;
justify-content:center;
background:#eee;
font-size:25px;
font-weight:bold
}
.card-body{padding:18px}
.cat{
color:#c00000;
font-weight:bold;
font-size:14px
}
h2{
line-height:1.4
}
h2 a{
color:#222;
text-decoration:none
}
.date{
font-size:13px;
color:#777
}
p{
line-height:1.7
}
.read{
color:#c00000;
font-weight:bold;
text-decoration:none
}
.empty{
background:white;
padding:50px;
text-align:center;
border-radius:10px
}
footer{
margin-top:50px;
background:#222;
color:white;
padding:25px;
text-align:center
}
</style>
</head>
<body>

<header>
<div class="header">
<a class="logo" href="/">
শিক্ষককণ্ঠ<span>২৪</span>
</a>
<a class="admin" href="/admin">Admin</a>
</div>
</header>

<main class="container">

<h1>সর্বশেষ সংবাদ</h1>
<p>শিক্ষা, শিক্ষকতা, সাহিত্য ও সমসাময়িক বিষয়</p>

<div class="grid">
${cards}
</div>

</main>

<footer>
© ${new Date().getFullYear()} ${SITE_NAME}
</footer>

</body>
</html>
`;
}

/* =========================
   SINGLE NEWS
========================= */

async function singleNews(db, id) {

  const n = await getOne(db, id);

  if (!n || Number(n.published) !== 1) {
    return page(`
<!DOCTYPE html>
<html lang="bn">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>সংবাদ পাওয়া যায়নি</title>
</head>
<body style="font-family:Arial;text-align:center;padding:50px">
<h2>সংবাদ পাওয়া যায়নি</h2>
<a href="/">হোমপেজে ফিরে যান</a>
</body>
</html>
`, 404);
  }

  let image = "";

  if (n.image_url) {
    image =
      '<img src="' +
      esc(n.image_url) +
      '" style="width:100%;max-height:500px;object-fit:cover;border-radius:10px">';
  }

  const content = esc(
    n.body || n.content || ""
  ).replace(/\n/g, "<br>");

  return page(`
<!DOCTYPE html>
<html lang="bn">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(n.title)} - ${SITE_NAME}</title>
<style>
body{
margin:0;
background:#f5f5f5;
font-family:Arial,"Noto Sans Bengali",sans-serif
}
header{
background:white;
padding:18px;
border-bottom:1px solid #ddd
}
header a{
color:#c00000;
font-size:28px;
font-weight:bold;
text-decoration:none
}
.container{
max-width:900px;
margin:30px auto;
padding:0 15px
}
.article{
background:white;
padding:25px;
border-radius:10px
}
.cat{
color:#c00000;
font-weight:bold
}
h1{
font-size:36px;
line-height:1.4
}
.date{
color:#777
}
.content{
font-size:19px;
line-height:2
}
.back{
display:inline-block;
margin-top:25px;
color:#c00000
}
</style>
</head>
<body>

<header>
<a href="/">শিক্ষককণ্ঠ২৪</a>
</header>

<main class="container">
<article class="article">

<div class="cat">${esc(n.category)}</div>

<h1>${esc(n.title)}</h1>

<div class="date">${esc(n.date)}</div>

<br>

${image}

<p>
<strong>${esc(n.excerpt)}</strong>
</p>

<div class="content">
${content}
</div>

<a class="back" href="/">← সব সংবাদ</a>

</article>
</main>

</body>
</html>
`);
}

/* =========================
   ADMIN
========================= */

function adminPage() {

  let options = "";

  for (const c of CATEGORIES) {
    options +=
      '<option value="' +
      esc(c) +
      '">' +
      esc(c) +
      '</option>';
  }

  return `
<!DOCTYPE html>
<html lang="bn">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Admin - ${SITE_NAME}</title>

<style>
*{box-sizing:border-box}

body{
margin:0;
background:#f2f4f7;
font-family:Arial,"Noto Sans Bengali",sans-serif
}

header{
background:#111;
color:white;
padding:18px
}

.header{
max-width:1100px;
margin:auto;
display:flex;
justify-content:space-between;
align-items:center
}

.container{
max-width:1100px;
margin:25px auto;
padding:0 15px
}

.box{
background:white;
padding:25px;
border-radius:10px;
margin-bottom:20px;
box-shadow:0 2px 8px rgba(0,0,0,.07)
}

input,textarea,select{
width:100%;
padding:12px;
margin:6px 0 15px;
border:1px solid #ccc;
border-radius:6px;
font-size:16px
}

textarea{
min-height:180px
}

button{
border:0;
padding:11px 17px;
border-radius:6px;
cursor:pointer;
font-size:15px;
margin:3px
}

.red{
background:#c00000;
color:white
}

.black{
background:#222;
color:white
}

.gray{
background:#ddd
}

.danger{
background:#c62828;
color:white
}

#dashboard{
display:none
}

.news{
background:#fafafa;
border:1px solid #ddd;
padding:15px;
margin-bottom:12px;
border-radius:7px
}

.thumb{
width:120px;
height:80px;
object-fit:cover;
border-radius:5px
}

.small{
color:#777;
font-size:13px
}

.message{
padding:12px;
margin-bottom:15px;
border-radius:6px;
display:none
}

.ok{
background:#dff3e4;
color:#176b2c
}

.err{
background:#ffe0e0;
color:#9b0000
}

</style>
</head>

<body>

<header>
<div class="header">
<strong>${SITE_NAME} — Admin</strong>
<a href="/" style="color:white">Website</a>
</div>
</header>

<div class="container">

<div id="login" class="box" style="max-width:450px;margin:50px auto">

<h2>Admin Login</h2>

<input
id="password"
type="password"
placeholder="Password"
>

<button class="red" onclick="login()">
Login
</button>

<p id="loginError" style="color:red"></p>

</div>

<div id="dashboard">

<div class="box">

<h2 id="formTitle">
নতুন নিউজ
</h2>

<div id="message" class="message"></div>

<input id="newsId" type="hidden">

<label>শিরোনাম</label>

<input
id="title"
placeholder="সংবাদের শিরোনাম"
>

<label>ক্যাটাগরি</label>

<select id="category">
${options}
</select>

<label>তারিখ</label>

<input id="date" type="date">

<label>ছবির URL</label>

<input
id="image"
placeholder="Cloudinary image URL"
>

<input
id="file"
type="file"
accept="image/*"
style="display:none"
>

<button class="black" onclick="chooseImage()">
ছবি আপলোড
</button>

<span id="uploadStatus"></span>

<label>সংক্ষিপ্ত বিবরণ</label>

<textarea
id="excerpt"
style="min-height:100px"
></textarea>

<label>বিস্তারিত সংবাদ</label>

<textarea id="body"></textarea>

<label>
<input
id="published"
type="checkbox"
checked
style="width:auto"
>
 প্রকাশিত থাকবে
</label>

<br>

<button class="red" onclick="saveNews()">
নিউজ সংরক্ষণ
</button>

<button class="gray" onclick="clearForm()">
নতুন / বাতিল
</button>

</div>

<div class="box">

<h2>নিউজ তালিকা</h2>

<button class="black" onclick="loadNews()">
Refresh
</button>

<div id="newsList">
লোড হচ্ছে...
</div>

</div>

</div>

</div>

<script>

var ADMIN_PASSWORD = "";
var EDIT_ID = 0;

function $(id) {
  return document.getElementById(id);
}

function login() {

  var p = $("password").value;

  if (!p) {
    $("loginError").innerText = "Password দিন";
    return;
  }

  fetch("/api/news?admin=1", {
    headers: {
      "x-admin-password": p
    }
  })
  .then(function(r) {
    if (!r.ok) {
      throw new Error("login");
    }
    return r.json();
  })
  .then(function() {

    ADMIN_PASSWORD = p;

    localStorage.setItem(
      "shikkhok_admin_password",
      p
    );

    $("login").style.display = "none";
    $("dashboard").style.display = "block";

    setDate();
    loadNews();

  })
  .catch(function() {

    $("loginError").innerText =
      "Password ভুল অথবা Server সমস্যা";

  });
}

function start() {

  var p =
    localStorage.getItem(
      "shikkhok_admin_password"
    );

  if (!p) {
    return;
  }

  fetch("/api/news?admin=1", {
    headers: {
      "x-admin-password": p
    }
  })
  .then(function(r) {

    if (!r.ok) {
      throw new Error("login");
    }

    return r.json();

  })
  .then(function() {

    ADMIN_PASSWORD = p;

    $("login").style.display = "none";
    $("dashboard").style.display = "block";

    setDate();
    loadNews();

  })
  .catch(function() {

    localStorage.removeItem(
      "shikkhok_admin_password"
    );

  });
}

function setDate() {

  if (!$("date").value) {

    $("date").value =
      new Date()
      .toISOString()
      .slice(0, 10);

  }
}

function clearForm() {

  EDIT_ID = 0;

  $("newsId").value = "";
  $("title").value = "";
  $("excerpt").value = "";
  $("body").value = "";
  $("image").value = "";
  $("published").checked = true;

  $("formTitle").innerText =
    "নতুন নিউজ";

  setDate();

}

function saveNews() {

  var data = {

    id: EDIT_ID,

    title: $("title").value,

    category: $("category").value,

    date: $("date").value,

    image_url: $("image").value,

    excerpt: $("excerpt").value,

    body: $("body").value,

    published: $("published").checked

  };

  fetch("/api/admin/news", {

    method: "POST",

    headers: {

      "content-type":
        "application/json",

      "x-admin-password":
        ADMIN_PASSWORD

    },

    body: JSON.stringify(data)

  })
  .then(function(r) {
    return r.json();
  })
  .then(function(result) {

    if (!result.ok) {

      showMessage(
        result.error || "সমস্যা হয়েছে",
        false
      );

      return;
    }

    showMessage(
      result.message || "সফল হয়েছে",
      true
    );

    clearForm();
    loadNews();

  })
  .catch(function() {

    showMessage(
      "Server error হয়েছে",
      false
    );

  });
}

function loadNews() {

  fetch("/api/news?admin=1", {

    headers: {
      "x-admin-password":
        ADMIN_PASSWORD
    }

  })
  .then(function(r) {
    return r.json();
  })
  .then(function(list) {

    var box = $("newsList");

    if (!list.length) {

      box.innerHTML =
        "<p>এখনো কোনো নিউজ নেই।</p>";

      return;
    }

    var html = "";

    list.forEach(function(n) {

      html +=
        '<div class="news">';

      if (n.image_url) {

        html +=
          '<img class="thumb" src="' +
          escapeHtml(n.image_url) +
          '"><br>';

      }

      html +=
        "<h3>" +
        escapeHtml(n.title) +
        "</h3>";

      html +=
        '<div class="small">' +
        escapeHtml(n.category) +
        " — " +
        escapeHtml(n.date) +
        "</div>";

      html +=
        "<p>" +
        escapeHtml(n.excerpt) +
        "</p>";

      html +=
        '<button class="black" ' +
        'onclick="editNews(' +
        n.id +
        ')">Edit</button>';

      html +=
        '<button class="danger" ' +
        'onclick="deleteNews(' +
        n.id +
        ')">Delete</button>';

      html +=
        "</div>";

    });

    box.innerHTML = html;

    window.newsData = list;

  })
  .catch(function() {

    $("newsList").innerHTML =
      "<p>নিউজ লোড করা যায়নি।</p>";

  });
}

function editNews(id) {

  var list = window.newsData || [];
  var n = null;

  for (var i = 0; i < list.length; i++) {

    if (Number(list[i].id) === Number(id)) {
      n = list[i];
      break;
    }

  }

  if (!n) {
    return;
  }

  EDIT_ID = Number(n.id);

  $("newsId").value = n.id;
  $("title").value = n.title || "";
  $("category").value =
    n.category || "শিক্ষা সংবাদ";
  $("date").value = n.date || "";
  $("image").value = n.image_url || "";
  $("excerpt").value = n.excerpt || "";
  $("body").value =
    n.body || n.content || "";

  $("published").checked =
    Number(n.published) === 1;

  $("formTitle").innerText =
    "নিউজ সম্পাদনা";

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

function deleteNews(id) {

  if (!confirm("নিউজটি মুছে ফেলবেন?")) {
    return;
  }

  fetch(
    "/api/admin/news?id=" + id,
    {
      method: "DELETE",
      headers: {
        "x-admin-password":
          ADMIN_PASSWORD
      }
    }
  )
  .then(function(r) {
    return r.json();
  })
  .then(function(result) {

    if (result.ok) {
      loadNews();
    } else {
      alert(
        result.error || "Delete failed"
      );
    }

  });

}

function chooseImage() {
  $("file").click();
}

$("file").addEventListener(
  "change",
  function() {

    var file = this.files[0];

    if (!file) {
      return;
    }

    $("uploadStatus").innerText =
      " ছবি আপলোড হচ্ছে...";

    var form = new FormData();

    form.append("file", file);

    form.append(
      "upload_preset",
      "${CLOUDINARY_PRESET}"
    );

    fetch(
      "https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload",
      {
        method: "POST",
        body: form
      }
    )
    .then(function(r) {
      return r.json();
    })
    .then(function(data) {

      if (data.secure_url) {

        $("image").value =
          data.secure_url;

        $("uploadStatus").innerText =
          " ছবি আপলোড হয়েছে";

      } else {

        $("uploadStatus").innerText =
          " ছবি আপলোড হয়নি";

      }

    })
    .catch(function() {

      $("uploadStatus").innerText =
        " আপলোডে সমস্যা হয়েছে";

    });

  }
);

function showMessage(text, ok) {

  var box = $("message");

  box.innerText = text;

  box.className =
    ok
      ? "message ok"
      : "message err";

  box.style.display = "block";

  setTimeout(function() {
    box.style.display = "none";
  }, 4000);
}

function escapeHtml(value) {

  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

}

start();

</script>

</body>
</html>
`;
}

/* =========================
   WORKER
========================= */

export default {

  async fetch(request, env) {

    try {

      if (!env.DB) {

        return new Response(
          "D1 binding DB পাওয়া যায়নি।",
          {
            status: 500,
            headers: {
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

      /* PUBLIC API */

      if (
        url.pathname === "/api/news" &&
        request.method === "GET"
      ) {

        const admin =
          url.searchParams.get("admin");

        if (admin === "1") {

          if (
            request.headers.get(
              "x-admin-password"
            ) !== PASSWORD
          ) {
            return json({
              ok: false,
              error: "Unauthorized"
            }, 401);
          }

          return json(
            await getNews(db, true)
          );
        }

        const id =
          url.searchParams.get("id");

        if (id) {

          const n =
            await getOne(db, id);

          if (
            !n ||
            Number(n.published) !== 1
          ) {
            return json({});
          }

          return json(n);
        }

        return json(
          await getNews(db, false)
        );
      }

      /* SAVE */

      if (
        url.pathname === "/api/admin/news" &&
        request.method === "POST"
      ) {

        if (
          request.headers.get(
            "x-admin-password"
          ) !== PASSWORD
        ) {
          return json({
            ok: false,
            error: "Unauthorized"
          }, 401);
        }

        const data =
          await request.json();

        return await saveNews(
          db,
          data
        );
      }

      /* DELETE */

      if (
        url.pathname === "/api/admin/news" &&
        request.method === "DELETE"
      ) {

        if (
          request.headers.get(
            "x-admin-password"
          ) !== PASSWORD
        ) {
          return json({
            ok: false,
            error: "Unauthorized"
          }, 401);
        }

        const id =
          Number(
            url.searchParams.get("id")
          );

        if (!id) {
          return json({
            ok: false,
            error: "ID নেই"
          }, 400);
        }

        await db.prepare(
          "DELETE FROM news WHERE id = ?"
        ).bind(id).run();

        return json({
          ok: true,
          message: "নিউজ মুছে ফেলা হয়েছে"
        });
      }

      /* ADMIN */

      if (
        url.pathname === "/admin" ||
        url.pathname === "/admin/"
      ) {
        return page(
          adminPage()
        );
      }

      /* SINGLE NEWS */

      if (url.pathname === "/news") {

        const id =
          url.searchParams.get("id");

        if (!id) {
          return page(
            "<h2>News ID নেই</h2>",
            400
          );
        }

        return await singleNews(
          db,
          id
        );
      }

      /* HOME */

      if (
        url.pathname === "/" ||
        url.pathname === ""
      ) {
        return page(
          await home(db)
        );
      }

      return new Response(
        "পৃষ্ঠা পাওয়া যায়নি",
        {
          status: 404,
          headers: {
            "content-type":
              "text/plain; charset=UTF-8"
          }
        }
      );

    } catch (error) {

      return new Response(
        "Worker Error: " +
        error.message,
        {
          status: 500,
          headers: {
            "content-type":
              "text/plain; charset=UTF-8"
          }
        }
      );
    }
  }
};
