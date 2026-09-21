/* =========================================================
   BASANTA DRY CLEANLINESS
   content-admin.js
   COMPLETE CONTENT ADMIN + IMAGE UPLOAD
========================================================= */


/* =========================================================
   SUPABASE CONFIG
========================================================= */

const SUPABASE_URL = "https://ubsyhqkefhtskxjpjzbf.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVic3locWtlZmh0c2t4anBqemJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk4Mzk4NjQsImV4cCI6MjEwNTQxNTg2NH0.00-JsYNjdmb7OV51Tly1W8A9grQ9GR9E66E3Yyas-j8";

const STORAGE_BUCKET = "website-image";

let supabaseClient = null;

if (
  SUPABASE_URL &&
  SUPABASE_ANON_KEY &&
  window.supabase
) {
  supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
  );
}


/* =========================================================
   DOM
========================================================= */

const heroForm =
  document.getElementById("heroForm");

const articleForm =
  document.getElementById("articleForm");

const contactForm =
  document.getElementById("contactForm");

const articlesList =
  document.getElementById("articlesList");

const articleEditor =
  document.getElementById("articleEditor");

const newArticleBtn =
  document.getElementById("newArticleBtn");

const closeEditorBtn =
  document.getElementById("closeEditorBtn");

const cancelArticleBtn =
  document.getElementById("cancelArticleBtn");

const heroImageFile =
  document.getElementById("heroImageFile");

const heroImagePreview =
  document.getElementById("heroImagePreview");

const imageUploadMessage =
  document.getElementById("imageUploadMessage");


/* =========================================================
   INIT
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    if (!supabaseClient) {

      showGlobalError(
        "Supabase configuration missing. SUPABASE_URL और SUPABASE_ANON_KEY डालें।"
      );

      return;
    }

    setupEvents();

    loadHero();

    loadArticles();

    loadContact();

  }
);


/* =========================================================
   EVENTS
========================================================= */

function setupEvents() {

  if (heroForm) {
    heroForm.addEventListener(
      "submit",
      saveHero
    );
  }


  if (articleForm) {
    articleForm.addEventListener(
      "submit",
      saveArticle
    );
  }


  if (contactForm) {
    contactForm.addEventListener(
      "submit",
      saveContact
    );
  }


  if (newArticleBtn) {
    newArticleBtn.addEventListener(
      "click",
      openNewArticle
    );
  }


  if (closeEditorBtn) {
    closeEditorBtn.addEventListener(
      "click",
      closeArticleEditor
    );
  }


  if (cancelArticleBtn) {
    cancelArticleBtn.addEventListener(
      "click",
      closeArticleEditor
    );
  }


  /* HERO IMAGE PREVIEW */

  if (heroImageFile) {

    heroImageFile.addEventListener(
      "change",
      previewHeroImage
    );

  }

  if (heroUploadBtn) {

    heroUploadBtn.addEventListener(
      "click",
      async function () {

        try {
          if (!heroImageFile?.files?.length) {
            showImageMessage("पहले image select करें।", true);
            return;
          }

          heroUploadBtn.disabled = true;
          heroUploadBtn.textContent = "Uploading...";
          await uploadHeroImage();

        } catch (error) {
          console.error("Hero Image Upload Error:", error);
          showImageMessage(getSupabaseError(error, "Image upload नहीं हुई।"), true);
        } finally {
          heroUploadBtn.disabled = false;
          heroUploadBtn.textContent = "🖼️ Upload Image";
        }
      }
    );

  }

}


/* =========================================================
   HERO LOAD
========================================================= */

async function loadHero() {

  try {

    const {
      data,
      error
    } = await supabaseClient
      .from("site_content")
      .select("*")
      .eq("section", "hero")
      .eq("active", true)
      .maybeSingle();


    if (error) {
      throw error;
    }


    if (!data) {

      console.log(
        "Hero content अभी database में नहीं है।"
      );

      return;
    }


    setValue(
      "heroTitle",
      data.title
    );

    setValue(
      "heroSubtitle",
      data.subtitle
    );

    setValue(
      "heroDescription",
      data.description
    );

    setValue(
      "heroButton",
      data.button_text
    );

    setValue(
      "heroButtonLink",
      data.button_link
    );

    setValue(
      "heroImage",
      data.image_url
    );


    if (data.image_url) {

      showHeroPreview(
        data.image_url
      );

    }

  }

  catch (error) {

    console.error(
      "Hero Load Error:",
      error
    );

    showMessage(
      "heroMessage",
      getSupabaseError(
        error,
        "Homepage data load नहीं हुई।"
      ),
      true
    );

  }

}


