const PASSWORD = "12345678";

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

function html(content, title = "শিক্ষককণ্ঠ২৪") {
  return `<!doctype html>
<html lang="bn">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(title)}</title>
<style>
*{box-sizing:border-box}
body{margin:0;font-family:Arial,"Noto Sans Bengali",sans-serif;background:#f5f7f6;color:#17221c}
a{text-decoration:none;color:inherit}
.top{background:#123d2d;color:#fff;padding:8px 4%;font-size:13px}
.head{background:#fff;padding:20px 4%;display:flex;justify-content:space-between;align-items:center}
.logo{font-size:34px;font-weight:800;color:#0b6845}
.tag{color:#66756d;font-size:14px;margin-top:4px}
.nav{background:#0d5a3d;color:#fff;padding:12px 4%;display:flex;gap:20px;flex-wrap:wrap;font-weight:600}
.nav a:hover{text-decoration:underline}
.wrap{max-width:1180px;margin:25px auto;padding:0 18px}
.hero{background:#123d2d;color:#fff;border-radius:14px;padding:35px;margin-bottom:25px}
.hero h1{font-size:34px;margin:0 0 12px}
.grid{display:grid;grid-template-columns:2fr 1fr;gap:22px}
.card{background:#fff;border-radius:12px;padding:20px;margin-bottom:16px;box-shadow:0 2px 12px #0000000b}
.cat{color:#0a7750;font-size:13px;font-weight:800}
.card h2{margin:8px 0;font-size:23px}
.meta{color:#77837d;font-size:13px;margin:8px 0}
.btn{display:inline-block;background:#0b6845;color:#fff;padding:10px 15px;border-radius:8px;border:0;cursor:pointer}
.btn.red{background:#b8202a}
.btn.gray{background:#59645f}
.form{display:grid;gap:12px}
.form input,.form textarea,.form select{width:100%;padding:11px;border:1px solid #d6ddd9;border-radius:8px;font:inherit}
.form textarea{min-height:150px}
.admin{max-width:1050px;margin:30px auto;padding:18px}
.row{display:flex;gap:10px;flex-wrap:wrap;align-items:center}
.small{font-size:12px;color:#6d7772}
.news-image{width:100%;max-height:480px;object-fit:cover;border-radius:10px;margin:15px 0}
.thumb{width:160px;height:100px;object-fit:cover;border-radius:8px;margin-top:10px}
.status{padding:10px;border-radius:8px;background:#eef7f2;margin-top:5px}
.empty{padding:20px;text-align:center;color:#777}
.footer{background:#123d2d;color:#fff;padding:28px 4%;margin-top:40px}
@media(max-width:760px){
.head{display:block}
.grid{grid-template-columns:1fr}
.hero h1{font-size:25px}
.logo{font-size:28px}
}
</style>
</head>
<body>

<div class="top">শিক্ষাঙ্গনের কথা, শিক্ষকের কণ্ঠে</div>

<div class="head">
<div>
<a href="/" class="logo">শিক্ষক<span style="color:#d3262e">কণ্ঠ</span>২৪</a>
<div class="tag">শিক্ষাঙ্গনের কথা, শিক্ষকের কণ্ঠে</div>
</div>
<div>🔎 খবর খুঁজুন...</div>
</div>

<div class="nav">
<a href="/">প্রচ্ছদ</a>
<a href="/?cat=${encodeURIComponent("শিক্ষা সংবাদ")}">শিক্ষা সংবাদ</a>
<a href="/?cat=${encodeURIComponent("শিক্ষক সমাজ")}">শিক্ষক সমাজ</a>
<a href="/?cat=${encodeURIComponent("সাহিত্য")}">সাহিত্য</a>
<a href="/?cat=${encodeURIComponent("মতামত")}">মতামত</a>
<a href="/?cat=${encodeURIComponent("চাকরি ও নিয়োগ")}">চাকরি ও নিয়োগ</a>
<a href="/admin">Admin</a>
</div>

${content}

<div class="footer">© ২০২৬ শিক্ষককণ্ঠ২৪</div>

</body>
</html>`;
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, c => ({
    "&":"&amp;",
    "<":"&lt;",
    ">":"&gt;",
    '"':"&quot;",
    "'":"&#039;"
  }[c]));
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers:{
      "content-type":"application/json;charset=UTF-8",
      "cache-control":"no-store"
    }
  });
}

