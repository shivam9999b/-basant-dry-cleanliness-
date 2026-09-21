/* =====================================================
   BASANTA DRY CLEANLINESS
   app.js
   UPDATED + SAFE SUPABASE VERSION
===================================================== */


/* =====================================================
   SUPABASE CONFIG
===================================================== */

const SUPABASE_URL = "https://ubsyhqkefhtskxjpjzbf.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVic3locWtlZmh0c2t4anBqemJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk4Mzk4NjQsImV4cCI6MjEwNTQxNTg2NH0.00-JsYNjdmb7OV51Tly1W8A9grQ9GR9E66E3Yyas-j8";

let supabaseClient = null;


/* =====================================================
   SUPABASE INITIALIZE
===================================================== */

function initSupabase() {

  try {

    if (
      typeof window.supabase === "undefined"
    ) {
      console.warn("Supabase library नहीं मिली।");
      return null;
    }

    if (
      !SUPABASE_URL ||
      !SUPABASE_ANON_KEY ||
      SUPABASE_URL === "YOUR_SUPABASE_URL" ||
      SUPABASE_ANON_KEY === "YOUR_SUPABASE_ANON_KEY"
    ) {
      console.warn(
        "Supabase URL / ANON KEY अभी सेट नहीं है।"
      );
      return null;
    }

    return window.supabase.createClient(
      SUPABASE_URL,
      SUPABASE_ANON_KEY
    );

  } catch (error) {

    console.error(
      "Supabase initialization error:",
      error
    );

    return null;
  }
}


/* =====================================================
   DOM
===================================================== */

let serviceGrid;
let bookingModal;
let bookingForm;
let bookingMessage;


/* =====================================================
   INIT
===================================================== */

document.addEventListener(
  "DOMContentLoaded",
  function () {

    serviceGrid =
      document.getElementById("serviceGrid");

    bookingModal =
      document.getElementById("bookingModal");

    bookingForm =
      document.getElementById("bookingForm");

    bookingMessage =
      document.getElementById("bookingMessage");


    /* Supabase */

    supabaseClient =
      initSupabase();


    /* Website */

    setupButtons();

    setupModal();

    setMinimumDate();

    loadServices();

    loadHomepageContent();

    loadHomepageContact();

    loadArticles();

    setupExtraButtons();

  }
);


/* =====================================================
   BUTTONS
===================================================== */

function setupButtons() {

  const buttonIds = [
    "bookTopBtn",
    "bookHeroBtn",
    "quickPickupBtn",
    "bookCtaBtn"
  ];


  buttonIds.forEach(
    function (id) {

      const button =
        document.getElementById(id);

      if (button) {

        button.addEventListener(
          "click",
          openBookingModal
        );

      }

    }
  );


  const allServicesBtn =
    document.getElementById(
      "allServicesBtn"
    );


  if (allServicesBtn) {

    allServicesBtn.addEventListener(
      "click",
      function () {

        const section =
          document.getElementById(
            "services"
          );

        if (section) {

          section.scrollIntoView({
            behavior: "smooth"
          });

        }

      }
    );

  }

}


/* =====================================================
   EXTRA BUTTONS
===================================================== */

function setupExtraButtons() {

  const viewPricesBtn =
    document.getElementById(
      "viewPricesBtn"
    );


  if (viewPricesBtn) {

    viewPricesBtn.addEventListener(
      "click",
      function () {

        const priceSection =
          document.getElementById(
            "pricing"
          );

        if (priceSection) {

          priceSection.scrollIntoView({
            behavior: "smooth"
          });

        }

      }
    );

  }


  const trackOrderBtn =
    document.getElementById(
      "trackOrderBtn"
    );


  if (trackOrderBtn) {

    trackOrderBtn.addEventListener(
      "click",
      function () {

        window.location.href =
          "track-order.html";

      }
    );

  }

}


/* =====================================================
   MODAL
===================================================== */