/* =========================================================
   HERO IMAGE PREVIEW
========================================================= */

function previewHeroImage() {

  const file =
    heroImageFile?.files?.[0];


  if (!file) {
    return;
  }


  if (!file.type.startsWith("image/")) {

    showImageMessage(
      "कृपया केवल image file चुनें।",
      true
    );

    heroImageFile.value = "";

    return;
  }


  const maxSize =
    5 * 1024 * 1024;


  if (file.size > maxSize) {

    showImageMessage(
      "Image 5MB से छोटी होनी चाहिए।",
      true
    );

    heroImageFile.value = "";

    return;
  }


  const reader =
    new FileReader();


  reader.onload =
    function(event) {

      showHeroPreview(
        event.target.result
      );

    };


  reader.readAsDataURL(file);


  showImageMessage(
    "Image select हो गई। Save Homepage दबाएँ।",
    false
  );

}


/* =========================================================
   HERO PREVIEW
========================================================= */

function showHeroPreview(
  imageUrl
) {

  if (!heroImagePreview) {
    return;
  }


  heroImagePreview.innerHTML = `

    <img
      src="${escapeHTML(imageUrl)}"
      alt="Homepage Image Preview"
    >

  `;

}


/* =========================================================
   UPLOAD HERO IMAGE
========================================================= */

async function uploadHeroImage() {

  const file =
    heroImageFile?.files?.[0];


  if (!file) {

    return getValue(
      "heroImage"
    );

  }


  if (
    !file.type.startsWith("image/")
  ) {

    throw new Error(
      "कृपया valid image file चुनें।"
    );

  }


  if (
    file.size >
    5 * 1024 * 1024
  ) {

    throw new Error(
      "Image 5MB से छोटी होनी चाहिए।"
    );

  }


  showImageMessage(
    "Image upload हो रही है...",
    false
  );


  const extension =
    getFileExtension(
      file.name
    );


  const fileName =
    `hero-${Date.now()}-${randomString(8)}.${extension}`;


  const filePath =
    `homepage/${fileName}`;


  const {
    error: uploadError
  } = await supabaseClient
    .storage
    .from(STORAGE_BUCKET)
    .upload(
      filePath,
      file,
      {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type
      }
    );


  if (uploadError) {

    throw uploadError;

  }


  const {
    data
  } =
    supabaseClient
      .storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(
        filePath
      );


  if (
    !data ||
    !data.publicUrl
  ) {

    throw new Error(
      "Uploaded image का public URL नहीं मिला।"
    );

  }


  const imageUrl =
    data.publicUrl;


  setValue(
    "heroImage",
    imageUrl
  );


  showHeroPreview(
    imageUrl
  );


  showImageMessage(
    "Image successfully upload हो गई।",
    false
  );


  return imageUrl;

}


/* =========================================================
   HERO SAVE
========================================================= */

async function saveHero(
  event
) {

  event.preventDefault();


  const button =
    heroForm?.querySelector(
      'button[type="submit"]'
    );


  const oldText =
    button
      ? button.textContent
      : "";


  try {

    if (button) {

      button.disabled =
        true;

      button.textContent =
        "Saving...";

    }


    /*
      पहले image upload
    */

    let imageUrl =
      getValue("heroImage");


    if (
      heroImageFile &&
      heroImageFile.files &&
      heroImageFile.files.length > 0
    ) {

      imageUrl =
        await uploadHeroImage();

    }


    const payload = {

      section:
        "hero",

      title:
        getValue("heroTitle"),

      subtitle:
        getValue("heroSubtitle"),

      description:
        getValue("heroDescription"),

      button_text:
        getValue("heroButton"),

      button_link:
        getValue("heroButtonLink"),

      image_url:
        imageUrl,

      active:
        true

    };


    /*
      Existing hero खोजें
    */

    const {
      data: existing,
      error: findError
    } = await supabaseClient
      .from("site_content")
      .select("id")
      .eq("section", "hero")
      .limit(1)
      .maybeSingle();


    if (findError) {

      throw findError;

    }


    let result;


    if (existing) {

      result =
        await supabaseClient
          .from("site_content")
          .update(payload)
          .eq(
            "id",
            existing.id
          );

    }

    else {

      result =
        await supabaseClient
          .from("site_content")
          .insert(payload);

    }


    if (result.error) {

      throw result.error;

    }


    showMessage(
      "heroMessage",
      "Homepage और image successfully save हो गई।",
      false
    );


    if (heroImageFile) {

      heroImageFile.value =
        "";

    }

  }

  catch (error) {

    console.error(
      "Hero Save Error:",
      error
    );


    showMessage(
      "heroMessage",
      getSupabaseError(
        error,
        "Homepage save नहीं हुई।"
      ),
      true
    );

  }

  finally {

    if (button) {

      button.disabled =
        false;

      button.textContent =
        oldText;

    }

  }

}