async function ensureDB() {
  await DB.prepare(`
    CREATE TABLE IF NOT EXISTS news (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      image_url TEXT,
      category TEXT DEFAULT 'সাধারণ',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      excerpt TEXT,
      body TEXT,
      date TEXT,
      published INTEGER DEFAULT 1
    )
  `).run();
}

async function getNews() {
  await ensureDB();

  const result = await DB.prepare(`
    SELECT
      id,
      title,
      content,
      image_url,
      category,
      created_at,
      COALESCE(excerpt,'') AS excerpt,
      COALESCE(body,content) AS body,
      COALESCE(date,substr(created_at,1,10)) AS date,
      COALESCE(published,1) AS published
    FROM news
    ORDER BY id DESC
  `).all();

  return result.results || [];
}

async function getOne(id) {
  await ensureDB();

  return await DB.prepare(`
    SELECT
      id,
      title,
      content,
      image_url,
      category,
      created_at,
      COALESCE(excerpt,'') AS excerpt,
      COALESCE(body,content) AS body,
      COALESCE(date,substr(created_at,1,10)) AS date,
      COALESCE(published,1) AS published
    FROM news
    WHERE id=?
  `).bind(id).first();
}

function adminPage() {
  const categoryOptions = CATEGORIES
    .map(c => `<option>${escapeHtml(c)}</option>`)
    .join("");

  return html(`
<main class="admin">

<div class="card" id="loginBox">
<h2>🔐 Admin Login</h2>

<div class="form">
<input id="password" type="password" placeholder="Admin Password">
<button class="btn" onclick="login()">Login</button>
</div>
</div>

<div id="dashboard" style="display:none">

<div class="row">
<h1>Admin Dashboard</h1>
<button class="btn" onclick="newNews()">+ নতুন নিউজ</button>
<button class="btn gray" onclick="loadNews()">↻ Refresh</button>
</div>

<div class="card">
<div id="editor"></div>
</div>

<div class="card">
<h2>📰 নিউজ তালিকা</h2>
<div id="newsList">লোড হচ্ছে...</div>
</div>

</div>
</main>

<script>
let editingId = null;

function login(){
  const p = document.getElementById("password").value;

  if(p === "12345678"){
    sessionStorage.setItem("sk24_admin","1");
    document.getElementById("loginBox").style.display="none";
    document.getElementById("dashboard").style.display="block";
    loadNews();
  }else{
    alert("ভুল পাসওয়ার্ড");
  }
}

function newNews(){
  editingId = null;

  document.getElementById("editor").innerHTML = \`
<h2>নতুন নিউজ</h2>

<div class="form">

<input id="title" placeholder="শিরোনাম">

<select id="category">
${categoryOptions}
</select>

<input id="date" type="date">

<label>সংবাদ ছবি</label>

<input
id="imageFile"
type="file"
accept="image/jpeg,image/png,image/webp"
onchange="uploadImage()"
>

<div id="uploadStatus" class="small"></div>

<img id="preview" class="thumb" style="display:none">

<textarea id="excerpt" placeholder="সংক্ষিপ্ত বর্ণনা"></textarea>

<textarea id="body" placeholder="বিস্তারিত সংবাদ"></textarea>

<label>
<input id="published" type="checkbox" checked>
Publish
</label>

<input id="imageUrl" type="hidden">

<div class="row">
<button class="btn" onclick="saveNews()">Save News</button>
<button class="btn gray" onclick="cancelEdit()">Cancel</button>
</div>

</div>
\`;

  document.getElementById("date").value =
    new Date().toISOString().slice(0,10);
}

async function uploadImage(){

  const file = document.getElementById("imageFile").files[0];

  if(!file) return;

  const status = document.getElementById("uploadStatus");
  status.innerText = "⏳ ছবি আপলোড হচ্ছে...";

  const form = new FormData();
  form.append("file", file);
  form.append("upload_preset", "shikkhokkontho");

  try{

    const response = await fetch(
      "https://api.cloudinary.com/v1_1/jg9ajdkn/image/upload",
      {
        method:"POST",
        body:form
      }
    );

    const data = await response.json();

    if(data.secure_url){

      document.getElementById("imageUrl").value =
        data.secure_url;

      document.getElementById("preview").src =
        data.secure_url;

      document.getElementById("preview").style.display =
        "block";

      status.innerText = "✅ ছবি আপলোড হয়েছে";

    }else{

      console.log(data);
      status.innerText = "❌ ছবি আপলোড হয়নি";

    }

  }catch(error){

    console.log(error);
    status.innerText = "❌ Upload error";

  }
}

async function saveNews(){

  const title =
    document.getElementById("title").value.trim();

  const category =
    document.getElementById("category").value;

  const date =
    document.getElementById("date").value;

  const excerpt =
    document.getElementById("excerpt").value.trim();

  const body =
    document.getElementById("body").value.trim();

  const image =
    document.getElementById("imageUrl").value;

  const published =
    document.getElementById("published").checked;

  if(!title){
    alert("শিরোনাম দিন");
    return;
  }

  if(!body){
    alert("বিস্তারিত সংবাদ লিখুন");
    return;
  }

  const payload = {
    title,
    category,
    date,
    excerpt,
    body,
    image,
    published
  };

  if(editingId){
    payload.id = editingId;
  }

  try{

    const response = await fetch(
      "/api/admin/news",
      {
        method:"POST",
        headers:{
          "content-type":"application/json",
          "x-admin-password":"12345678"
        },
        body:JSON.stringify(payload)
      }
    );

    const data = await response.json();

    if(data.ok){

      alert("✅ নিউজ সংরক্ষণ হয়েছে");

      document.getElementById("editor").innerHTML = "";

      editingId = null;

      loadNews();

    }else{

      alert(data.error || "সংরক্ষণ করা যায়নি");

    }

  }catch(error){

    console.log(error);
    alert("Server error");

  }
}

async function loadNews(){

  try{

    const response = await fetch(
      "/api/news?admin=1",
      {
        cache:"no-store"
      }
    );

    const news = await response.json();

    const list =
      document.getElementById("newsList");

    if(!Array.isArray(news) || !news.length){

      list.innerHTML =
        '<div class="empty">কোনো নিউজ নেই</div>';

      return;
    }

    list.innerHTML = news.map(n => \`
<div class="card">

<div class="cat">
\${esc(n.category)}
</div>

<h3>
\${esc(n.title)}
</h3>

<div class="small">
\${esc(n.date)}
·
\${Number(n.published) ? "Published" : "Draft"}
</div>

<div class="row" style="margin-top:10px">

<button class="btn" onclick="editNews(\${n.id})">
Edit
</button>

<button class="btn red" onclick="deleteNews(\${n.id})">
Delete
</button>

</div>

</div>
\`).join("");

  }catch(error){

    console.log(error);

    document.getElementById("newsList").innerHTML =
      '<div class="empty">নিউজ লোড করা যায়নি</div>';

  }
}

async function editNews(id){

  const response =
    await fetch("/api/news?id=" + id);

  const n = await response.json();

  if(!n.id){

    alert("নিউজ পাওয়া যায়নি");
    return;

  }

  editingId = n.id;

  let currentImage = "";

  if(n.image_url){

    currentImage =
      '<img class="thumb" src="' +
      attr(n.image_url) +
      '">';

  }

  document.getElementById("editor").innerHTML = \`
<h2>নিউজ সম্পাদনা</h2>

<div class="form">

<input id="title" value="\${attr(n.title)}">

<select id="category">
${categoryOptions}
</select>

<input id="date" type="date" value="\${attr(n.date)}">

<label>বর্তমান ছবি</label>

\${currentImage}

<label>নতুন ছবি চাইলে নির্বাচন করুন</label>

<input
id="imageFile"
type="file"
accept="image/jpeg,image/png,image/webp"
onchange="uploadImage()"
>

<div id="uploadStatus" class="small"></div>

<img id="preview" class="thumb" style="display:none">

<input
id="imageUrl"
type="hidden"
value="\${attr(n.image_url || "")}"
>

<textarea id="excerpt">\${esc(n.excerpt)}</textarea>

<textarea id="body">\${esc(n.body)}</textarea>

<label>
<input
id="published"
type="checkbox"
\${Number(n.published) ? "checked" : ""}
>
Publish
</label>

<div class="row">

<button class="btn" onclick="saveNews()">
Update News
</button>

<button class="btn gray" onclick="cancelEdit()">
Cancel
</button>

</div>

</div>
\`;

  document.getElementById("category").value =
    n.category;

}

async function deleteNews(id){

  if(!confirm("এই নিউজটি মুছে ফেলবেন?"))
    return;

  const response = await fetch(
    "/api/admin/news?id=" + id,
    {
      method:"DELETE",
      headers:{
        "x-admin-password":"12345678"
      }
    }
  );

  const data = await response.json();

  if(data.ok){

    alert("নিউজ মুছে ফেলা হয়েছে");
    loadNews();

  }else{

    alert(data.error || "মুছে ফেলা যায়নি");

  }
}

function cancelEdit(){

  document.getElementById("editor").innerHTML = "";

  editingId = null;

}

function esc(s){

  return String(s ?? "").replace(
    /[&<>"']/g,
    c => ({
      "&":"&amp;",
      "<":"&lt;",
      ">":"&gt;",
      '"':"&quot;",
      "'":"&#039;"
    }[c])
  );

}

function attr(s){

  return esc(s);

}

if(sessionStorage.getItem("sk24_admin") === "1"){

  document.getElementById("loginBox").style.display="none";

  document.getElementById("dashboard").style.display="block";

  loadNews();

}
</script>
`);
}

