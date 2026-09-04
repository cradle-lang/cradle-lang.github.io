CRADLE Documentation Website
============================

.. image:: https://github.com/cradle-lang/cradle-lang.github.io/actions/workflows/docs-check.yml/badge.svg?branch=main
   :target: https://github.com/cradle-lang/cradle-lang.github.io/actions/workflows/docs-check.yml
   :alt: Build status

.. image:: https://img.shields.io/badge/docs-cradle--lang.org-blue
   :target: https://cradle-lang.org/
   :alt: Published documentation

.. image:: https://github.com/cradle-lang/cradle-lang.github.io/actions/workflows/links.yml/badge.svg?branch=main
   :target: https://github.com/cradle-lang/cradle-lang.github.io/actions/workflows/links.yml
   :alt: Link-check status

.. image:: https://github.com/cradle-lang/cradle-lang.github.io/actions/workflows/docs-quality.yml/badge.svg?branch=main
   :target: https://github.com/cradle-lang/cradle-lang.github.io/actions/workflows/docs-quality.yml
   :alt: Documentation-quality status

This repository contains the source for the official `CRADLE website
<https://cradle-lang.org/>`_. It explains the CRADLE language and CradleXC
workflow, provides versioned technical documentation and release notes, and
includes a browser-based Workbench for exploring scenario structure.

CRADLE (Cyber-testbed Reconstruction and Automation Description Language) is a
declarative domain-specific language for Cyber Experimentation as Code. CradleXC
is its current compiler implementation and ``cxc`` is the command-line
interface. This repository documents those projects; it does not contain the
CradleXC compiler or a deployment backend.

Project Goals and Audience
--------------------------

The site serves several audiences without forcing all of them through the same
path:

* new users can understand the problem and complete a guided first scenario;
* scenario authors can find task-oriented language and workflow guidance;
* operators can find installation, CLI, backend and troubleshooting material;
* backend developers can inspect the plugin protocol and Deployment IR contract;
* evaluators and researchers can inspect examples, limitations, architecture and
  project references.

The content should help a reader move from understanding CRADLE to authoring,
validating, inspecting and generating target-specific files. It must also state
product boundaries clearly: CradleXC does not automatically deploy generated
files, backend capabilities differ, and preview references are not substitutes
for compiler validation.

Technology and Runtime
----------------------

The website is a statically generated `Docusaurus 3
<https://docusaurus.io/>`_ application using React, TypeScript, MDX and CSS
Modules. The minimum supported development runtime is Node.js 20; CI currently
uses Node.js 22. npm and the committed ``package-lock.json`` provide reproducible
dependency installation.

Quick Start
-----------

Prerequisites
~~~~~~~~~~~~~

Install:

* Node.js 20 or newer;
* npm (included with Node.js); and
* Git for the normal contribution workflow.

Install dependencies and start the development server:

.. code-block:: bash

   npm ci
   npm run start

The site is normally available at ``http://localhost:3000/``. Docusaurus watches
source files and refreshes the browser during development.

Create and inspect a production build with:

.. code-block:: bash

   npm run build
   npm run serve

The static output is written to ``build/``. ``npm run build`` also regenerates
``src/data/release-notes.json`` from the Markdown files in ``release-notes/``.
Do not hand-edit that generated JSON file.

Useful Commands
---------------

``npm run start``
   Generate local release-note data and start the development server.

``npm run build``
   Regenerate release-note data and create the production site. Broken internal
   links fail this command.

``npm run serve``
   Serve the completed ``build/`` directory for production-like inspection.

``npm run clear``
   Clear Docusaurus caches when generated state becomes stale.

``npm run generate-release-notes``
   Rebuild the local release-note index without building the site.

``npm run fetch-releases``
   Fetch non-draft GitHub releases from the CradleXC repository into
   ``src/data/releases.json``. This optional maintenance command requires a
   ``CRADLE_RELEASES_TOKEN``; normal local builds do not.

Information Architecture
------------------------

The primary navigation reflects common user intentions rather than the codebase
layout:

``Get Started``
   A short, ordered path from installation to a first scenario and generated
   output.

``Documentation``
   Task guides, language concepts, CLI reference, examples, backend-development
   material and project information.

``Workbench``
   An in-browser environment for editing and inspecting a scenario model.

``Releases``
   Locally maintained, version-ordered release notes with stable hash links.