function setupModal() {

  const closeModal =
    document.getElementById(
      "closeModal"
    );


  const overlay =
    document.querySelector(
      ".modal-overlay"
    );


  if (closeModal) {

    closeModal.addEventListener(
      "click",
      closeBookingModal
    );

  }


  if (overlay) {

    overlay.addEventListener(
      "click",
      function (event) {

        if (
          event.target === overlay
        ) {

          closeBookingModal();

        }

      }
    );

  }


  document.addEventListener(
    "keydown",
    function (event) {

      if (
        event.key === "Escape" &&
        bookingModal &&
        bookingModal.classList.contains(
          "show"
        )
      ) {

        closeBookingModal();

      }

    }
  );


  if (bookingForm) {

    bookingForm.addEventListener(
      "submit",
      submitBooking
    );

  }

}


/* =====================================================
   OPEN BOOKING
===================================================== */

function openBookingModal() {

  if (!bookingModal) return;


  bookingModal.classList.add(
    "show"
  );


  bookingModal.setAttribute(
    "aria-hidden",
    "false"
  );


  document.body.style.overflow =
    "hidden";


  const nameInput =
    document.getElementById(
      "customerName"
    );


  if (nameInput) {

    setTimeout(
      function () {
        nameInput.focus();
      },
      100
    );

  }

}


/* =====================================================
   CLOSE BOOKING
===================================================== */

function closeBookingModal() {

  if (!bookingModal) return;


  bookingModal.classList.remove(
    "show"
  );


  bookingModal.setAttribute(
    "aria-hidden",
    "true"
  );


  document.body.style.overflow =
    "";


  if (bookingMessage) {

    bookingMessage.textContent =
      "";

  }

}


/* =====================================================
   DATE
===================================================== */

function setMinimumDate() {

  const input =
    document.getElementById(
      "pickupDate"
    );


  if (!input) return;


  const today =
    new Date();


  const year =
    today.getFullYear();


  const month =
    String(
      today.getMonth() + 1
    ).padStart(
      2,
      "0"
    );


  const day =
    String(
      today.getDate()
    ).padStart(
      2,
      "0"
    );


  input.min =
    `${year}-${month}-${day}`;

}


/* =====================================================
   SERVICES
===================================================== */

async function loadServices() {

  if (!serviceGrid) return;


  if (!supabaseClient) {

    serviceGrid.innerHTML = `
      <div class="service-loading">
        अभी services उपलब्ध नहीं हैं।
      </div>
    `;

    return;

  }


  try {

    const result =
      await supabaseClient
        .from("services")
        .select("*")
        .eq("active", true)
        .order(
          "created_at",
          {
            ascending: true
          }
        );


    const data =
      result.data;

    const error =
      result.error;


    if (error) {

      console.error(
        "Services Error:",
        error
      );

      serviceGrid.innerHTML = `
        <div class="service-loading">
          Services load नहीं हो सकीं।
        </div>
      `;

      return;

    }


    if (
      !data ||
      data.length === 0
    ) {

      serviceGrid.innerHTML = `
        <div class="service-loading">
          अभी कोई service उपलब्ध नहीं है।
        </div>
      `;

      return;

    }


    serviceGrid.innerHTML =
      "";


    data.forEach(
      function (service) {

        const card =
          document.createElement(
            "article"
          );


        card.className =
          "service-card";


        card.innerHTML = `

          <div class="service-icon">
            ${escapeHTML(
              service.icon || "🧺"
            )}
          </div>

          <h3>
            ${escapeHTML(
              service.name || "Service"
            )}
          </h3>

          <p>
            ${escapeHTML(
              service.description || ""
            )}
          </p>

          <span class="service-price">
            From ₹${formatPrice(
              service.price
            )}
          </span>

        `;


        serviceGrid.appendChild(
          card
        );

      }
    );

  } catch (error) {

    console.error(
      "Services Exception:",
      error
    );

  }

}


/* =====================================================
   HOMEPAGE CONTENT
===================================================== */