async function homePage(request) {

  const url = new URL(request.url);
  const category = url.searchParams.get("cat");

  let news = await getNews();

  news = news.filter(n => Number(n.published) === 1);

  if(category){
    news = news.filter(n => n.category === category);
  }

  const cards = news.map(n => `
<article class="card">

<div class="cat">
${escapeHtml(n.category)}
</div>

<h2>
${escapeHtml(n.title)}
</h2>

<div class="meta">
${escapeHtml(n.date)}
</div>

${n.image_url ? `
<img
src="${escapeHtml(n.image_url)}"
class="news-image"
loading="lazy"
>
` : ""}

<p>
${escapeHtml(n.excerpt || String(n.body || "").slice(0,220))}
</p>

<a class="btn" href="/news?id=${n.id}">
বিস্তারিত পড়ুন
</a>

</article>
`).join("");

  return html(`

<main class="wrap">

<div class="hero">

<div class="cat" style="color:#b9f1d5">
শিক্ষককণ্ঠ২৪
</div>

<h1>
শিক্ষাঙ্গনের গুরুত্বপূর্ণ সংবাদ, তথ্য ও বিশ্লেষণ
</h1>

<p>
শিক্ষা, শিক্ষক সমাজ, সাহিত্য, চাকরি ও নিয়োগসহ বিভিন্ন বিষয়ের নির্ভরযোগ্য তথ্য।
</p>

</div>

<div class="grid">

<section>

<div class="card">

<h2>
${category
  ? escapeHtml(category)
  : "সর্বশেষ সংবাদ"}
</h2>

${cards ||
  '<div class="empty">এই বিভাগে কোনো প্রকাশিত নিউজ নেই।</div>'}

</div>

</section>

<aside>

<div class="card">

<h2>জনপ্রিয় বিভাগ</h2>

${CATEGORIES.map(c => `
<p>
<a href="/?cat=${encodeURIComponent(c)}">
${escapeHtml(c)}
</a>
</p>
`).join("")}

</div>

</aside>

</div>

</main>

`);
}