Search, documentation-version selection and theme selection remain globally
available. The documentation sidebar begins with orientation and progressively
moves toward specialist reference material. This supports both sequential
learning and direct lookup.

Repository Structure
--------------------

``config/sidebars.ts``
   The current documentation hierarchy. Add a document here when it should be
   reachable from the primary documentation sidebar.

``docs/``
   Source for the current documentation at ``/docs/``. Markdown is suitable for
   ordinary content; MDX is used where React-compatible markup or components are
   needed.

``release-notes/``
   Canonical local release-note Markdown. Published notes use semantic-version
   names such as ``v1.2.0.md``. Files beginning with ``v0.`` are intentionally
   excluded from the public release-note index.

``scripts/``
   Release-data generation and maintenance scripts.

``src/components/homepage/``
   Homepage sections, each colocated with a CSS Module.

``src/components/workbench/``
   Workbench state, parser, editor, inspector, diagnostics, samples and SVG
   visualizations.

``src/pages/``
   Standalone Docusaurus routes, including the homepage, Workbench and releases.

``src/theme/``
   Swizzled or custom Docusaurus theme components, currently including the
   documentation-version menu.

``src/css/custom.css``
   Site-wide design tokens and documentation/theme overrides. Component-specific
   rules should normally remain in their CSS Modules.

``static/``
   Assets copied unchanged into the generated site.

``versioned_docs/`` and ``versioned_sidebars/``
   Immutable snapshots and navigation for published documentation versions.

``versions.json``
   Versions known to Docusaurus.

``.github/workflows/``
   Build, Markdown/MDX quality, link checking, release publication and GitHub
   Pages deployment automation.

Architectural Choices
---------------------

Static generation
~~~~~~~~~~~~~~~~~

Docusaurus produces a static site so the documentation is fast to load, simple
to host on GitHub Pages and usable without an application server. Build-time
link validation catches navigation failures before publication.

Content and presentation separation
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Long-lived technical knowledge belongs in ``docs/`` rather than React
components. React components are reserved for interactions and structured
landing-page presentations. CSS Modules isolate component styles, while shared
tokens in ``src/css/custom.css`` maintain visual consistency and theme support.

Versioned documentation
~~~~~~~~~~~~~~~~~~~~~~~

``docs/`` describes the active product. A published snapshot preserves the
contract users saw for that release. Historical pages are therefore not updated
automatically with current behavior; corrections to them must be deliberate and
must update their matching versioned sidebar when navigation changes.

Backend separation
~~~~~~~~~~~~~~~~~~

The site consistently presents CRADLE source, CradleXC compilation, external
backend generation and user-controlled deployment as separate stages. This
mirrors the product architecture and avoids implying that a scenario is portable
to a target whose backend does not support its features.

Local release-note generation
~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Release notes are authored as reviewable Markdown and converted to JSON at build
time. This keeps editorial history readable in Git while giving the React page
structured, semantically sorted data. A build remains deterministic and does not
depend on GitHub API availability.

Workbench boundary
~~~~~~~~~~~~~~~~~~

The Workbench is a client-side learning and inspection tool. It uses a purpose-
built, tolerant parser to derive instances, networks, objects, events and links
for visualization. It does not invoke CradleXC, resolve ``include`` files,
perform complete semantic validation, generate provider files or deploy
infrastructure. Compiler commands remain the authority for production
validation.

Workbench source is saved in the browser under the ``cradleWorkbenchSource``
local-storage key. Import reads a user-selected text file locally and export
creates a local ``.cradle`` download. Replacing non-empty source requires
confirmation. No server upload is part of the current implementation.

Human-Computer Interaction Rationale
------------------------------------

The interface is designed around comprehension, confidence and recoverability,
not decoration alone.

Progressive disclosure and audience paths
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

The homepage first establishes the problem and value, then demonstrates the
source-to-environment relationship, offers evidence, explains the supported
workflow and finally points to learning and installation. This ordering limits
early jargon while retaining direct navigation for experienced users. The
documentation landing page groups links by user goal, reducing the need to know
the repository's terminology in advance.

Recognition over recall
~~~~~~~~~~~~~~~~~~~~~~~

Stable navigation labels, numbered workflows, visible example commands and
task-named cards make choices recognizable. The interactive homepage maps a
selected source line directly to its topology counterpart. In the Workbench,
sample scenarios, counts, labels and an inspector expose context that users
would otherwise have to remember from source text.

