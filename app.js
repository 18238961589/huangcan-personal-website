(() => {
  "use strict";
  const cfg = window.SITE_CONFIG || {};
  const configured = cfg.SUPABASE_URL && cfg.SUPABASE_ANON_KEY &&
    cfg.SUPABASE_URL.startsWith("https://") &&
    !cfg.SUPABASE_URL.includes("在这里填写") &&
    !cfg.SUPABASE_ANON_KEY.includes("在这里填写");
  const $ = (id) => document.getElementById(id);
  const defaultContent = {
    tagline: "带着好奇心走近科研，用行动回应每一次机会。",
    intro: "这里是我的个人空间。我希望通过持续学习、动手实践和真诚交流，让你更了解我。",
    hero_meta: "保持好奇，认真行动，持续成长。",
    avatar_url: "",
    about_title: "一个愿意认真学习、主动探索的人。",
    about_text: "我愿意从基础开始，把不懂的问题拆解清楚，再通过练习和验证逐步掌握。我也相信，遇到困难时持续尝试、及时复盘，比只停留在想法里更重要。",
    personality_title: "真诚、好奇、愿意行动",
    personality_text: "我对新事物保持好奇，愿意听取建议，也愿意承认自己的不足。面对陌生任务，我希望先理解目标，再拆分步骤、动手尝试，并根据结果继续改进。",
    lab_title: "我向往的不只是一个机会，更是一个能持续探索、认真做事的环境。",
    lab_text: "我希望有机会接触真实的研究问题，学习规范的方法，参与团队协作，并在一次次实践中提升自己的能力。",
    lab_point1_title: "对未知保持兴趣",
    lab_point1_text: "我想知道问题为什么发生、有哪些可能的解释，以及怎样通过实验或数据去验证。",
    lab_point2_title: "尊重过程与证据",
    lab_point2_text: "我愿意学习记录、复现、检查和复盘，不只追求结果，也重视得出结果的过程。",
    lab_point3_title: "在团队中成长",
    lab_point3_text: "我期待向老师和学长学姐学习，也希望在完成分配任务的过程中，逐渐承担更多责任。",
    resolve_title: "从小事做起，用行动证明自己。",
    resolve_text: "如果有机会加入实验室，我会认真对待每一项任务：不懂就主动查资料、及时请教；做完后核对结果、记录过程；出现问题时不回避，尽力定位原因并总结经验。我知道自己还有很多需要学习的地方，也愿意用持续投入来缩短差距。",
    commitments: ["保持稳定学习与实践", "认真记录、验证和复盘", "主动沟通，按时完成任务"],
    work_intro: "这里会逐步整理我的学习经历、实践项目、作品和阶段性成果。与其夸大自己，不如清楚记录做过什么、遇到什么问题，以及从中学到了什么。",
    projects: [
      { title: "学习与实践记录", description: "持续补充正在学习的技能、完成的练习和遇到的问题。", date: "持续更新" },
      { title: "项目实践", description: "记录项目目标、本人负责的工作、验证方式与阶段成果。", date: "待补充" },
      { title: "阶段性复盘", description: "整理收获、不足和下一步计划，让进步有迹可循。", date: "持续更新" }
    ],
    contact_title: "期待与你交流。",
    contact_text: "如果你对我的经历、学习方向或项目感兴趣，欢迎通过下面的方式联系我。",
    contact_email: "hello@example.com",
    contact_other: "也可以在留言板联系我 ↗",
    contact_url: "",
    footer_note: "认真学习，持续实践，保持真诚。"
  };
  let db = null, content = structuredClone(defaultContent), sessionUser = null;
  let messageOffset = 0, pageSize = 10, allLoaded = false, visibleMessages = [];
  const replyOpen = new Set();

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
  }
  function toast(msg) {
    const el = $("toast"); el.textContent = msg; el.classList.add("show");
    window.setTimeout(() => el.classList.remove("show"), 3000);
  }
  function setStatus(id, msg, isError = false) {
    const el = $(id); if (!el) return;
    el.textContent = msg; el.style.color = isError ? "#9b3d37" : "#597653";
  }
  function formatDate(date) {
    try { return new Intl.DateTimeFormat("zh-CN", {year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date(date)); }
    catch { return ""; }
  }
  function initials(name) { return [...String(name || "?").trim()].slice(0,1).join("").toUpperCase(); }
  function safeUrl(url) {
    try { const u = new URL(url); return ["http:","https:","mailto:"].includes(u.protocol) ? u.href : "#"; }
    catch { return "#"; }
  }
  function renderContent() {
    const textMap = {
      "hero-name":"黄灿","hero-tagline":content.tagline,"hero-intro":content.intro,"hero-meta":content.hero_meta,
      "about-title":content.about_title,"about-text":content.about_text,
      "personality-title":content.personality_title,"personality-text":content.personality_text,
      "lab-title":content.lab_title,"lab-text":content.lab_text,
      "lab-point1-title":content.lab_point1_title,"lab-point1-text":content.lab_point1_text,
      "lab-point2-title":content.lab_point2_title,"lab-point2-text":content.lab_point2_text,
      "lab-point3-title":content.lab_point3_title,"lab-point3-text":content.lab_point3_text,
      "resolve-title":content.resolve_title,"resolve-text":content.resolve_text,
      "work-intro":content.work_intro,"contact-title":content.contact_title,"contact-text":content.contact_text,
      "contact-email":content.contact_email,"contact-other":content.contact_other,"footer-note":content.footer_note
    };
    Object.entries(textMap).forEach(([id, val]) => { if ($(id)) $(id).textContent = val || ""; });
    $("contact-email").href = content.contact_email ? "mailto:" + content.contact_email : "#contact";
    $("contact-other").href = content.contact_url ? safeUrl(content.contact_url) : "#guestbook";
    $("commitment-list").innerHTML = (content.commitments || []).map((s,i)=>`<li><span>${String(i+1).padStart(2,"0")}</span>${escapeHtml(s)}</li>`).join("");
    const projects = content.projects || [];
    $("project-grid").innerHTML = projects.length ? projects.map((p,i)=>`<article class="project-card"><div class="project-top"><span>${String(i+1).padStart(2,"0")}</span><span>✳</span></div><h3>${escapeHtml(p.title)}</h3><p>${escapeHtml(p.description)}</p><small>${escapeHtml(p.date || "")}</small></article>`).join("") : `<article class="project-card placeholder"><div class="project-top"><span>01</span><span>✳</span></div><h3>新的经历，正在路上</h3><p>这里将记录我的学习和实践。</p><small>COMING SOON</small></article>`;
    $("work-count").textContent = `${String(projects.length).padStart(2,"0")} — KEEP BUILDING`;
    if (content.avatar_url) {
      $("hero-avatar").src = content.avatar_url; $("hero-avatar").classList.remove("hidden"); $("hero-avatar-placeholder").classList.add("hidden");
    } else {
      $("hero-avatar").classList.add("hidden"); $("hero-avatar-placeholder").classList.remove("hidden");
    }
    $("year").textContent = new Date().getFullYear();
    document.title = "黄灿｜个人主页";
  }
  async function loadContent() {
    if (!db) { renderContent(); return; }
    const {data,error} = await db.from("site_content").select("content").eq("id",1).maybeSingle();
    if (error) { console.error(error); toast("读取网站内容失败，请检查 Supabase 配置和 SQL。"); renderContent(); return; }
    if (data && data.content) content = {...defaultContent, ...data.content};
    renderContent();
  }
  function fillEditor() {
    const form = $("content-form");
    const keys = ["tagline","intro","hero_meta","about_title","about_text","personality_title","personality_text","lab_title","lab_text","lab_point1_title","lab_point1_text","lab_point2_title","lab_point2_text","lab_point3_title","lab_point3_text","resolve_title","resolve_text","work_intro","contact_title","contact_text","contact_email","contact_other","contact_url","footer_note"];
    keys.forEach(k => { if (form.elements[k]) form.elements[k].value = content[k] || ""; });
    form.elements.commitments.value = (content.commitments || []).join("\n");
    form.elements.projects.value = (content.projects || []).map(p=>`${p.title} | ${p.description} | ${p.date || ""}`).join("\n");
  }
  function editorToContent(form) {
    const keys = ["tagline","intro","hero_meta","about_title","about_text","personality_title","personality_text","lab_title","lab_text","lab_point1_title","lab_point1_text","lab_point2_title","lab_point2_text","lab_point3_title","lab_point3_text","resolve_title","resolve_text","work_intro","contact_title","contact_text","contact_email","contact_other","contact_url","footer_note"];
    const next = {...content};
    keys.forEach(k => next[k] = form.elements[k].value.trim());
    next.commitments = form.elements.commitments.value.split("\n").map(s=>s.trim()).filter(Boolean).slice(0,8);
    next.projects = form.elements.projects.value.split("\n").map(line=>{
      const parts = line.split("|").map(s=>s.trim());
      return {title:parts[0]||"",description:parts[1]||"",date:parts[2]||""};
    }).filter(p=>p.title).slice(0,12);
    return next;
  }
  async function saveContent(event) {
    event.preventDefault();
    if (!db || !sessionUser) return setStatus("content-status","请先登录管理员账号。",true);
    const next = editorToContent(event.currentTarget);
    const {error} = await db.from("site_content").upsert({id:1,content:next,updated_at:new Date().toISOString()});
    if (error) { console.error(error); return setStatus("content-status","保存失败："+error.message,true); }
    content = next; renderContent(); setStatus("content-status","保存成功！主页内容已更新。"); toast("主页内容已保存");
  }
  async function loadMessages(reset = false) {
    if (!db) {
      $("messages-list").innerHTML = `<div class="empty-state">留言板尚未连接数据库。完成 Supabase 配置后，访客留言就可以长期保存。</div>`;
      return;
    }
    if (reset) { messageOffset = 0; allLoaded = false; visibleMessages = []; $("messages-list").innerHTML = ""; }
    if (allLoaded) return;
    let query = db.from("comments").select("id,parent_id,author_name,body,is_approved,is_admin_reply,created_at").eq("is_approved",true).order("created_at",{ascending:true}).range(messageOffset,messageOffset+pageSize-1);
    const {data,error} = await query;
    if (error) { console.error(error); $("messages-list").innerHTML = `<div class="empty-state">暂时无法加载留言。请检查数据库配置。</div>`; return; }
    visibleMessages = reset ? (data || []) : visibleMessages.concat(data || []);
    messageOffset += (data || []).length;
    if (!data || data.length < pageSize) allLoaded = true;
    renderMessages();
    $("load-more").classList.toggle("hidden",allLoaded);
  }
  function renderMessages() {
    const roots = visibleMessages.filter(m=>!m.parent_id);
    const replies = visibleMessages.filter(m=>m.parent_id);
    if (!roots.length) { $("messages-list").innerHTML = `<div class="empty-state">还没有公开留言。欢迎成为第一个留言的人。</div>`; return; }
    $("messages-list").innerHTML = roots.map(m => {
      const children = replies.filter(r=>String(r.parent_id)===String(m.id));
      return `<article class="message-item" data-message="${m.id}"><div class="message-head"><span class="message-avatar">${escapeHtml(initials(m.author_name))}</span><span class="message-author">${escapeHtml(m.author_name)}</span>${m.is_admin_reply?'<span class="public-badge">黄灿</span>':""}<time class="message-date">${formatDate(m.created_at)}</time></div><div class="message-body">${escapeHtml(m.body)}</div><button class="reply-link" type="button" data-reply="${m.id}">回复这条留言 ↗</button><div class="reply-thread">${children.map(r=>`<article class="message-item"><div class="message-head"><span class="message-avatar">${escapeHtml(initials(r.author_name))}</span><span class="message-author">${escapeHtml(r.author_name)}</span>${r.is_admin_reply?'<span class="public-badge">黄灿</span>':""}<time class="message-date">${formatDate(r.created_at)}</time></div><div class="message-body">${escapeHtml(r.body)}</div>${r.parent_id?`<button class="reply-link" type="button" data-reply="${m.id}">回复这条留言 ↗</button>`:""}</article>`).join("")}</div><div class="reply-slot" id="reply-slot-${m.id}"></div></article>`;
    }).join("");
    $("messages-list").querySelectorAll("[data-reply]").forEach(btn=>btn.addEventListener("click",()=>toggleReply(btn.dataset.reply)));
  }
  function toggleReply(id) {
    const slot = $("reply-slot-"+id); if (!slot) return;
    if (replyOpen.has(String(id))) { replyOpen.delete(String(id)); slot.innerHTML=""; return; }
    replyOpen.add(String(id));
    slot.innerHTML = `<form class="reply-form" data-parent="${id}"><input name="name" maxlength="50" placeholder="你的昵称" required aria-label="你的昵称"><textarea name="body" rows="3" maxlength="1500" placeholder="写下你的回复……" required aria-label="回复内容"></textarea><p class="form-note">无需注册。回复同样需要审核后公开。</p><button class="button button-dark" type="submit">提交回复 ↗</button><p class="form-status"></p></form>`;
    slot.querySelector("form").addEventListener("submit",submitMessage);
  }
  async function submitMessage(event) {
    event.preventDefault();
    if (!db) return toast("留言板还未连接数据库，请先完成部署配置。");
    const form = event.currentTarget, button = form.querySelector("button"), name = form.elements.name.value.trim(), body = (form.elements.message?.value || form.elements.body?.value || "").trim(), parent = form.dataset.parent || null;
    if (!name || !body) return;
    button.disabled = true; button.textContent = "正在提交…";
    const {error} = await db.from("comments").insert({author_name:name,body,parent_id:parent ? Number(parent) : null,is_approved:false,is_admin_reply:false});
    button.disabled = false; button.textContent = parent ? "提交回复 ↗" : "提交留言 ↗";
    if (error) { console.error(error); const status=form.querySelector(".form-status") || $("message-status"); status.textContent="提交失败，请稍后重试。"; status.style.color="#9b3d37"; return; }
    form.reset(); const status=form.querySelector(".form-status") || $("message-status"); status.textContent="提交成功！留言将在管理员审核通过后公开。"; status.style.color="#597653";
    if (parent) { replyOpen.delete(String(parent)); const slot=$("reply-slot-"+parent); if(slot) slot.innerHTML=""; }
    toast("已提交，等待审核");
  }
  async function login(event) {
    event.preventDefault();
    if (!db) return setStatus("login-status","请先填写 config.js 中的 Supabase URL 和公钥。",true);
    const email=$("admin-email").value.trim(), password=$("admin-password").value;
    const {data,error}=await db.auth.signInWithPassword({email,password});
    if (error) return setStatus("login-status","登录失败，请检查邮箱、密码以及管理员权限。",true);
    sessionUser=data.user;
    const {data:isAdmin,error:adminError}=await db.rpc("is_site_admin");
    if (adminError || isAdmin !== true) { await db.auth.signOut(); sessionUser=null; return setStatus("login-status","账号验证成功，但此账号还未加入网站管理员名单。请按 README 中的步骤配置管理员 UUID。",true); }
    $("login-panel").classList.add("hidden"); $("admin-panel").classList.remove("hidden"); fillEditor(); await loadModeration();
  }
  async function checkSession() {
    if (!db) return;
    const {data}=await db.auth.getSession();
    if (data.session) {
      const {data:isAdmin}=await db.rpc("is_site_admin");
      if (isAdmin) { sessionUser=data.session.user; $("login-panel").classList.add("hidden"); $("admin-panel").classList.remove("hidden"); fillEditor(); }
    }
  }
  async function logout() {
    if (db) await db.auth.signOut();
    sessionUser=null; $("admin-panel").classList.add("hidden"); $("login-panel").classList.remove("hidden"); $("admin-password").value=""; setStatus("login-status","");
  }
  async function loadModeration() {
    const el=$("moderation-list");
    const {data,error}=await db.from("comments").select("id,parent_id,author_name,body,is_approved,is_admin_reply,created_at").order("created_at",{ascending:false}).limit(100);
    if (error) { el.textContent="无法加载留言，请检查管理员 RLS 策略。"; return; }
    if (!data.length) { el.innerHTML='<div class="empty-state">暂时没有留言。</div>'; return; }
    el.innerHTML=data.map(m=>`<article class="moderation-item"><div class="message-head"><span class="message-avatar">${escapeHtml(initials(m.author_name))}</span><span class="message-author">${escapeHtml(m.author_name)}</span><time class="message-date">${formatDate(m.created_at)}</time></div><p>${escapeHtml(m.body)}</p><p class="form-note">${m.parent_id?"回复留言 #"+m.parent_id:"访客留言"} · ${m.is_approved?"已公开":"待审核"}</p><div class="moderation-actions">${!m.is_approved?`<button class="button button-dark" data-approve="${m.id}" type="button">批准公开</button>`:""}<button class="button button-outline danger" data-delete="${m.id}" type="button">删除</button></div></article>`).join("");
    el.querySelectorAll("[data-approve]").forEach(b=>b.addEventListener("click",()=>moderateComment(b.dataset.approve,"approve")));
    el.querySelectorAll("[data-delete]").forEach(b=>b.addEventListener("click",()=>moderateComment(b.dataset.delete,"delete")));
  }
  async function moderateComment(id,action) {
    if (!sessionUser) return;
    if (action==="delete") {
      if (!confirm("确定删除这条留言吗？此操作不可撤销。")) return;
      // 删除父留言前先删除回复，避免外键阻止操作。
      await db.from("comments").delete().eq("parent_id",id);
      const {error}=await db.from("comments").delete().eq("id",id);
      if(error) return toast("删除失败："+error.message);
    } else {
      const {error}=await db.from("comments").update({is_approved:true}).eq("id",id);
      if(error) return toast("审核失败："+error.message);
    }
    await loadModeration(); await loadMessages(true); toast(action==="delete"?"留言已删除":"留言已批准公开");
  }
  async function uploadAvatar() {
    if (!db || !sessionUser) return toast("请先登录管理员账号。");
    const file=$("avatar-file").files[0]; if(!file) return toast("请先选择一张头像图片。");
    if(!["image/jpeg","image/png","image/webp"].includes(file.type)) return toast("只支持 JPG、PNG 或 WebP 图片。");
    if(file.size>3*1024*1024) return toast("图片不能超过 3 MB。");
    const ext=file.type==="image/png"?"png":file.type==="image/webp"?"webp":"jpg";
    const path=`${Date.now()}-${crypto.randomUUID()}.${ext}`;
    const {error}=await db.storage.from("avatars").upload(path,file,{cacheControl:"3600",upsert:false,contentType:file.type});
    if(error) return toast("头像上传失败："+error.message);
    const {data}=db.storage.from("avatars").getPublicUrl(path);
    const next={...content,avatar_url:data.publicUrl};
    const {error:saveError}=await db.from("site_content").upsert({id:1,content:next,updated_at:new Date().toISOString()});
    if(saveError) return toast("图片已上传，但保存头像地址失败："+saveError.message);
    content=next;renderContent();fillEditor();toast("头像上传并应用成功");
  }
  function setTab(tab) {
    document.querySelectorAll(".admin-tab").forEach(b=>b.classList.toggle("active",b.dataset.tab===tab));
    $("admin-edit-tab").classList.toggle("hidden",tab!=="edit"); $("admin-moderate-tab").classList.toggle("hidden",tab!=="moderate");
    if(tab==="moderate") loadModeration();
  }
  function openAdmin() { $("admin-modal").classList.remove("hidden"); $("admin-email").focus(); }
  function closeAdmin() { $("admin-modal").classList.add("hidden"); }
  function init() {
    $("message-form").addEventListener("submit",submitMessage);
    $("admin-open").addEventListener("click",openAdmin); $("admin-close").addEventListener("click",closeAdmin);
    $("admin-modal").addEventListener("click",e=>{if(e.target===$("admin-modal"))closeAdmin();});
    $("login-form").addEventListener("submit",login); $("content-form").addEventListener("submit",saveContent);
    $("logout-button").addEventListener("click",logout); $("avatar-upload").addEventListener("click",uploadAvatar);
    document.querySelectorAll(".admin-tab").forEach(b=>b.addEventListener("click",()=>setTab(b.dataset.tab)));
    $("load-more").addEventListener("click",()=>loadMessages(false));
    if (!configured || !window.supabase) {
      renderContent(); loadMessages();
      console.warn("请先配置 config.js，并确认可访问 Supabase CDN。");
      return;
    }
    db=window.supabase.createClient(cfg.SUPABASE_URL,cfg.SUPABASE_ANON_KEY);
    loadContent();loadMessages(true);checkSession();
    db.auth.onAuthStateChange((_event,session)=>{if(!session){sessionUser=null;}});
  }
  document.addEventListener("DOMContentLoaded",init);
})();
