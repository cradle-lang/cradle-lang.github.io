# Strategy and evaluation

This page applies marketing-planning concepts to information already present
in the CRADLE documentation. It separates documented facts from questions that
require market research, user evidence, or a project-owner decision.

The public-facing conclusions appear on
[Why CRADLE?](../docs/source/project/business-case.md). This
page records the analysis behind those conclusions so the technical guides do
not need to carry business-framework terminology.

## Marketing process

The documentation can support a seven-stage process:

1. **Situational analysis** — identify the documented problem, capabilities,
   limitations, and evidence.
2. **Target marketing** — present the intended user groups already named in
   the guide.
3. **Positioning** — explain CRADLE as a declarative and debuggable CEaC
   language for high-level, static infrastructure descriptions.
4. **Differentiation** — show what one CRADLE scenario represents and how it
   addresses fragmented environment definitions.
5. **Marketing mix** — map the documented product, delivery, people, process,
   and evidence while leaving undecided elements unclaimed.
6. **Implementation** — connect awareness, evaluation, and use to the relevant
   documentation paths.
7. **Evaluation** — test whether readers understand the proposition and can
   complete the documented workflow.

## Situational analysis

### Documented problem

Environment intent can be distributed across configuration files, scripts,
infrastructure settings, and knowledge held by individuals. This can make
changes harder to understand and scenarios harder to recreate.

### Documented offering

CRADLE provides:

- a declarative and debuggable domain-specific language;
- a Cyber Experimentation As Code description;
- a high-level, static description of computing infrastructure;
- structured systems, networks, objects, events, and annotations;
- an intermediary representation; and
- generation for libvirt, VirtualBox, and SPHERE, with complete local workflow
  coverage documented for libvirt and VirtualBox.

### Documented constraints

- Provider capabilities and behavior can differ.
- Operation requires authorized and prepared infrastructure.
- Images, artifacts, roles, access, and capacity remain environment-specific.
- The grammar, compiler, and JSON Schema are not completely aligned.
- Heuristic annotations are preserved as metadata without full semantic
  validation.

## Target marketing

The documentation names five intended audiences:

| Audience | Documented application |
| --- | --- |
| Cybersecurity researchers | Controlled, repeatable experiments |
| Educators and exercise designers | Repeatable training scenarios |
| Security teams | Threat modeling and defensive validation |
| Cyber-range and test-environment engineers | Structured environment definitions and supported deployments |
| CRADLE developers | Language, schema, intermediary representation, and toolchain maintenance |

The current documentation does not establish audience size, willingness to
adopt, purchasing authority, or commercial priority. Those questions require
external research before the project selects a primary target market.

## Positioning strategy

The source-supported positioning statement is:

> For teams that need structured and repeatable cyber environments, CRADLE is
> a declarative and debuggable Cyber Experimentation As Code language that
> describes computing infrastructure at a high level. It brings systems,
> networks, artifacts, and event sequences into one static environment
> description that can be reviewed, maintained, and transformed for supported
> deployment targets.

The documentation should consistently communicate five elements:

| Element | Documented message |
| --- | --- |
| Category | Cyber Experimentation As Code |
| Method | Declarative and debuggable domain-specific language |
| Description | High-level, static computing-infrastructure description |
| Value | Repeatability, reviewability, and maintainability |
| Evidence | Hello World workflow and documented support for three targets |

## Differentiation and competitive advantage

The current documentation supports differentiation against the documented
problem, not against named competitors. CRADLE brings metadata, systems,
networks, artifacts, events, and annotations into one structured description
and transforms that description into target-specific material.

This combination is a **candidate competitive advantage**. A verified
competitive advantage is not established by the current docs because they do
not contain competitor research, comparative testing, adoption evidence, or
measured user outcomes.

## Source-bounded SWOT

| Category | What the current documentation supports |
| --- | --- |
| Strengths | Declarative and debuggable language; repeatability; reviewability; maintainability; structured scenarios; generation for supported targets |
| Weaknesses | Grammar, compiler, and schema differences; incomplete heuristic validation; provider-specific behavior and dependencies |
| Opportunities | Not established by the current documentation |
| Threats | Not established by the current documentation |

Opportunities and threats should be completed only after user, market,
competitor, and technology research.

## Source-bounded PESTLE

| Factor | What the current documentation supports |
| --- | --- |
| Political | Not established by the current documentation |
| Economic | Pricing, cost, savings, and willingness to pay are not established |
| Social | Environment knowledge can otherwise remain with individual team members |
| Technological | Provider capabilities, access, images, networking, and operational responsibilities differ |
| Legal | Workflows require authorization, governance, and appropriate access to infrastructure and artifacts |
| Environmental | Not established by the current documentation |

The table deliberately avoids inferring market trends, regulation, financial
benefits, or environmental effects.

## Marketing mix

An adapted seven-part mix keeps the analysis relevant to a technical product
and its documentation:

| Element | Current documented basis |
| --- | --- |
| Product | CRADLE language, compiler and assembly workflow, scenarios, documentation, and supported-target material |
| Price | Not established by the current documentation |
| Place | The guides refer to authorized CRADLE copies; a wider distribution strategy is not established |
| Promotion | The documentation currently provides the homepage, overview, Quick start, Hello World example, platform matrix, and task guides |
| People | Researchers, educators, security teams, range engineers, developers, deployment owners, and authorized support users |
| Process | Define, validate, transform, and operate, supported by generation and deployment guides |
| Physical evidence | Scenario source, intermediary output, generated deployment files, runtime output, and documented platform coverage |

## Documentation implementation

The business perspective is implemented through progressive disclosure:

| Reader stage | Documentation role |
| --- | --- |
| Awareness | Homepage states the category, problem, value, audiences, and supported targets |
| Understanding | What is CRADLE? explains the language concepts and product boundaries |
| Consideration | Why CRADLE? connects documented capabilities to user value and inspectable evidence |
| Evaluation | Quick start, Hello World, and Supported platforms demonstrate the current workflow and coverage |
| Use | Task-oriented user guides explain authoring, generation, deployment, output, cleanup, and troubleshooting |
| Reference | Language, heuristic, intermediary-language, and schema pages retain technical detail |

SWOT, PESTLE, and the marketing mix remain on this strategy page rather than
interrupting task-oriented technical instructions.

## Evaluation questions

The current documentation does not report marketing-performance measurements.
The following questions can guide later evaluation without being presented as
current results:

1. Can readers identify CRADLE as Cyber Experimentation As Code?
2. Can readers explain what the static environment description contains?
3. Do readers understand the problem CRADLE addresses?
4. Can readers distinguish scenario description from provider operation?
5. Can authorized users complete the Hello World workflow?
6. Can readers identify generation and execution coverage for each target?
7. Which documented audience reports the strongest need for the approach?
8. Where do users stop or seek help during evaluation?

Answers to these questions can support later audience prioritization,
positioning refinement, and completion of the currently unsupported SWOT and
PESTLE categories.