async function loadHomepageContent() {

  if (!supabaseClient) return;


  try {

    const result =
      await supabaseClient
        .from("site_content")
        .select("*")
        .eq("section", "hero")
        .eq("active", true)
        .maybeSingle();


    const data =
      result.data;

    const error =
      result.error;


    if (error) {

      console.error(
        "Homepage Error:",
        error
      );

      return;

    }


    if (!data) return;


    /* TITLE */

    const title =
      document.querySelector(
        ".hero-content h1"
      );


    if (
      title &&
      data.title
    ) {

      title.textContent =
        data.title;

    }


    /* SUBTITLE */

    const subtitle =
      document.querySelector(
        ".hero-content .badge"
      );


    if (
      subtitle &&
      data.subtitle
    ) {

      subtitle.textContent =
        data.subtitle;

    }


    /* DESCRIPTION */

    const description =
      document.querySelector(
        ".hero-content > p"
      );


    if (
      description &&
      data.description
    ) {

      description.textContent =
        data.description;

    }


    /* HERO BUTTON */

    const heroButton =
      document.getElementById(
        "bookHeroBtn"
      );


    if (
      heroButton &&
      data.button_text
    ) {

      heroButton.innerHTML =
        `${escapeHTML(
          data.button_text
        )} <span>→</span>`;

    }


    /* HERO IMAGE */

    if (data.image_url) {

      const image =
        document.querySelector(
          ".hero-image"
        );


      if (image) {

        image.style.backgroundImage =
          `url("${escapeCSSURL(
            data.image_url
          )}")`;

        image.style.backgroundSize =
          "cover";

        image.style.backgroundPosition =
          "center";

      }

    }

  } catch (error) {

    console.error(
      "Homepage Exception:",
      error
    );

  }

}


/* =====================================================
   CONTACT
===================================================== */

async function loadHomepageContact() {

  if (!supabaseClient) return;

  try {

    const { data, error } =
      await supabaseClient
        .from("site_contact")
        .select("*")
        .limit(1)
        .maybeSingle();

    if (error) {
      console.error("Contact Error:", error);
      return;
    }

    if (!data) {
      console.warn("site_contact में अभी कोई contact data नहीं है।");
      return;
    }

    /* PHONE */
    const phone = document.getElementById("contactPhone");
    const phoneLink = document.getElementById("contactPhoneLink");

    if (phone) phone.textContent = data.phone || "Not available";

    if (phoneLink) {
      const rawPhone = String(data.phone || "").trim();
      const phoneNumber = rawPhone.replace(/[^\d+]/g, "");
      phoneLink.href = phoneNumber ? `tel:${phoneNumber}` : "#";
    }

    /* WHATSAPP */
    const whatsapp = document.getElementById("contactWhatsapp");
    const whatsappLink = document.getElementById("contactWhatsappLink");

    if (whatsapp) whatsapp.textContent = data.whatsapp || "Not available";

    if (whatsappLink) {
      const rawWhatsapp = String(data.whatsapp || "").trim();
      const whatsappNumber = rawWhatsapp.replace(/\D/g, "");
      whatsappLink.href = whatsappNumber
        ? `https://wa.me/${whatsappNumber}`
        : "#";
    }

    /* EMAIL */
    const email = document.getElementById("contactEmail");
    const emailLink = document.getElementById("contactEmailLink");

    if (email) email.textContent = data.email || "Not available";

    if (emailLink) {
      const rawEmail = String(data.email || "").trim();
      emailLink.href = rawEmail ? `mailto:${rawEmail}` : "#";
    }

    /* ADDRESS */
    const address = document.getElementById("contactAddress");

    if (address) {
      address.textContent =
        data.address || "Address not available";
    }

    /* INSTAGRAM */
    const instagram = document.getElementById("contactInstagram");
    const instagramLink =
      document.getElementById("contactInstagramLink");

    if (instagram) {
      instagram.textContent =
        data.instagram || "Instagram";
    }

    if (instagramLink) {
      instagramLink.href =
        data.instagram || "#";
    }

    /* FACEBOOK */
    const facebook = document.getElementById("contactFacebook");
    const facebookLink =
      document.getElementById("contactFacebookLink");

    if (facebook) {
      facebook.textContent =
        data.facebook || "Facebook";
    }

    if (facebookLink) {
      facebookLink.href =
        data.facebook || "#";
    }

  } catch (error) {

    console.error(
      "Contact Exception:",
      error
    );

  }

}