/* =========================================================
   ARTICLES LOAD
========================================================= */

async function loadArticles() {

  if (!articlesList) {
    return;
  }


  articlesList.innerHTML =
    `<div class="loading">
      Articles loading...
    </div>`;


  try {

    const {
      data,
      error
    } = await supabaseClient
      .from("articles")
      .select("*")
      .order(
        "created_at",
        {
          ascending: false
        }
      );


    if (error) {
      throw error;
    }


    if (
      !data ||
      data.length === 0
    ) {

      articlesList.innerHTML =
        `<div class="loading">
          अभी कोई article नहीं है।
        </div>`;

      return;

    }


    articlesList.innerHTML =
      "";


    data.forEach(
      article => {

        articlesList.appendChild(
          createArticleRow(article)
        );

      }
    );

  }

  catch (error) {

    console.error(
      "Articles Load Error:",
      error
    );


    articlesList.innerHTML =
      `<div class="loading">
        Articles load नहीं हुए।
      </div>`;

  }

}


/* =========================================================
   ARTICLE ROW
========================================================= */

function createArticleRow(
  article
) {

  const row =
    document.createElement(
      "div"
    );


  row.className =
    "article-admin-row";


  const image =
    article.image_url

      ? `<img
          src="${escapeHTML(
            article.image_url
          )}"
          alt=""
        >`

      : `<div class="article-admin-placeholder">
          📰
        </div>`;


  row.innerHTML = `

    <div class="article-admin-image">
      ${image}
    </div>


    <div class="article-admin-info">

      <h3>
        ${escapeHTML(
          article.title ||
          "Untitled Article"
        )}
      </h3>


      <p>
        ${escapeHTML(
          article.category ||
          "No category"
        )}
      </p>


      <small>
        ${
          article.published
            ? "Published"
            : "Draft"
        }
      </small>

    </div>


    <div class="article-admin-actions">

      <button
        type="button"
        class="edit-article-btn"
      >
        Edit
      </button>


      <button
        type="button"
        class="publish-article-btn"
      >
        ${
          article.published
            ? "Unpublish"
            : "Publish"
        }
      </button>


      <button
        type="button"
        class="delete-article-btn"
      >
        Delete
      </button>

    </div>

  `;


  row
    .querySelector(
      ".edit-article-btn"
    )
    .addEventListener(
      "click",
      () => {

        openEditArticle(
          article
        );

      }
    );


  row
    .querySelector(
      ".publish-article-btn"
    )
    .addEventListener(
      "click",
      () => {

        togglePublished(
          article
        );

      }
    );


  row
    .querySelector(
      ".delete-article-btn"
    )
    .addEventListener(
      "click",
      () => {

        deleteArticle(
          article
        );

      }
    );


  return row;

}


/* =========================================================
   NEW ARTICLE
========================================================= */

function openNewArticle() {

  if (!articleEditor) {
    return;
  }


  articleEditor.hidden =
    false;


  if (articleForm) {
    articleForm.reset();
  }


  setValue(
    "articleId",
    ""
  );


  setValue(
    "articleAuthor",
    "Basanta"
  );


  const published =
    document.getElementById(
      "articlePublished"
    );


  if (published) {

    published.checked =
      true;

  }


  const editorTitle =
    document.getElementById(
      "editorTitle"
    );


  if (editorTitle) {

    editorTitle.textContent =
      "New Article";

  }


  articleEditor.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });

}


/* =========================================================
   EDIT ARTICLE
========================================================= */