Visibility of system status
~~~~~~~~~~~~~~~~~~~~~~~~~~~

The Workbench reports scenario counts, generation results, warnings and errors.
It explicitly marks when edited source has not yet been visualized, preventing a
stale graph from being mistaken for the current model. The console uses polite
live announcements, while parsing failures include a line, offending source and
suggested next action.

User control, error prevention and recovery
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Visualization is generated explicitly so users control when an edited scenario
updates. Import, sample loading and creation of a new scenario warn before
replacing existing work. Browser persistence reduces accidental loss and export
provides a portable copy. Warnings preserve usable partial results where safe;
blocking parse errors avoid presenting a graph that looks authoritative.

Multiple representations
~~~~~~~~~~~~~~~~~~~~~~~~

Topology, event flow, structured inspection, metrics, diagnostics and a text
summary provide complementary ways to inspect the same model. The text summary
is especially important: a visual graph should enhance understanding, not be
the only way to access information.

Consistency and hierarchy
~~~~~~~~~~~~~~~~~~~~~~~~~

Shared spacing, typography, colors, card behavior and focus treatment establish
a predictable visual grammar. Primary actions are limited and visually distinct;
secondary links remain available without competing with the next recommended
step. Semantic headings and numbered stages communicate hierarchy independently
of layout.

Accessibility and inclusive interaction
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Controls use native buttons, links, labels and tab semantics. Workbench view tabs
support Left/Right Arrow, Home and End navigation; interactive SVG items are
focusable and selectable with Enter or Space. Status and diagnostics expose live
regions, informative graphics have accessible names and descriptions, and purely
decorative graphics are hidden from assistive technology. Visible focus states,
light and dark themes, responsive layouts, 44-pixel mobile controls and reduced-
motion behavior support a wider range of input methods and preferences.

Responsive design changes the Workbench from simultaneous panes to explicit
Source, Visualization and Inspector views on small screens. This preserves usable
target sizes and readable content rather than compressing a desktop workspace
beyond recognition.

Trust and calibrated claims
~~~~~~~~~~~~~~~~~~~~~~~~~~

The site links claims to inspectable examples, schema material and the Workbench,
and states limitations near the affected feature. Preview UI is labelled as such.
Generated target files are not described as deployed infrastructure. These
choices help users form an accurate mental model and avoid costly assumptions
about compiler, backend or deployment behavior.

Contribution and Review
-----------------------

Work should normally be associated with an issue, developed on a dedicated
branch and submitted through a pull request. Before submission, run at least:

.. code-block:: bash

   npm run build

For visual changes, also inspect the affected flows at desktop and mobile widths,
in light and dark themes, with keyboard navigation and reduced motion enabled.
See ``CONTRIBUTING.md`` for content standards, HCI decision guidance, validation
and the full review checklist.

Pull Request Template
~~~~~~~~~~~~~~~~~~~~~

The repository's default template is stored at
``.github/PULL_REQUEST_TEMPLATE.md`` on the default branch. GitHub displays its
contents when a contributor opens a pull request on GitHub. GitHub CLI users can
load it explicitly with:

.. code-block:: bash

   gh pr create --template .github/PULL_REQUEST_TEMPLATE.md

API integrations and coding agents that construct a pull-request body must read
the template and include its completed sections in that body.

The template asks for a summary, related issue, change type, validation,
screenshots and additional notes. Replace its prompts with change-specific
information and mark a checkbox only when that validation was performed. Use
``Additional Notes`` for relevant design or HCI rationale, version impact and
limitations. Automated contributors must distinguish executed checks from manual
checks that remain outstanding.

Continuous Integration and Deployment
-------------------------------------

Pull requests and pushes to ``main`` run the production build and
Markdown/MDX lint checks. The link workflow builds the site and checks generated
HTML, including a weekly run for external-link drift. GitHub Pages deployment
runs after pushes to ``main`` and on a scheduled rebuild; contributors should not
deploy manually unless explicitly required.

Legal and Support
-----------------

Legal notices, copyright and licence terms are published under
``docs/project/``. Use the project's support guidance and issue tracker for
documentation defects, Workbench problems and reproducible product questions.
Do not include secrets, access tokens, private infrastructure details or
sensitive scenario data in issues, screenshots, examples or commits.