/* =====================================================
   ARTICLES
===================================================== */

async function loadArticles() {

  const articleGrid =
    document.getElementById(
      "articleGrid"
    );


  if (!articleGrid) return;


  if (!supabaseClient) {

    articleGrid.innerHTML = `
      <p class="empty-state">
        अभी कोई published article उपलब्ध नहीं है।
      </p>
    `;

    return;

  }


  try {

    const result =
      await supabaseClient
        .from("articles")
        .select(`
          id,
          title,
          slug,
          description,
          content,
          image_url,
          category,
          author,
          published,
          created_at
        `)
        .eq("published", true)
        .order(
          "created_at",
          {
            ascending: false
          }
        );


    const data =
      result.data;

    const error =
      result.error;


    if (error) {

      console.error(
        "Articles Error:",
        error
      );


      articleGrid.innerHTML = `
        <p class="empty-state">
          Articles load नहीं हो सके।
        </p>
      `;

      return;

    }


    if (
      !data ||
      data.length === 0
    ) {

      articleGrid.innerHTML = `
        <p class="empty-state">
          अभी कोई published article उपलब्ध नहीं है।
        </p>
      `;

      return;

    }


    articleGrid.innerHTML =
      "";


    data.forEach(
      function (article) {

        const card =
          document.createElement(
            "article"
          );


        card.className =
          "article-card";


        let imageHTML = `
          <div class="article-image-placeholder">
            📰
          </div>
        `;


        if (article.image_url) {

          imageHTML = `
            <img
              src="${escapeHTML(
                article.image_url
              )}"
              alt="${escapeHTML(
                article.title || "Article"
              )}"
              loading="lazy"
            >
          `;

        }


        const description =
          article.description ||
          article.content ||
          "";


        const shortDescription =
          description.length > 150
            ? description.substring(
                0,
                150
              ) + "..."
            : description;


        card.innerHTML = `

          <div class="article-image">
            ${imageHTML}
          </div>

          <div class="article-content">

            ${
              article.category
                ? `
                  <span class="article-category">
                    ${escapeHTML(
                      article.category
                    )}
                  </span>
                `
                : ""
            }

            <h3>
              ${escapeHTML(
                article.title ||
                "Untitled Article"
              )}
            </h3>

            <p>
              ${escapeHTML(
                shortDescription
              )}
            </p>

            <div class="article-meta">

              <span>
                ${escapeHTML(
                  article.author ||
                  "Basanta"
                )}
              </span>

              <span>
                ${formatArticleDate(
                  article.created_at
                )}
              </span>

            </div>

            <button
              type="button"
              class="article-read-btn"
              data-article-id="${escapeHTML(
                String(article.id)
              )}"
            >
              Read More →
            </button>

          </div>

        `;


        articleGrid.appendChild(
          card
        );

      }
    );


    /* READ MORE */

    document
      .querySelectorAll(
        ".article-read-btn"
      )
      .forEach(
        function (button) {

          button.addEventListener(
            "click",
            function () {

              const articleId =
                String(
                  button.dataset.articleId
                );


              const article =
                data.find(
                  function (item) {

                    return String(
                      item.id
                    ) === articleId;

                  }
                );


              if (!article) return;


              openArticle(
                article
              );

            }
          );

        }
      );

  } catch (error) {

    console.error(
      "Articles Exception:",
      error
    );


    articleGrid.innerHTML = `
      <p class="empty-state">
        Article load करते समय समस्या हुई।
      </p>
    `;

  }

}


/* =====================================================
   ARTICLE DATE
===================================================== */

function formatArticleDate(
  date
) {

  if (!date) return "";


  const parsedDate =
    new Date(date);


  if (
    Number.isNaN(
      parsedDate.getTime()
    )
  ) {

    return "";

  }


  return parsedDate.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric"
    }
  );

}


/* =====================================================
   OPEN ARTICLE
===================================================== */

