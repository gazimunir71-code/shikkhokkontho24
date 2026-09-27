const DEMO = [
  {
    id: "demo-1",
    title: "শিক্ষাঙ্গনের নতুন উদ্যোগে শিক্ষকদের জন্য আধুনিক প্রশিক্ষণ",
    category: "শিক্ষা সংবাদ",
    excerpt: "শিক্ষকদের দক্ষতা উন্নয়নে প্রযুক্তিনির্ভর প্রশিক্ষণ ও নতুন উদ্যোগ নিয়ে আলোচনা চলছে।",
    body: "শিক্ষকদের পেশাগত দক্ষতা বাড়াতে প্রযুক্তিনির্ভর প্রশিক্ষণ গুরুত্বপূর্ণ ভূমিকা রাখতে পারে।",
    date: "২০২৬-০৯-২৩",
    image: "",
    published: true
  },
  {
    id: "demo-2",
    title: "ডিজিটাল শিক্ষায় বাড়ছে প্রযুক্তির ব্যবহার",
    category: "শিক্ষা সংবাদ",
    excerpt: "শ্রেণিকক্ষে ডিজিটাল উপকরণের ব্যবহার শিক্ষার্থীদের শেখার অভিজ্ঞতায় নতুন মাত্রা যোগ করছে।",
    body: "শ্রেণিকক্ষে প্রযুক্তির ব্যবহার শিক্ষার্থীদের শেখার নতুন সুযোগ তৈরি করছে।",
    date: "২০২৬-০৯-২২",
    image: "",
    published: true
  },
  {
    id: "demo-3",
    title: "শিক্ষকদের জন্য নতুন ক্যারিয়ার ও নিয়োগ তথ্য",
    category: "চাকরি ও নিয়োগ",
    excerpt: "নিয়োগ, পরীক্ষা ও ক্যারিয়ারসংক্রান্ত তথ্য এক জায়গায় তুলে ধরার জন্য এই বিভাগটি রাখা হয়েছে।",
    body: "নিয়োগ ও ক্যারিয়ারসংক্রান্ত তথ্য যাচাই করে প্রকাশ করুন।",
    date: "২০২৬-০৯-২১",
    image: "",
    published: true
  }
];

function layout(content, title="শিক্ষককণ্ঠ২৪") {
return `<!doctype html>
<html lang="bn">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title}</title>

<style>
*{box-sizing:border-box}
body{margin:0;font-family:Arial,"Noto Sans Bengali",sans-serif;background:#f5f7f6;color:#17221c}
a{text-decoration:none;color:inherit}
.top{background:#123d2d;color:#fff;padding:8px 4%;font-size:13px}
.head{background:#fff;padding:22px 4%;display:flex;justify-content:space-between;align-items:center}
.logo{font-size:34px;font-weight:800;color:#0b6845}
.tag{color:#66756d;font-size:14px}
.nav{background:#0d5a3d;color:#fff;padding:12px 4%;display:flex;gap:22px;flex-wrap:wrap;font-weight:600}
.wrap{max-width:1180px;margin:25px auto;padding:0 18px}
.hero{background:#123d2d;color:#fff;border-radius:14px;padding:35px;margin-bottom:25px}
.hero h1{font-size:34px;margin:0 0 12px}
.grid{display:grid;grid-template-columns:2fr 1fr;gap:22px}
.card{background:#fff;border-radius:12px;padding:20px;margin-bottom:16px;box-shadow:0 2px 12px #0000000b}
.cat{color:#0a7750;font-size:13px;font-weight:800}
.card h2{margin:8px 0;font-size:23px}
.meta{color:#77837d;font-size:13px}
.btn{display:inline-block;background:#0b6845;color:white;padding:10px 15px;border-radius:8px;border:0;cursor:pointer}
.btn.red{background:#b8202a}
.btn.gray{background:#59645f}
.form{display:grid;gap:12px}
.form input,.form textarea,.form select{width:100%;padding:11px;border:1px solid #d6ddd9;border-radius:8px;font:inherit}
.form textarea{min-height:150px}
.admin{max-width:1050px;margin:30px auto;padding:18px}
.row{display:flex;gap:10px;flex-wrap:wrap;align-items:center}
.small{font-size:12px;color:#6d7772}
.footer{background:#123d2d;color:#fff;padding:28px 4%;margin-top:40px}
.preview{max-width:300px;width:100%;border-radius:10px;margin-top:10px}
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
<a href="https://shikkhokkontho24.gazi-munir71.workers.dev/" class="logo">শিক্ষক<span style="color:#d3262e">কণ্ঠ</span>২৪</a>
<div class="tag">শিক্ষাঙ্গনের কথা, শিক্ষকের কণ্ঠে</div>
</div>
<div>🔎 খবর খুঁজুন...</div>
</div>

<div class="nav">
<a href="/">প্রচ্ছদ</a>
<a href="/?cat=শিক্ষা সংবাদ">শিক্ষা সংবাদ</a>
<a href="/?cat=শিক্ষক সমাজ">শিক্ষক সমাজ</a>
<a href="/?cat=সাহিত্য">সাহিত্য</a>
<a href="/?cat=মতামত">মতামত</a>
<a href="/?cat=চাকরি ও নিয়োগ">চাকরি ও নিয়োগ</a>
<a href="/admin">Admin</a>
</div>

${content}

<div class="footer">© ২০২৬ শিক্ষককণ্ঠ২৪</div>

</body>
</html>`;
}

