.. raw:: html

   <div class="landing-hero">
   <p class="hero-eyebrow">Cyber Experimentation As Code</p>

Define repeatable cyber environments—without fragmented setup
==============================================================

.. rst-class:: landing-intro

CRADLE is a declarative and debuggable Cyber Experimentation As Code (CEaC)
language. It describes computing components as code to provide a high-level,
static description of computing infrastructure.

.. raw:: html

     <div class="hero-actions">
       <a class="hero-primary" href="getting-started/quick-start.html">Generate Hello World <span aria-hidden="true">→</span></a>
       <a class="hero-secondary" href="project/business-case.html">Why use CRADLE?</a>
     </div>
   </div>

From fragmented setup to a shared scenario
------------------------------------------

Cyber environments often depend on manual configuration, scattered scripts,
and platform-specific knowledge held by individual team members. CRADLE makes
the scenario itself explicit so its intent can be reviewed, versioned, reused,
and adapted for supported infrastructure.

.. grid:: 1 1 3 3
   :gutter: 2

   .. grid-item-card:: Preserve scenario knowledge

      Keep systems, networks, objects, and events together instead of relying
      on disconnected setup instructions and undocumented expertise.

   .. grid-item-card:: Review changes with confidence

      Store the scenario as structured, version-controllable source that
      researchers, engineers, and reviewers can inspect and discuss.

   .. grid-item-card:: Adapt for supported targets

      Generate target-specific artifacts from a common definition while
      keeping provider capabilities and limitations visible.

Choose your path
----------------

Start with the path that best matches what you need to do.

.. grid:: 1 1 2 2
   :gutter: 2

   .. grid-item-card:: Get started
      :link: getting-started/quick-start
      :link-type: doc
      :class-card: landing-card

      **New to CRADLE?** Generate, deploy, and verify the included Hello World
      scenario through one guided workflow.

      +++
      Run Hello World →

   .. grid-item-card:: Write a scenario
      :link: user-guide/write-scenario
      :link-type: doc
      :class-card: landing-card

      **Ready to create?** Define systems, networks, artifacts, and events in
      a complete CRADLE scenario.

      +++
      Start authoring →

How CRADLE works
----------------

Move from a structured cyber scenario to deployment-ready infrastructure
through a clear, repeatable workflow.

.. grid:: 1 2 4 4
   :gutter: 2
   :class-container: workflow-grid

   .. grid-item::

      .. raw:: html

         <div class="workflow-step"><span>01</span><strong>Define</strong><p>Describe the systems, networks, objects, and events that make up your cyber scenario.</p></div>

   .. grid-item::

      .. raw:: html

         <div class="workflow-step"><span>02</span><strong>Compile</strong><p>Convert the CRADLE specification into a structured, lower-level environment definition.</p></div>

   .. grid-item::

      .. raw:: html

         <div class="workflow-step"><span>03</span><strong>Generate</strong><p>Create the configuration and deployment artifacts required by the selected target.</p></div>

   .. grid-item::

      .. raw:: html

         <div class="workflow-step"><span>04</span><strong>Execute</strong><p>Run supported deployments and collect operational outputs for analysis and verification.</p></div>

Supported deployment targets
----------------------------

Generate CRADLE deployment artifacts for supported local virtualization
providers and cyber-range infrastructure.

.. grid:: 1 1 3 3
   :gutter: 2

   .. grid-item-card:: libvirt

      The default provider for Linux-based local deployments. CRADLE supports
      deployment generation and complete scenario execution with libvirt.

   .. grid-item-card:: VirtualBox

      An alternative provider for local virtual-machine environments. CRADLE
      supports deployment generation and complete scenario execution with
      VirtualBox.

   .. grid-item-card:: SPHERE

      Generate deployment artifacts for the NSF-funded SPHERE public research
      testbed. Workflow availability depends on the selected SPHERE portal,
      project access, and configured infrastructure.

.. toctree::
   :hidden:
   :maxdepth: 2
   :caption: Getting Started

   introduction/index
   getting-started/prepare-host
   getting-started/quick-start
   introduction/helloworld

.. toctree::
   :hidden:
   :maxdepth: 2
   :caption: User Guide

   user-guide/write-scenario
   user-guide/generate-deployment
   user-guide/deploy-environment
   user-guide/understand-output
   user-guide/clean-up
   user-guide/troubleshooting
   user-guide/known-limitations

.. toctree::
   :hidden:
   :maxdepth: 1
   :caption: Reference

   introduction/sections
   introduction/heuristic
   deployment/supported-platforms
   reference/command-reference

.. toctree::
   :hidden:
   :maxdepth: 1
   :caption: Project

   project/business-case
   project/release-notes
   project/references
   project/support
   project/acknowledgments
   project/legal-notices
