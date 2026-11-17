/* DS Digital — Painel administrativo. Autorização via GitHub; nenhum segredo persistido. */
(() => {
  "use strict";
  const OWNER = "Daniel-Soliz";
  const REPO = "ds-digital-portfolio";
  const API = "https://api.github.com";
  const BASE = "/repos/" + OWNER + "/" + REPO;
  const $ = selector => document.querySelector(selector);
  const root = $("#editor-sections");
  let token = "";
  let content = null;
  let contentSHA = "";
  let lastSaved = "";
  let activeSection = "identidade";
  let account = "";
  let busy = false;
  let previewTimeout = null;

  const SECTION_DEFS = [
    { id:"identidade", title:"Identidade visual e configurações", detail:"Logo, cores, título da aba, descrição, fundo e textos da marca.", fields:[
      ["site.brandName","Nome da marca"],["site.brandSubtitle","Subtítulo da marca"],
      ["site.logoText","Texto do logotipo"],["site.logoImage","Imagem do logotipo","image"],
      ["site.footerLogoText","Texto do logotipo no rodapé"],["site.footerBrandSuffix","Complemento do rodapé"],
      ["site.footerCopyright","Texto de direitos autorais"],
      ["site.title","Título da página / navegador"],["site.description","Descrição para buscadores","textarea"],
      ["site.socialTitle","Título ao compartilhar link"],["site.socialDescription","Descrição ao compartilhar link","textarea"],
      ["site.backgroundColor","Cor do fundo","color"],["site.accentColor","Cor de destaque","color"],
      ["site.textColor","Cor do texto principal","color"],["site.themeColor","Cor do navegador","color"],
      ["site.heroBackgroundImage","Imagem de fundo da primeira tela","image"],
      ["contact.phone","Número do WhatsApp (DDI + DDD + número)"]
    ],lists:[{path:"navigation",label:"Menu superior",fields:[["label","Nome do item"],["href","Destino (ex.: #projetos ou https://...)"]],addLabel:"Adicionar item ao menu"}],
    extra:[["headerCta.label","Texto do botão no topo"],["headerCta.message","Mensagem inicial do botão no topo","textarea"]] },
    { id:"inicio", title:"Primeira tela", detail:"Todos os textos, botões, detalhes e imagem do destaque na abertura.", fields:[
      ["hero.eyebrow","Texto pequeno acima do título"],["hero.title","Título principal"],["hero.highlight","Parte destacada do título"],
      ["hero.description","Texto de apresentação","textarea"],["hero.ctaLabel","Texto do botão principal"],["hero.ctaMessage","Mensagem do WhatsApp principal","textarea"],
      ["hero.secondaryLabel","Texto do botão secundário"],["hero.secondaryHref","Link do botão secundário"],
      ["hero.preview.image","Imagem do destaque (substitui a ilustração)","image"],
      ["hero.preview.urlText","Endereço ilustrativo no navegador"],["hero.preview.brand","Nome ilustrativo"],["hero.preview.brandAccent","Destaque no nome ilustrativo"],
      ["hero.preview.menu","Texto do menu ilustrativo"],["hero.preview.kicker","Etiqueta do destaque"],["hero.preview.title","Título do destaque"],["hero.preview.description","Descrição do destaque","textarea"],
      ["hero.preview.button","Texto do botão ilustrativo"],["hero.preview.number","Número ilustrativo"],
      ["hero.preview.bottomLeft","Texto inferior esquerdo"],["hero.preview.bottomRight","Texto inferior direito"],
      ["hero.preview.badgeIcon","Símbolo do cartão flutuante"],["hero.preview.badgeTitle","Título do cartão flutuante"],
      ["hero.preview.badgeDescription","Subtítulo do cartão flutuante"],["hero.preview.note","Legenda abaixo da ilustração"]
    ],lists:[{path:"hero.perks",label:"Diferenciais abaixo dos botões",fields:[["text","Diferencial"]],addLabel:"Adicionar diferencial"}] },
    { id:"faixa", title:"Faixa de apresentação", detail:"Edite as categorias destacadas logo após a primeira tela.", fields:[["trust.label","Chamada da faixa"]],lists:[{path:"trust.items",label:"Públicos e categorias",fields:[["text","Texto"]],addLabel:"Adicionar categoria"}] },
    { id:"servicos", title:"Seção de serviços", detail:"Edite, crie, remova ou reorganize os serviços. Cada serviço pode ter uma imagem própria.", fields:[
      ["services.eyebrow","Etiqueta da seção"],["services.title","Título da seção"],["services.highlight","Texto destacado no título"],["services.description","Descrição da seção","textarea"]
    ],lists:[{path:"services.items",label:"Cards de serviços",fields:[
      ["icon","Símbolo / ícone"],["image","Foto ou imagem do card","image"],
      ["title","Nome do serviço"],["text","Descrição do serviço","textarea"],
      ["ctaLabel","Texto do botão"],["ctaMessage","Mensagem do WhatsApp","textarea"]
    ],addLabel:"Adicionar novo serviço"}] },
    { id:"projetos", title:"Portfólio e projetos", detail:"Gerencie todos os projetos exibidos, suas capas, textos e links para os sites publicados.", fields:[
      ["projects.eyebrow","Etiqueta da seção"],["projects.title","Título"],["projects.highlight","Trecho destacado do título"],["projects.description","Descrição da seção","textarea"],
      ["projects.footerText","Chamada abaixo dos projetos"],["projects.footerCtaLabel","Texto do link final"],["projects.footerCtaHref","Destino do link final"]
    ],lists:[{path:"projects.items",label:"Cards do portfólio",fields:[
      ["title","Nome do projeto"],["category","Categoria"],["description","Descrição","textarea"],
      ["url","Link do projeto"],["image","Capa do projeto","image"],["ctaLabel","Texto do botão"],
      ["visualPreset","Visual sem capa (visual-studio, visual-shop, visual-triunexa)"],
      ["visualHeader","Nome pequeno na imagem ilustrativa"],["visualKicker","Categoria ilustrativa"],
      ["visualName","Texto principal ilustrativo"],["visualAccent","Destaque do texto ilustrativo"],
      ["visualSubtitle","Subtítulo ilustrativo"]
    ],addLabel:"Adicionar projeto"}] },
    { id:"sobre", title:"Apresentação pessoal", detail:"Personalize o texto sobre você, a imagem e as etapas do atendimento.", fields:[
      ["about.eyebrow","Etiqueta da seção"],["about.title","Título principal"],["about.highlight","Trecho destacado"],
      ["about.paragraph1","Primeiro parágrafo","textarea"],["about.paragraph2","Segundo parágrafo","textarea"],
      ["about.image","Imagem de apresentação","image"],["about.cardHeading","Título do quadro"],
      ["about.cardFooter","Texto abaixo das etapas","textarea"]
    ],lists:[{path:"about.steps",label:"Etapas do seu processo",fields:[["text","Descrição da etapa"]],addLabel:"Adicionar etapa"}] },
    { id:"contato", title:"Contato e conversão", detail:"Altere a chamada final, botão, mensagem pré-preenchida e imagem de fundo.", fields:[
      ["contact.eyebrow","Etiqueta"],["contact.title","Título"],["contact.highlight","Texto destacado"],
      ["contact.description","Descrição","textarea"],["contact.ctaLabel","Texto do botão de WhatsApp"],
      ["contact.ctaMessage","Mensagem ao abrir o WhatsApp","textarea"],["contact.backgroundImage","Imagem de fundo","image"],
      ["contact.decorText","Texto decorativo grande"],["contact.decorCaption","Legenda decorativa"]
    ] },
    { id:"rodape", title:"Redes sociais e rodapé", detail:"Adicione, remova e reorganize links de redes sociais ou outros canais.", fields:[],lists:[
      {path:"footer.links",label:"Links do rodapé",fields:[["label","Nome visível"],["url","Endereço completo (https://...)"]],addLabel:"Adicionar link"}
    ] }
  ];

  const NEW_ITEMS = {
    "navigation": {label:"Novo item",href:"#contato"},
    "hero.perks": {text:"Novo diferencial"},
    "trust.items": {text:"Nova categoria"},
    "services.items": {id:"",icon:"✦",image:"",title:"Novo serviço",text:"Descreva o serviço oferecido.",ctaLabel:"Pedir orçamento",ctaMessage:"Olá! Gostaria de um orçamento."},
    "projects.items": {id:"",title:"Novo projeto",category:"SITE PROFISSIONAL",description:"Descrição do projeto.",url:"https://",image:"",ctaLabel:"Visitar projeto",visualPreset:"visual-studio",visualHeader:"NOVO PROJETO",visualKicker:"DESIGN DIGITAL",visualName:"NOVO",visualAccent:"SITE",visualSubtitle:"Apresentação da marca."},
    "about.steps": {text:"Nova etapa"},
    "footer.links": {label:"Novo link",url:"https://"}
  };

  function node(tag, className, textValue) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (textValue !== undefined) el.textContent = String(textValue);
    return el;
  }
  function get(path) {
    return path.split(".").reduce((value, segment) => value?.[segment], content);
  }
  function set(path, value) {
    const parts = path.split(".");
    let obj = content;
    for (let i = 0; i < parts.length - 1; i++) obj = obj[parts[i]];
    obj[parts.at(-1)] = value;
    changed();
  }
  function toast(message, isError = false) {
    const el = $("#toast");
    el.textContent = message;
    el.className = isError ? "visible error" : "visible";
    clearTimeout(toast.timeout);
    toast.timeout = setTimeout(() => el.className = "", 6500);
  }
  function changed() {
    const dirty = content && JSON.stringify(content) !== lastSaved;
    $("#dirty-state").textContent = dirty ? "Alterações não publicadas" : "Nenhuma alteração";
    $("#dirty-state").classList.toggle("dirty", Boolean(dirty));
    $("#save-button").disabled = busy || !dirty;
    sendPreview();
  }
  function setBusy(value) {
    busy = value;
    $("#save-button").disabled = value || JSON.stringify(content) === lastSaved;
    $("#login-button").disabled = value;
  }
  function encodeBase64(bytes) {
    let binary = "";
    const size = 0x8000;
    for (let i = 0; i < bytes.length; i += size) binary += String.fromCharCode(...bytes.subarray(i, i + size));
    return btoa(binary);
  }
  function decodeBase64(encoded) {
    const raw = atob(String(encoded).replace(/\s/g,""));
    return new TextDecoder().decode(Uint8Array.from(raw, c => c.charCodeAt(0)));
  }
  async function github(path, method = "GET", payload) {
    if (!token) throw new Error("Conecte sua conta GitHub.");
    const response = await fetch(API + path, {
      method,
      headers:{
        "Authorization":"Bearer " + token,
        "Accept":"application/vnd.github+json",
        "X-GitHub-Api-Version":"2022-11-28",
        ...(payload ? {"Content-Type":"application/json"} : {})
      },
      body:payload ? JSON.stringify(payload) : undefined,
      mode:"cors",
      credentials:"omit",
      cache:"no-store",
      referrerPolicy:"no-referrer"
    });
    const json = await response.json().catch(() => ({}));
    if (!response.ok) {
      if (response.status === 409 || response.status === 422) throw new Error("Conflito ao publicar: o arquivo pode ter sido alterado. Recarregue e confira antes de tentar novamente.");
      if (response.status === 401 || response.status === 403) throw new Error("Acesso negado pelo GitHub. Confira o token, a conta e a permissão Contents: Read and write.");
      throw new Error("GitHub (" + response.status + "): " + (json.message || "Não foi possível concluir."));
    }
    return json;
  }
  async function fetchContent() {
    const file = await github(BASE + "/contents/content.json?ref=main");
    contentSHA = file.sha;
    content = JSON.parse(decodeBase64(file.content));
    if (content.version !== 1 || !content.site || !content.hero || !content.contact) throw new Error("Formato do conteúdo do site não reconhecido.");
    lastSaved = JSON.stringify(content);
    draw();
    changed();
  }
  async function login(event) {
    event.preventDefault();
    const input = $("#access-token");
    const attempt = input.value.trim();
    if (!attempt) return;
    token = attempt;
    input.value = "";
    const error = $("#login-error");
    error.textContent = "";
    setBusy(true);
    try {
      const user = await github("/user");
      if ((user.login || "").toLowerCase() !== OWNER.toLowerCase()) throw new Error("Esta conta não é a administradora autorizada para este site.");
      account = user.login;
      const repo = await github(BASE);
      if (repo.full_name && repo.full_name.toLowerCase() !== (OWNER + "/" + REPO).toLowerCase()) throw new Error("Repositório incorreto.");
      await fetchContent();
      $("#account-label").textContent = "Conectado como @" + account + " · publicando no GitHub";
      $("#login-overlay").hidden = true;
      $("#editor-app").hidden = false;
      toast("Painel conectado. Você pode editar todas as seções.");
    } catch (err) {
      token = "";
      error.textContent = err.message;
    } finally {
      setBusy(false);
      changed();
    }
  }
  function field(path, label, type = "text") {
    const group = node("div", "field" + (type === "textarea" || type === "image" ? " field-wide" : ""));
    const caption = node("label", "", label);
    const id = "f-" + path.replace(/[^\w]/g, "-");
    caption.htmlFor = id;
    group.append(caption);
    let input;
    if (type === "textarea") {
      input = node("textarea");
      input.rows = 3;
    } else {
      input = node("input");
      input.type = type === "color" ? "color" : "text";
      if (type === "image") input.placeholder = "https://... ou assets/uploads/imagem.png";
    }
    input.id = id;
    input.value = String(get(path) ?? (type === "color" ? "#000000" : ""));
    input.autocomplete = "off";
    input.addEventListener("input", () => set(path, input.value));
    group.append(input);
    if (type === "image") {
      const row = node("div", "upload-row");
      const file = node("input");
      file.type = "file"; file.accept = "image/png,image/jpeg,image/webp,image/gif";
      const upload = node("label", "upload-button", "Enviar imagem");
      upload.htmlFor = id + "-file";
      file.id = id + "-file"; file.className = "file-input";
      file.addEventListener("change", async () => {
        if (!file.files?.[0]) return;
        try {
          upload.textContent = "Enviando...";
          upload.classList.add("disabled");
          const url = await uploadImage(file.files[0]);
          set(path, url);
          input.value = url;
          syncImage();
          toast("Imagem enviada ao GitHub. Publique as alterações para aplicá-la no site.");
        } catch (err) { toast(err.message, true); }
        finally { upload.textContent = "Enviar imagem"; upload.classList.remove("disabled"); file.value = ""; }
      });
      row.append(upload, file, node("small", "", "PNG, JPG, WebP ou GIF · até 3 MB. Também aceita URL HTTPS."));
      group.append(row);
      const preview = node("img", "field-image-preview");
      preview.alt = "Prévia da imagem";
      function syncImage() {
        const value = input.value.trim();
        if (!value || (!/^https:\/\//i.test(value) && !/^assets\/uploads\//.test(value))) {
          preview.hidden = true; preview.removeAttribute("src"); return;
        }
        preview.src = /^assets\/uploads\//.test(value) ? "../" + value : value;
        preview.hidden = false;
      }
      input.addEventListener("input", syncImage);
      file.addEventListener("change", () => setTimeout(syncImage, 100));
      syncImage();
      group.append(preview);
    }
    return group;
  }
  function listEditor(config) {
    const arr = get(config.path);
    if (!Array.isArray(arr)) return node("p", "alert", "A lista não foi encontrada.");
    const wrapper = node("div", "collection");
    const heading = node("div", "collection-heading");
    heading.append(node("h3", "", config.label), node("span", "count", arr.length + " itens"));
    wrapper.append(heading);
    arr.forEach((item, index) => {
      const card = node("article", "collection-card");
      const bar = node("div", "collection-top");
      bar.append(node("strong", "", (index + 1) + " · " + (item.title || item.label || item.text || "Item")));
      const buttons = node("div", "item-actions");
      function move(direction) {
        const other = index + direction;
        if (other < 0 || other >= arr.length) return;
        [arr[index], arr[other]] = [arr[other], arr[index]];
        changed(); draw();
      }
      function itemButton(symbol, title, callback, disabled = false) {
        const btn = node("button", "icon-button", symbol);
        btn.type = "button"; btn.title = title; btn.setAttribute("aria-label", title); btn.disabled = disabled;
        btn.addEventListener("click", callback);
        buttons.append(btn);
      }
      itemButton("↑", "Mover para cima", () => move(-1), index === 0);
      itemButton("↓", "Mover para baixo", () => move(1), index === arr.length - 1);
      itemButton("✕", "Excluir item", () => {
        if (!confirm("Deseja excluir este item do site? A alteração só será publicada quando você salvar.")) return;
        arr.splice(index, 1); changed(); draw();
      });
      bar.append(buttons);
      card.append(bar);
      const fields = node("div", "fields-grid");
      for (const [key, label, type] of config.fields) fields.append(field(config.path + "." + index + "." + key, label, type));
      card.append(fields);
      wrapper.append(card);
    });
    const add = node("button", "add-button", "+ " + config.addLabel);
    add.type = "button";
    add.addEventListener("click", () => {
      const item = structuredClone(NEW_ITEMS[config.path] || {});
      if ("id" in item) item.id = "item-" + Date.now();
      arr.push(item);
      changed(); draw();
      toast("Novo item adicionado. Edite os campos e publique quando estiver pronto.");
    });
    wrapper.append(add);
    return wrapper;
  }
  function draw() {
    if (!content) return;
    const nav = $("#section-nav");
    nav.replaceChildren();
    SECTION_DEFS.forEach(def => {
      const button = node("button", "nav-item" + (def.id === activeSection ? " active" : ""), def.title);
      button.type = "button";
      button.addEventListener("click", () => {
        activeSection = def.id; draw();
        if (window.innerWidth < 880) window.scrollTo({top:0,behavior:"smooth"});
      });
      nav.append(button);
    });
    const def = SECTION_DEFS.find(s => s.id === activeSection) || SECTION_DEFS[0];
    const section = node("section", "editor-panel");
    section.append(node("p", "panel-eyebrow", "CONTEÚDO EDITÁVEL"), node("h2", "", def.title), node("p", "panel-description", def.detail));
    const grid = node("div", "fields-grid");
    for (const [path, label, type] of def.fields || []) grid.append(field(path, label, type));
    if (def.fields?.length) section.append(grid);
    for (const list of def.lists || []) section.append(listEditor(list));
    if (def.extra?.length) {
      section.append(node("h3", "subsection-title", "Botão de orçamento do topo"));
      const extra = node("div", "fields-grid");
      for (const [path, label, type] of def.extra) extra.append(field(path,label,type));
      section.append(extra);
    }
    root.replaceChildren(section);
  }
  async function uploadImage(file) {
    if (!token) throw new Error("Conecte sua conta GitHub.");
    const types = {"image/png":"png","image/jpeg":"jpg","image/webp":"webp","image/gif":"gif"};
    const ext = types[file.type];
    if (!ext) throw new Error("Formato não permitido. Use PNG, JPG, WebP ou GIF.");
    if (file.size > 3 * 1024 * 1024) throw new Error("Imagem muito grande. O máximo é 3 MB.");
    const slug = file.name.replace(/\.[^.]+$/, "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,40) || "imagem";
    const filename = "assets/uploads/" + Date.now() + "-" + slug + "." + ext;
    const buffer = new Uint8Array(await file.arrayBuffer());
    await github(BASE + "/contents/" + filename,"PUT",{
      message:"Adiciona imagem ao portfólio DS Digital: " + slug,
      content:encodeBase64(buffer),branch:"main"
    });
    return filename;
  }
  function validate() {
    if (!/^#[0-9a-fA-F]{6}$/.test(content.site.accentColor) || !/^#[0-9a-fA-F]{6}$/.test(content.site.backgroundColor) || !/^#[0-9a-fA-F]{6}$/.test(content.site.textColor)) throw new Error("Use cores válidas no formato #RRGGBB.");
    const phone = String(content.contact.phone || "").replace(/\D/g,"");
    if (phone.length < 10 || phone.length > 15) throw new Error("Corrija o número do WhatsApp, incluindo DDI e DDD.");
    const urls = [];
    (content.projects.items || []).forEach((p,i) => urls.push(["Projeto " + (i+1),p.url]));
    (content.footer.links || []).forEach((p,i) => urls.push(["Link do rodapé "+(i+1),p.url]));
    (content.navigation || []).forEach((p,i) => urls.push(["Menu "+(i+1),p.href]));
    urls.push(["Botão secundário",content.hero.secondaryHref],["Chamada de projetos",content.projects.footerCtaHref]);
    for (const [label,url] of urls) {
      if (url && !/^https:\/\//i.test(url) && !/^#[\w-]+$/.test(url)) throw new Error(label + ": use um link HTTPS ou um destino interno como #contato.");
    }
  }
  function htmlAttr(raw) {
    return String(raw || "").replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
  }
  async function syncMetadata() {
    const file = await github(BASE + "/contents/index.html?ref=main");
    let html = decodeBase64(file.content);
    const s = content.site;
    const metas = [
      ['name','theme-color',s.themeColor],
      ['name','description',s.description],
      ['property','og:title',s.socialTitle || s.title],
      ['property','og:description',s.socialDescription || s.description]
    ];
    for (const [attr, name, value] of metas) {
      const pattern = new RegExp('<meta\\s+' + attr + '="' + name + '"\\s+content="[^"]*"\\s*\\/?>','i');
      const replacement = '<meta ' + attr + '="' + name + '" content="' + htmlAttr(value) + '">';
      if (pattern.test(html)) html = html.replace(pattern,replacement);
    }
    html = html.replace(/<title>[\s\S]*?<\/title>/i,'<title>' + htmlAttr(s.title) + '</title>');
    await github(BASE + "/contents/index.html","PUT",{
      message:"Sincroniza título e metadados do portfólio para redes sociais",
      content:encodeBase64(new TextEncoder().encode(html)),
      sha:file.sha,branch:"main"
    });
  }
  async function save() {
    if (busy || !content || JSON.stringify(content) === lastSaved) return;
    try {
      validate();
      setBusy(true);
      const body = JSON.stringify(content,null,2) + "\n";
      const result = await github(BASE + "/contents/content.json","PUT",{
        message:"Atualiza conteúdo da página inicial pelo painel DS Digital",
        content:encodeBase64(new TextEncoder().encode(body)),
        sha:contentSHA,branch:"main"
      });
      contentSHA = result.content.sha;
      lastSaved = JSON.stringify(content);
      try {
        await syncMetadata();
        toast("Alterações publicadas no GitHub! Aguarde a atualização do GitHub Pages.");
      } catch (metadataError) {
        toast("Conteúdo publicado, mas os metadados de compartilhamento precisam ser sincronizados: " + metadataError.message, true);
      }
    } catch (error) { toast(error.message,true); }
    finally { setBusy(false); changed(); }
  }
  function sendPreview() {
    const dialog = $("#preview-dialog");
    if (!dialog.open || !content) return;
    clearTimeout(previewTimeout);
    previewTimeout = setTimeout(() => {
      $("#preview-frame").contentWindow?.postMessage({type:"DS_DIGITAL_PREVIEW",content:structuredClone(content)},location.origin);
    },140);
  }
  function preview() {
    const dlg = $("#preview-dialog");
    if (!dlg.open) dlg.showModal();
    sendPreview();
  }
  async function reload() {
    if (busy) return;
    if (JSON.stringify(content) !== lastSaved && !confirm("Descartar alterações ainda não publicadas?")) return;
    setBusy(true);
    try { await fetchContent(); toast("Conteúdo recarregado do GitHub."); }
    catch(err) { toast(err.message,true); }
    finally { setBusy(false); changed(); }
  }
  function logout() {
    if (content && JSON.stringify(content) !== lastSaved && !confirm("Sair e perder alterações não publicadas?")) return;
    token = ""; content = null; contentSHA = ""; lastSaved = ""; account = "";
    $("#editor-app").hidden = true;
    $("#login-overlay").hidden = false;
    $("#access-token").value = "";
    $("#preview-dialog").close?.();
    toast("Desconectado. Nenhuma credencial ficou armazenada.");
  }
  $("#login-form").addEventListener("submit",login);
  $("#save-button").addEventListener("click",save);
  $("#reload-button").addEventListener("click",reload);
  $("#preview-button").addEventListener("click",preview);
  $("#close-preview").addEventListener("click",() => $("#preview-dialog").close());
  $("#preview-frame").addEventListener("load",()=>{sendPreview();setTimeout(sendPreview,450);});
  $("#logout").addEventListener("click",logout);
  window.addEventListener("beforeunload",event=>{
    if (content && JSON.stringify(content) !== lastSaved) {event.preventDefault();event.returnValue = "";}
  });
})();