function home(){

return layout(`

<main class="wrap">

<div class="hero">
<div class="cat" style="color:#b9f1d5">শিক্ষককণ্ঠ২৪</div>
<h1>শিক্ষাঙ্গনের গুরুত্বপূর্ণ সংবাদ, তথ্য ও বিশ্লেষণ</h1>
<p>Admin Panel থেকে সংবাদ যোগ করুন।</p>
<a class="btn" href="/admin">Admin Panel খুলুন</a>
</div>

<div class="grid">

<section>

<div class="card">
<h2>সর্বশেষ সংবাদ</h2>
<div id="list">লোড হচ্ছে...</div>
</div>

</section>

<aside>

<div class="card">
<h2>জনপ্রিয় বিভাগ</h2>
<p>শিক্ষা সংবাদ</p>
<p>শিক্ষক সমাজ</p>
<p>চাকরি ও নিয়োগ</p>
<p>সাহিত্য</p>
<p>মতামত</p>
</div>

</aside>

</div>

</main>

<script>

const KEY="sk24_news_v1";
const demo=${JSON.stringify(DEMO)};

let news=JSON.parse(localStorage.getItem(KEY)||"null");

if(!news){
news=demo;
localStorage.setItem(KEY,JSON.stringify(news));
}

const params=new URLSearchParams(location.search);
const cat=params.get("cat");

if(cat) news=news.filter(n=>n.category===cat);

document.getElementById("list").innerHTML=

news.filter(n=>n.published)
.sort((a,b)=>b.date.localeCompare(a.date))
.map(n=>\`

<article class="card">

<div class="cat">\${escapeHtml(n.category)}</div>

<h2>\${escapeHtml(n.title)}</h2>

<div class="meta">\${escapeHtml(n.date)}</div>

\${n.image ? \`<img src="\${escapeHtml(n.image)}" class="preview">\` : ""}

<p>\${escapeHtml(n.excerpt)}</p>

<a class="btn" href="/news?id=\${encodeURIComponent(n.id)}">বিস্তারিত</a>

</article>

\`).join("") || "<p>এই বিভাগে কোনো সংবাদ নেই।</p>";

function escapeHtml(s){
return String(s).replace(/[&<>"']/g,c=>({
"&":"&amp;",
"<":"&lt;",
">":"&gt;",
'"':"&quot;",
"'":"&#039;"
}[c]));
}

</script>

`);
}