async function newsPage(id) {

  const n = await getOne(id);

  if(!n || Number(n.published) !== 1){

    return html(`
<main class="wrap">

<div class="card">

<h1>নিউজ পাওয়া যায়নি</h1>

<a class="btn" href="/">
← প্রচ্ছদে ফিরে যান
</a>

</div>

</main>
`);

  }

  return html(`

<main class="wrap">

<div class="card">

<div class="cat">
${escapeHtml(n.category)}
</div>

<h1>
${escapeHtml(n.title)}
</h1>

<div class="meta">
${escapeHtml(n.date)}
</div>

${n.image_url ? `
<img
src="${escapeHtml(n.image_url)}"
class="news-image"
>
` : ""}

${n.excerpt ? `
<p>
<strong>${escapeHtml(n.excerpt)}</strong>
</p>
` : ""}

<div style="line-height:1.9">
${escapeHtml(n.body).replace(/\n/g,"<br>")}
</div>

<br>

<a class="btn" href="/">
← ফিরে যান
</a>

</div>

</main>

`);
}

async function saveNewsAPI(data) {

  await ensureDB();

  const title =
    String(data.title || "").trim();

  const category =
    String(data.category || "শিক্ষা সংবাদ");

  const excerpt =
    String(data.excerpt || "");

  const body =
    String(data.body || "").trim();

  const date =
    String(
      data.date ||
      new Date().toISOString().slice(0,10)
    );

  const image =
    String(data.image || "");

  const published =
    data.published ? 1 : 0;

  if(!title || !body){

    return json(
      {
        ok:false,
        error:"শিরোনাম ও বিস্তারিত সংবাদ প্রয়োজন"
      },
      400
    );

  }

  if(data.id){

    await DB.prepare(`
UPDATE news
SET
title=?,
content=?,
image_url=?,
category=?,
excerpt=?,
body=?,
date=?,
published=?
WHERE id=?
`)
    .bind(
      title,
      body,
      image,
      category,
      excerpt,
      body,
      date,
      published,
      Number(data.id)
    )
    .run();

  }else{

    await DB.prepare(`
INSERT INTO news
(title,content,image_url,category,excerpt,body,date,published)
VALUES(?,?,?,?,?,?,?,?)
`)
    .bind(
      title,
      body,
      image,
      category,
      excerpt,
      body,
      date,
      published
    )
    .run();

  }

  return json({ok:true});
}