function openEditArticle(
  article
) {

  if (!articleEditor) {
    return;
  }


  articleEditor.hidden =
    false;


  setValue(
    "articleId",
    article.id
  );

  setValue(
    "articleTitle",
    article.title
  );

  setValue(
    "articleSlug",
    article.slug
  );

  setValue(
    "articleCategory",
    article.category
  );

  setValue(
    "articleDescription",
    article.description
  );

  setValue(
    "articleImage",
    article.image_url
  );

  setValue(
    "articleContent",
    article.content
  );

  setValue(
    "articleAuthor",
    article.author ||
    "Basanta"
  );


  const published =
    document.getElementById(
      "articlePublished"
    );


  if (published) {

    published.checked =
      Boolean(
        article.published
      );

  }


  const editorTitle =
    document.getElementById(
      "editorTitle"
    );


  if (editorTitle) {

    editorTitle.textContent =
      "Edit Article";

  }


  articleEditor.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });

}


/* =========================================================
   CLOSE ARTICLE EDITOR
========================================================= */

function closeArticleEditor() {

  if (!articleEditor) {
    return;
  }


  articleEditor.hidden =
    true;


  if (articleForm) {
    articleForm.reset();
  }


  setValue(
    "articleId",
    ""
  );


  clearMessage(
    "articleMessage"
  );

}


/* =========================================================
   SAVE ARTICLE
========================================================= */

async function saveArticle(
  event
) {

  event.preventDefault();


  const button =
    articleForm?.querySelector(
      'button[type="submit"]'
    );


  const oldText =
    button
      ? button.textContent
      : "";


  if (button) {

    button.disabled =
      true;

    button.textContent =
      "Saving...";

  }


  try {

    let slug =
      getValue("articleSlug");


    const title =
      getValue("articleTitle");


    if (!slug) {

      slug =
        createSlug(title);

    }


    const payload = {

      title:
        title,

      slug:
        slug,

      category:
        getValue("articleCategory"),

      description:
        getValue("articleDescription"),

      image_url:
        getValue("articleImage"),

      content:
        getValue("articleContent"),

      author:
        getValue("articleAuthor") ||
        "Basanta",

      published:
        document.getElementById(
          "articlePublished"
        )?.checked || false

    };


    const articleId =
      getValue("articleId");


    let result;


    if (articleId) {

      result =
        await supabaseClient
          .from("articles")
          .update(payload)
          .eq(
            "id",
            articleId
          );

    }

    else {

      result =
        await supabaseClient
          .from("articles")
          .insert(payload);

    }


    if (result.error) {
      throw result.error;
    }


    showMessage(
      "articleMessage",
      "Article successfully save हो गया।",
      false
    );


    await loadArticles();


    setTimeout(
      () => {
        closeArticleEditor();
      },
      800
    );

  }

  catch (error) {

    console.error(
      "Article Save Error:",
      error
    );


    showMessage(
      "articleMessage",
      getSupabaseError(
        error,
        "Article save नहीं हुआ।"
      ),
      true
    );

  }

  finally {

    if (button) {

      button.disabled =
        false;

      button.textContent =
        oldText;

    }

  }

}


/* =========================================================
   PUBLISH / UNPUBLISH
========================================================= */

async function togglePublished(
  article
) {

  try {

    const {
      error
    } = await supabaseClient
      .from("articles")
      .update({
        published:
          !article.published
      })
      .eq(
        "id",
        article.id
      );


    if (error) {
      throw error;
    }


    await loadArticles();

  }

  catch (error) {

    console.error(
      "Publish Error:",
      error
    );


    alert(
      getSupabaseError(
        error,
        "Article status change नहीं हुआ।"
      )
    );

  }

}


/* =========================================================
   DELETE ARTICLE
========================================================= */

async function deleteArticle(
  article
) {

  const confirmed =
    confirm(
      `"${article.title}" delete करना है?`
    );


  if (!confirmed) {
    return;
  }


  try {

    const {
      error
    } = await supabaseClient
      .from("articles")
      .delete()
      .eq(
        "id",
        article.id
      );


    if (error) {
      throw error;
    }


    await loadArticles();

  }

  catch (error) {

    console.error(
      "Delete Article Error:",
      error
    );


    alert(
      getSupabaseError(
        error,
        "Article delete नहीं हुआ।"
      )
    );

  }

}


/* =========================================================
   CONTACT LOAD
========================================================= */

async function loadContact() {

  try {

    const {
      data,
      error
    } = await supabaseClient
      .from("site_contact")
      .select("*")
      .limit(1)
      .maybeSingle();


    if (error) {
      throw error;
    }


    if (!data) {
      return;
    }


    setValue(
      "contactPhone",
      data.phone
    );

    setValue(
      "contactWhatsapp",
      data.whatsapp
    );

    setValue(
      "contactEmail",
      data.email
    );

    setValue(
      "contactAddress",
      data.address
    );

    setValue(
      "contactInstagram",
      data.instagram
    );

    setValue(
      "contactFacebook",
      data.facebook
    );

  }

  catch (error) {

    console.error(
      "Contact Load Error:",
      error
    );

  }

}


