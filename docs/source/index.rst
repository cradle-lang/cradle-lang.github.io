.. raw:: html

   <div class="landing-hero">

Build reproducible cyber environments
=====================================

.. rst-class:: landing-intro

CRADLE is a domain-specific language for describing and modeling
cyber-environments used in cybersecurity testing, research, and training.

.. raw:: html

     <div class="hero-actions">
       <a class="hero-primary" href="introduction/helloworld.html">Build your first environment <span aria-hidden="true">→</span></a>
     </div>
   </div>

Why CRADLE?
-----------

Cyber environments often depend on manual configuration, scattered scripts,
and platform-specific knowledge. CRADLE brings these elements together in a
structured specification that is easier to review, reproduce, and maintain.

.. grid:: 1 1 3 3
   :gutter: 2

   .. grid-item-card:: Reproducible by design

      Capture systems, networks, objects, and events in an explicit
      specification that can be reviewed and reused.

   .. grid-item-card:: From scenario to deployment

      Transform a high-level CRADLE scenario into structured configuration
      and deployment artifacts for supported infrastructure.

   .. grid-item-card:: Built for research and training

      Preserve the conditions of a cyber scenario so teams can understand,
      share, and repeat experiments and training exercises.

Choose your path
----------------

Start with the path that best matches what you need to do.

.. grid:: 1 1 3 3
   :gutter: 2

   .. grid-item-card:: Get started
      :link: introduction/index
      :link-type: doc
      :class-card: landing-card

      **New to CRADLE?** Learn the core concepts, then build a complete
      environment from a practical example.

      +++
      Start learning →

   .. grid-item-card:: Use the schema
      :link: schema/cradle-schema
      :link-type: doc
      :class-card: landing-card

      **Building tooling?** Review the canonical metadata, instances,
      networks, and events supported by CRADLE.

      +++
      Open reference →

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

Built for cybersecurity workflows
---------------------------------

CRADLE supports teams that need structured, repeatable cyber environments
for research, training, emulation, and testing.

.. grid:: 1 2 2 4
   :gutter: 2

   .. grid-item-card:: Security research

      Preserve the systems, network conditions, artifacts, and event sequence
      used in an experiment so the scenario can be reviewed and repeated.

   .. grid-item-card:: Cyber-range training

      Define training environments with explicit infrastructure, actions, and
      execution sequences instead of relying on scattered setup instructions.

   .. grid-item-card:: Threat emulation

      Model attacker activity, defensive controls, and cybersecurity concepts
      using structured events and recognized security frameworks.

   .. grid-item-card:: Environment testing

      Generate consistent multi-system deployment artifacts from a single,
      reviewable scenario definition.

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

Start exploring CRADLE
----------------------

New to CRADLE? Begin with the language overview, examine a complete Hello
World environment, or review the schema used to structure CRADLE scenarios.

.. grid:: 1 1 3 3
   :gutter: 2

   .. grid-item-card:: Understand CRADLE
      :link: introduction/index
      :link-type: doc
      :class-card: landing-card

      Learn what CRADLE is, the problem it addresses, and how its structured
      scenario format works.

      +++
      Read the overview →

   .. grid-item-card:: Explore an example
      :link: introduction/helloworld
      :link-type: doc
      :class-card: landing-card

      Walk through a complete CRADLE environment containing systems, a
      network, metadata, events, and an executable object.

      +++
      View Hello World →

   .. grid-item-card:: Review the schema
      :link: schema/cradle-schema
      :link-type: doc
      :class-card: landing-card

      Examine the supported metadata, instances, networks, events, and
      properties used by CRADLE scenarios.

      +++
      Open the reference →

.. toctree::
   :hidden:
   :maxdepth: 2
   :caption: CRADLE Language

   introduction/index
   introduction/sections
   introduction/heuristic
   introduction/helloworld


.. toctree::
   :hidden:
   :maxdepth: 1
   :caption: Deployment

   deployment/supported-platforms

.. toctree::
   :hidden:
   :maxdepth: 1
   :caption: Project

   project/references
   project/acknowledgments
   project/release-notes
   project/support
   project/legal-notices