function openArticle(
  article
) {

  const slug =
    article.slug ||
    article.id;


  window.location.href =
    `article.html?slug=${encodeURIComponent(
      slug
    )}`;

}


/* =====================================================
   BOOKING
===================================================== */

async function submitBooking(
  event
) {

  event.preventDefault();


  if (!supabaseClient) {

    showMessage(
      "Supabase अभी connected नहीं है।",
      true
    );

    return;

  }


  const name =
    document
      .getElementById(
        "customerName"
      )
      ?.value
      .trim();


  const phone =
    document
      .getElementById(
        "customerPhone"
      )
      ?.value
      .trim();


  const address =
    document
      .getElementById(
        "customerAddress"
      )
      ?.value
      .trim();


  const pickupDate =
    document
      .getElementById(
        "pickupDate"
      )
      ?.value;


  const pickupTime =
    document
      .getElementById(
        "pickupTime"
      )
      ?.value;


  /* VALIDATION */

  if (!name) {

    showMessage(
      "कृपया अपना नाम डालें।",
      true
    );

    return;

  }


  if (
    !phone ||
    !/^[6-9]\d{9}$/.test(
      phone
    )
  ) {

    showMessage(
      "सही 10 digit mobile number डालें।",
      true
    );

    return;

  }


  if (!address) {

    showMessage(
      "Pickup address डालें।",
      true
    );

    return;

  }


  if (!pickupDate) {

    showMessage(
      "Pickup date चुनें।",
      true
    );

    return;

  }


  if (!pickupTime) {

    showMessage(
      "Pickup time चुनें।",
      true
    );

    return;

  }


  const button =
    bookingForm?.querySelector(
      'button[type="submit"]'
    );


  if (!button) return;


  const oldText =
    button.textContent;


  button.disabled =
    true;


  button.textContent =
    "Booking हो रही है...";


  try {

    const result =
      await supabaseClient
        .from("orders")
        .insert({

          customer_name:
            name,

          phone:
            phone,

          address:
            address,

          pickup_date:
            pickupDate,

          pickup_time:
            pickupTime,

          status:
            "pending"

        })
        .select(
          "id, order_number"
        )
        .single();


    if (result.error) {

      console.error(
        "Order Error:",
        result.error
      );


      showMessage(
        "Booking save नहीं हुई। Supabase table/RLS check करें।",
        true
      );


button.disabled =
        false;


      button.textContent =
        oldText;


      return;

    }


    if (!result.data) {

      showMessage(
        "Order create हुआ लेकिन details नहीं मिली।",
        true
      );


      button.disabled =
        false;


      button.textContent =
        oldText;


      return;

    }


    const orderId =
      result.data.order_number ||
      result.data.id;


    window.location.href =
      `success.html?order=${encodeURIComponent(
        orderId
      )}`;

  } catch (error) {

    console.error(
      "Booking Exception:",
      error
    );


    showMessage(
      "Technical problem हुई।",
      true
    );


    button.disabled =
      false;


    button.textContent =
      oldText;

  }

}


/* =====================================================
   MESSAGE
===================================================== */

function showMessage(
  message,
  error = false
) {

  if (!bookingMessage) return;


  bookingMessage.textContent =
    message;


  bookingMessage.style.color =
    error
      ? "#c0392b"
      : "#176b52";

}


/* =====================================================
   FORMAT PRICE
===================================================== */

function formatPrice(
  price
) {

  const number =
    Number(price);


  if (
    Number.isNaN(number)
  ) {

    return "0";

  }


  return number.toLocaleString(
    "en-IN"
  );

}


/* =====================================================
   ESCAPE HTML
===================================================== */

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


/* =====================================================
   SAFE IMAGE URL
===================================================== */

function escapeCSSURL(
  value
) {

  return String(
    value ?? ""
  )
    .replace(
      /\\/g,
      "\\\\"
    )
    .replace(
      /"/g,
      '\\"'
    );

}


/* =====================================================
   GLOBAL ERROR PROTECTION
===================================================== */

window.addEventListener(
  "error",
  function (event) {

    console.error(
      "Website Error:",
      event.error || event.message
    );

  }
);