/* =========================================================
   CONTACT SAVE
========================================================= */

async function saveContact(
  event
) {

  event.preventDefault();


  const payload = {

    phone:
      getValue("contactPhone"),

    whatsapp:
      getValue("contactWhatsapp"),

    email:
      getValue("contactEmail"),

    address:
      getValue("contactAddress"),

    instagram:
      getValue("contactInstagram"),

    facebook:
      getValue("contactFacebook")

  };


  try {

    const {
      data: existing,
      error: findError
    } = await supabaseClient
      .from("site_contact")
      .select("id")
      .limit(1)
      .maybeSingle();


    if (findError) {
      throw findError;
    }


    let result;


    if (existing) {

      result =
        await supabaseClient
          .from("site_contact")
          .update(payload)
          .eq(
            "id",
            existing.id
          );

    }

    else {

      result =
        await supabaseClient
          .from("site_contact")
          .insert(payload);

    }


    if (result.error) {
      throw result.error;
    }


    showMessage(
      "contactMessage",
      "Contact information save हो गई।",
      false
    );

  }

  catch (error) {

    console.error(
      "Contact Save Error:",
      error
    );


    showMessage(
      "contactMessage",
      getSupabaseError(
        error,
        "Contact save नहीं हुई।"
      ),
      true
    );

  }

}


/* =========================================================
   HELPERS
========================================================= */

function getValue(id) {

  const element =
    document.getElementById(id);


  if (!element) {
    return "";
  }


  return (
    element.value || ""
  ).trim();

}


function setValue(
  id,
  value
) {

  const element =
    document.getElementById(id);


  if (!element) {
    return;
  }


  element.value =
    value || "";

}


function clearMessage(id) {

  const element =
    document.getElementById(id);


  if (element) {
    element.textContent = "";
  }

}


function showMessage(
  id,
  message,
  error = false
) {

  const element =
    document.getElementById(id);


  if (!element) {
    return;
  }


  element.textContent =
    message;


  element.style.color =
    error
      ? "#c0392b"
      : "#176b52";

}


function showImageMessage(
  message,
  error = false
) {

  if (!imageUploadMessage) {
    return;
  }


  imageUploadMessage.textContent =
    message;


  imageUploadMessage.style.color =
    error
      ? "#c0392b"
      : "#176b52";

}


function showGlobalError(
  message
) {

  console.error(
    message
  );

  alert(message);

}


function getFileExtension(
  fileName
) {

  const parts =
    fileName.split(".");


  return (
    parts.length > 1
      ? parts.pop().toLowerCase()
      : "jpg"
  );

}


function randomString(
  length
) {

  const chars =
    "abcdefghijklmnopqrstuvwxyz0123456789";


  let result = "";


  for (
    let i = 0;
    i < length;
    i++
  ) {

    result +=
      chars[
        Math.floor(
          Math.random() *
          chars.length
        )
      ];

  }


  return result;

}


function createSlug(
  text
) {

  return String(text || "")
    .toLowerCase()
    .trim()
    .replace(
      /[^\w\s-]/g,
      ""
    )
    .replace(
      /\s+/g,
      "-"
    )
    .replace(
      /-+/g,
      "-"
    );

}


function escapeHTML(
  value
) {

  return String(
    value ?? ""
  )
    .replace(
      /&/g,
      "&amp;"
    )
    .replace(
      /</g,
      "&lt;"
    )
    .replace(
      />/g,
      "&gt;"
    )
    .replace(
      /"/g,
      "&quot;"
    )
    .replace(
      /'/g,
      "&#039;"
    );

}


/* =========================================================
   SUPABASE ERROR
========================================================= */

function getSupabaseError(
  error,
  fallback
) {

  if (!error) {
    return fallback;
  }


  console.error(
    "Supabase:",
    error
  );


  if (
    error.code === "42501"
  ) {

    return (
      "RLS policy ने इस action को रोक दिया। " +
      "site_content/articles/site_contact की policy check करें।"
    );

  }


  if (
    error.statusCode === "400" &&
    error.message
  ) {

    return error.message;

  }


  if (
    error.message
  ) {

    return error.message;

  }


  return fallback;

}