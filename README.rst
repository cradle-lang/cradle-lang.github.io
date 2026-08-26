CRADLE Documentation
====================

.. image:: https://github.com/cradle-lang/cradle-lang.github.io/actions/workflows/docs-check.yml/badge.svg?branch=main
   :target: https://github.com/cradle-lang/cradle-lang.github.io/actions/workflows/docs-check.yml
   :alt: Build

.. image:: https://img.shields.io/badge/docs-cradle--lang.org-blue
   :target: https://cradle-lang.org/
   :alt: Documentation

.. image:: https://github.com/cradle-lang/cradle-lang.github.io/actions/workflows/links.yml/badge.svg?branch=main
   :target: https://github.com/cradle-lang/cradle-lang.github.io/actions/workflows/links.yml
   :alt: Links

.. image:: https://github.com/cradle-lang/cradle-lang.github.io/actions/workflows/docs-quality.yml/badge.svg?branch=main
   :target: https://github.com/cradle-lang/cradle-lang.github.io/actions/workflows/docs-quality.yml
   :alt: Docs Quality

This repository contains the source for the official CRADLE documentation website.

The documentation is built with `Docusaurus <https://docusaurus.io/>`_ and published at
`cradle-lang.org <https://cradle-lang.org/>`_.

Development
-----------

Prerequisites
~~~~~~~~~~~~~

Ensure that Node.js and npm are installed.

Install the project dependencies with:

.. code-block:: bash

   npm ci

Start the local development server with:

.. code-block:: bash

   npm run start

By default, the website is available at:

.. code-block:: text

   http://localhost:3000/

Production Build
~~~~~~~~~~~~~~~~

Create a production build with:

.. code-block:: bash

   npm run build

The generated static site is written to the ``build/`` directory.

A successful production build should be completed before submitting changes.

Repository Structure
--------------------

The main repository directories are:

``config/``
   Configuration used by the Docusaurus website.

``docs/``
   Documentation for the current CRADLE version.

``scripts/``
   Supporting scripts used during documentation build and maintenance tasks.

``src/``
   Docusaurus pages, components and website-specific source files.

``static/``
   Static assets copied directly into the generated website.

``versioned_docs/``
   Documentation snapshots for previously published CRADLE versions.

``versioned_sidebars/``
   Sidebar definitions associated with versioned documentation.

Documentation Versioning
------------------------

CRADLE supports Docusaurus documentation versioning.

The ``docs/`` directory currently contains the active documentation.

Published documentation snapshots can be stored under ``versioned_docs/`` with their
corresponding sidebar configuration under ``versioned_sidebars/``.

Historical versioned documentation should not normally be modified unless a change is
specifically intended to correct or update that version.

Contributing
------------

Changes should normally be associated with a GitHub issue and submitted through a
dedicated branch and pull request.

Before submitting a pull request, verify that the production build completes
successfully:

.. code-block:: bash

   npm run build

See ``CONTRIBUTING.md`` for the contribution guidelines.

Deployment
----------

The documentation website is built and deployed through GitHub Actions.

Contributors should not deploy the website manually unless explicitly required.

Legal
-----

CRADLE documentation and associated project materials are subject to the legal,
copyright and licensing terms published with the project documentation.

Refer to the CRADLE website for the applicable legal notices and licence terms.