/* =====================================================
   END
===================================================== */

/* =====================================================
   CONTACT INFORMATION
===================================================== */

async function loadContactInformation() {

  try {

    const {
      data,
      error
    } = await supabaseClient

      .from("site_contact")

      .select(`
        phone,
        whatsapp,
        email,
        address,
        instagram,
        facebook
      `)

      .limit(1)

      .maybeSingle();


    if (error) {

      console.error(
        "Contact Load Error:",
        error
      );

      showContactError();

      return;
    }


    if (!data) {

      console.log(
        "Contact information नहीं मिली।"
      );

      showContactError();

      return;
    }


    /* =================================================
       PHONE
    ================================================= */

    const phone =
      document.getElementById(
        "contactPhone"
      );

    const phoneLink =
      document.getElementById(
        "contactPhoneLink"
      );


    if (phone) {

      phone.textContent =
        data.phone || "Not available";

    }


    if (
      phoneLink &&
      data.phone
    ) {

      const cleanPhone =
        String(data.phone)
          .replace(
            /[^0-9+]/g,
            ""
          );

      phoneLink.href =
        "tel:" + cleanPhone;

    }


    /* =================================================
       WHATSAPP
    ================================================= */

    const whatsapp =
      document.getElementById(
        "contactWhatsapp"
      );

    const whatsappLink =
      document.getElementById(
        "contactWhatsappLink"
      );


    if (whatsapp) {

      whatsapp.textContent =
        data.whatsapp || "Not available";

    }


    if (
      whatsappLink &&
      data.whatsapp
    ) {

      const whatsappNumber =
        String(data.whatsapp)
          .replace(
            /[^0-9]/g,
            ""
          );


      whatsappLink.href =
        "https://wa.me/" +
        whatsappNumber;

    }


    /* =================================================
       EMAIL
    ================================================= */

    const email =
      document.getElementById(
        "contactEmail"
      );

    const emailLink =
      document.getElementById(
        "contactEmailLink"
      );


    if (email) {

      email.textContent =
        data.email || "Not available";

    }


    if (
      emailLink &&
      data.email
    ) {

      emailLink.href =
        "mailto:" +
        data.email;

    }


    /* =================================================
       ADDRESS
    ================================================= */

    const address =
      document.getElementById(
        "contactAddress"
      );


    if (address) {

      address.textContent =
        data.address ||
        "Address not available";

    }


    /* =================================================
       INSTAGRAM
    ================================================= */

    const instagram =
      document.getElementById(
        "contactInstagram"
      );


    if (instagram) {

      if (data.instagram) {

        instagram.href =
          data.instagram;

        instagram.style.display =
          "inline-flex";

      }

      else {

        instagram.style.display =
          "none";

      }

    }


    /* =================================================
       FACEBOOK
    ================================================= */

    const facebook =
      document.getElementById(
        "contactFacebook"
      );


    if (facebook) {

      if (data.facebook) {

        facebook.href =
          data.facebook;

        facebook.style.display =
          "inline-flex";

      }

      else {

        facebook.style.display =
          "none";

      }

    }


    console.log(
      "Contact information loaded successfully."
    );

  }

  catch (error) {

    console.error(
      "Contact Exception:",
      error
    );

    showContactError();

  }

}


/* =====================================================
   CONTACT ERROR
===================================================== */

function showContactError() {

  const phone =
    document.getElementById(
      "contactPhone"
    );

  const whatsapp =
    document.getElementById(
      "contactWhatsapp"
    );

  const email =
    document.getElementById(
      "contactEmail"
    );

  const address =
    document.getElementById(
      "contactAddress"
    );


  if (phone) {

    phone.textContent =
      "Not available";

  }


  if (whatsapp) {

    whatsapp.textContent =
      "Not available";

  }


  if (email) {

    email.textContent =
      "Not available";

  }


  if (address) {

    address.textContent =
      "Not available";

  }

}


/* =====================================================
   LOAD CONTACT WHEN PAGE OPENS
===================================================== */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    loadContactInformation();

  }
);