let readTheDocsConfig = null;

const formatVersionLabel = (version) => {
  const slug = version?.slug || "";

  if (version?.type === "external" || /^pull\/?/i.test(slug)) {
    return "PR preview";
  }

  if (slug === "latest") {
    return "Latest";
  }

  if (slug === "stable") {
    return "Stable";
  }

  return slug || "Documentation";
};

const renderVersionControl = () => {
  const container = document.querySelector(".sidebar-version-control");

  if (!container) {
    return;
  }

  const isLocalPreview = ["localhost", "127.0.0.1", "::1"].includes(
    window.location.hostname
  );

  if (!readTheDocsConfig) {
    container.textContent = isLocalPreview ? "Development" : "Latest";
    container.setAttribute(
      "aria-label",
      isLocalPreview ? "Local development documentation" : "Latest documentation"
    );
    return;
  }

  const current = readTheDocsConfig.versions?.current;
  const versions = readTheDocsConfig.versions?.active || [];

  if (versions.length < 2) {
    container.textContent = formatVersionLabel(current);
    container.setAttribute(
      "aria-label",
      `Documentation version ${formatVersionLabel(current)}`
    );
    return;
  }

  const label = document.createElement("label");
  label.className = "visually-hidden";
  label.htmlFor = "documentation-version";
  label.textContent = "Documentation version";

  const select = document.createElement("select");
  select.id = "documentation-version";
  select.className = "sidebar-version-select";

  versions.forEach((version) => {
    const option = document.createElement("option");
    option.value = version.urls.documentation;
    option.textContent = formatVersionLabel(version);
    option.selected = version.slug === current?.slug;
    select.append(option);
  });

  select.addEventListener("change", () => {
    window.location.assign(select.value);
  });

  container.replaceChildren(label, select);
};

document.addEventListener("readthedocs-addons-data-ready", (event) => {
  readTheDocsConfig = event.detail.data();
  renderVersionControl();
});

document.addEventListener("DOMContentLoaded", () => {
  const sidebar = document.querySelector(".sidebar-container");
  const brand = document.querySelector(".sidebar-brand");

  if (!sidebar) {
    return;
  }

  sidebar.id = "site-navigation-sidebar";

  if (brand && !document.querySelector(".sidebar-brand-row")) {
    const brandRow = document.createElement("div");
    brandRow.className = "sidebar-brand-row";

    const version = document.createElement("span");
    version.className = "sidebar-version-control";

    brand.before(brandRow);
    brandRow.append(brand, version);
    renderVersionControl();
  }

  const button = document.createElement("button");
  button.className = "sidebar-collapse-button";
  button.type = "button";
  button.textContent = "‹";
  button.setAttribute("aria-controls", sidebar.id);

  sidebar.prepend(button);

  const storageKey = "cradle-sidebar-collapsed";

  const setCollapsed = (collapsed) => {
    document.body.classList.toggle("sidebar-collapsed", collapsed);

    button.setAttribute("aria-expanded", String(!collapsed));
    button.setAttribute(
      "aria-label",
      collapsed
        ? "Expand navigation sidebar"
        : "Collapse navigation sidebar"
    );

    button.title = collapsed
      ? "Expand navigation"
      : "Collapse navigation";
  };

  let initiallyCollapsed = false;

  try {
    initiallyCollapsed =
      window.localStorage.getItem(storageKey) === "true";
  } catch {
    // Continue without saved preferences if storage is unavailable.
  }

  setCollapsed(initiallyCollapsed);

  button.addEventListener("click", () => {
    const collapsed =
      !document.body.classList.contains("sidebar-collapsed");

    setCollapsed(collapsed);

    try {
      window.localStorage.setItem(storageKey, String(collapsed));
    } catch {
      // The toggle still works when storage is unavailable.
    }
  });
});