function admin(){

return layout(`

<main class="admin">

<div class="card" id="login">

<h2>Admin Login</h2>

<div class="form">

<input id="pw" type="password" placeholder="Password">

<button class="btn" onclick="login()">Login</button>

</div>

</div>


<div id="panel" style="display:none">

<div class="row">

<h1>Admin Dashboard</h1>

<button class="btn" onclick="newPost()">+ নতুন নিউজ</button>

</div>


<div class="card">

<div id="editor"></div>

</div>


<div class="card">

<h2>নিউজ তালিকা</h2>

<div id="items"></div>

</div>

</div>

</main>


<script>

const KEY="sk24_news_v1";

const DEMO=${JSON.stringify(DEMO)};


function data(){

return JSON.parse(
localStorage.getItem(KEY)||JSON.stringify(DEMO)
);

}


function save(x){

localStorage.setItem(KEY,JSON.stringify(x));

render();

}


function login(){

const pw=document.getElementById("pw").value;

if(pw==="12345678"){

sessionStorage.setItem("sk24_admin","1");

show();

}else{

alert("ভুল পাসওয়ার্ড");

}

}


function show(){

document.getElementById("login").style.display="none";

document.getElementById("panel").style.display="block";

render();

}


function render(){

const ns=data();

document.getElementById("items").innerHTML=

ns.map(n=>\`

<div class="card">

<div class="cat">\${esc(n.category)}</div>

<h3>\${esc(n.title)}</h3>

<div class="small">

\${esc(n.date)} · \${n.published?"Published":"Draft"}

</div>

<div class="row">

<button class="btn" onclick="editPost('\${n.id}')">
Edit
</button>

<button class="btn red" onclick="delPost('\${n.id}')">
Delete
</button>

</div>

</div>

\`).join("");

}


function newPost(){

editPost("");

}


function editPost(id){

const n=id
?data().find(x=>x.id===id)
:{
id:"",
title:"",
category:"শিক্ষা সংবাদ",
excerpt:"",
body:"",
date:new Date().toISOString().slice(0,10),
image:"",
published:true
};


document.getElementById("editor").innerHTML=\`

<h2>\${id?"নিউজ সম্পাদনা":"নতুন নিউজ"}</h2>

<div class="form">

<input id="t"
value="\${attr(n.title)}"
placeholder="শিরোনাম">


<select id="c">

<option>শিক্ষা সংবাদ</option>
<option>শিক্ষক সমাজ</option>
<option>সাহিত্য</option>
<option>মতামত</option>
<option>গবেষণা</option>
<option>চাকরি ও নিয়োগ</option>
<option>জীবনধারা</option>

</select>


<input id="d"
value="\${attr(n.date)}"
type="date">


<label>🖼️ সংবাদ ছবি</label>

<input id="imgFile"
type="file"
accept="image/*"
onchange="uploadImage()">


<div id="uploadStatus" class="small"></div>


<input id="im"
value="\${attr(n.image)}"
placeholder="ছবির URL">


<img id="imgPreview"
class="preview"
src="\${n.image||""}"
style="\${n.image?"display:block":"display:none"}">


<textarea id="e"
placeholder="সংক্ষিপ্ত বর্ণনা">\${esc(n.excerpt)}</textarea>


<textarea id="b"
placeholder="বিস্তারিত সংবাদ">\${esc(n.body)}</textarea>


<label>

<input id="p"
type="checkbox"
\${n.published?"checked":""}>

Publish

</label>


<div class="row">

<button class="btn"
onclick="savePost('\${id}')">
Save
</button>

<button class="btn gray"
onclick="document.getElementById('editor').innerHTML=''">
Cancel
</button>

</div>

</div>

\`;


document.getElementById("c").value=n.category;

}


async function uploadImage(){

const file=document.getElementById("imgFile").files[0];

if(!file)return;

const status=document.getElementById("uploadStatus");

status.innerText="⏳ ছবি আপলোড হচ্ছে...";

const form=new FormData();

form.append("file",file);

form.append("upload_preset","shikkhokkontho");


try{

const res=await fetch(
"https://api.cloudinary.com/v1_1/jg9ajdkn/image/upload",
{
method:"POST",
body:form
}
);

const data=await res.json();


if(data.secure_url){

document.getElementById("im").value=data.secure_url;

const preview=document.getElementById("imgPreview");

preview.src=data.secure_url;

preview.style.display="block";

status.innerText="✅ ছবি আপলোড হয়েছে";

}else{

console.log(data);

status.innerText="❌ ছবি আপলোড হয়নি";

}

}catch(e){

console.log(e);

status.innerText="❌ Upload error";

}

}


function savePost(id){

let ns=data();

let n={

id:id||("n-"+Date.now()),

title:v("t"),

category:v("c"),

excerpt:v("e"),

body:v("b"),

date:v("d"),

image:v("im"),

published:document.getElementById("p").checked

};


const i=ns.findIndex(x=>x.id===n.id);

if(i>=0)

ns[i]=n;

else

ns.unshift(n);


save(ns);

document.getElementById("editor").innerHTML="";

}


function delPost(id){

if(confirm("নিউজটি মুছে ফেলবেন?"))

save(data().filter(n=>n.id!==id));

}


function v(id){

return document.getElementById(id).value;

}


function esc(s){

return String(s??"").replace(/[&<>"']/g,c=>({

"&":"&amp;",
"<":"&lt;",
">":"&gt;",
'"':"&quot;",
"'":"&#039;"

}[c]));

}


function attr(s){

return esc(s).replace(/"/g,"&quot;");

}


if(sessionStorage.getItem("sk24_admin")==="1")

show();

</script>

`);
}


function newsPage(id){

const all=JSON.parse(
localStorageData()
);

const n=all.find(x=>x.id===id);

return layout(

n

?`

<main class="wrap">

<div class="card">

<div class="cat">${n.category}</div>

<h1>${n.title}</h1>

<div class="meta">${n.date}</div>

${n.image ? `<img src="${n.image}" class="preview">` : ""}

<p>${n.body}</p>

<a class="btn" href="/">← ফিরে যান</a>

</div>

</main>

`

:`

<main class="wrap">

<div class="card">

<h1>নিউজ পাওয়া যায়নি</h1>

</div>

</main>

`

);

}


function localStorageData(){

return JSON.stringify(DEMO);

}


export default {

async fetch(request){

const u=new URL(request.url);


if(u.pathname==="/")

return new Response(home(),{

headers:{
"content-type":"text/html;charset=UTF-8"
}

});


if(u.pathname==="/admin")

return new Response(admin(),{

headers:{
"content-type":"text/html;charset=UTF-8"
}

});


if(u.pathname==="/news")

return new Response(
newsPage(u.searchParams.get("id")),
{
headers:{
"content-type":"text/html;charset=UTF-8"
}
}
);


return new Response("Not found",{status:404});

}

};