export default {

  async fetch(request, env) {

    try{

      globalThis.DB = env.DB;

      if(!globalThis.DB){

        return new Response(
          "D1 database binding 'DB' পাওয়া যায়নি।",
          {
            status:500,
            headers:{
              "content-type":"text/plain;charset=UTF-8"
            }
          }
        );

      }

      const url = new URL(request.url);

      await ensureDB();

      /* PUBLIC API */

      if(
        url.pathname === "/api/news" &&
        request.method === "GET"
      ){

        const id =
          url.searchParams.get("id");

        if(id){

          const n = await getOne(id);

          return json(n || {});

        }

        const news = await getNews();

        return json(news);

      }

      /* ADMIN SAVE */

      if(
        url.pathname === "/api/admin/news" &&
        request.method === "POST"
      ){

        const password =
          request.headers.get("x-admin-password");

        if(password !== PASSWORD){

          return json(
            {
              ok:false,
              error:"Unauthorized"
            },
            401
          );

        }

        const data =
          await request.json();

        return await saveNewsAPI(data);

      }

      /* ADMIN DELETE */

      if(
        url.pathname === "/api/admin/news" &&
        request.method === "DELETE"
      ){

        const password =
          request.headers.get("x-admin-password");

        if(password !== PASSWORD){

          return json(
            {
              ok:false,
              error:"Unauthorized"
            },
            401
          );

        }

        const id =
          url.searchParams.get("id");

        if(!id){

          return json(
            {
              ok:false,
              error:"ID missing"
            },
            400
          );

        }

        await DB.prepare(
          "DELETE FROM news WHERE id=?"
        )
        .bind(Number(id))
        .run();

        return json({ok:true});

      }

      /* ADMIN */

      if(url.pathname === "/admin"){

        return new Response(
          adminPage(),
          {
            headers:{
              "content-type":
                "text/html;charset=UTF-8",
              "cache-control":
                "no-store"
            }
          }
        );

      }

      /* NEWS */

      if(url.pathname === "/news"){

        return new Response(
          await newsPage(
            url.searchParams.get("id")
          ),
          {
            headers:{
              "content-type":
                "text/html;charset=UTF-8",
              "cache-control":
                "no-store"
            }
          }
        );

      }

      /* HOME */

      if(url.pathname === "/"){

        return new Response(
          await homePage(request),
          {
            headers:{
              "content-type":
                "text/html;charset=UTF-8",
              "cache-control":
                "no-store"
            }
          }
        );

      }

      return new Response(
        "Not found",
        {status:404}
      );

    }catch(error){

      console.log(error);

      return new Response(
        "Server Error: " + error.message,
        {
          status:500,
          headers:{
            "content-type":
              "text/plain;charset=UTF-8"
          }
        }
      );

    }

  }

};
