

# **Project TerraWatt: A Global Index for Datacenter Sustainability and Accountability**

## **Introduction: Engineering the Global Datacenter Index**

### **Framing the Mission**

The global data center industry, the invisible engine of the digital economy, has reached a critical inflection point. Its exponential growth, now accelerated by the unprecedented demands of artificial intelligence (AI), has created a direct conflict with fundamental planetary limits, particularly the availability of clean energy and fresh water.1 The central challenge, as articulated in "The Digital Dilemma: A Global Data Center Sustainability Scorecard," is the urgent need for a "new compact of transparency, accountability, and shared responsibility" to navigate this collision course.1

This document presents the complete technical blueprint for **Project TerraWatt**, an open-source software system designed to be the engineering response to this challenge. This project transcends a simple mapping exercise. It is a mission-driven endeavor to create a living, queryable, and extensible global index of datacenters. Its primary purpose is to operationalize the rigorous sustainability and impact metrics outlined in the "Digital Dilemma" report, moving beyond opaque corporate narratives to provide verifiable, site-specific, and regionally-contextualized data for all stakeholders: operators, policymakers, investors, and communities.

### **Core Objective and Guiding Principles**

The core objective of Project TerraWatt is to build a platform that systematically exposes the "say-do" gap between corporate sustainability pledges and the on-the-ground impacts of their operations. The system's architecture is founded on a guiding principle derived directly from the analysis in 1: the defining challenge for the industry has shifted from isolated, facility-level efficiency metrics like Power Usage Effectiveness (PUE) to a holistic assessment of the cumulative impact on regional carrying capacity and the social license to operate.

Every architectural decision detailed herein is weighed against its ability to foster radical transparency and hold stakeholders accountable. The system is not merely a passive repository of data; it is an active tool for critical analysis. The data model is designed to treat conflicting information and data provenance as first-class citizens. The user interface will be engineered not just to present data, but to juxtapose claims with reality. For example, a company's "100% renewable" claim will be displayed alongside the actual location-based carbon intensity of the grid it relies on, the quality of its renewable energy procurement (high-impact Power Purchase Agreements vs. low-impact unbundled Renewable Energy Certificates), and documented community impacts.1 By making these connections explicit, Project TerraWatt aims to become the definitive, open-source platform for the new compact of accountability the digital world so urgently needs.

## **Part I: Data Architecture \- The Foundation of the Index**

### **Section 1.1: The Unified Datacenter Data Model**

The foundation of Project TerraWatt is a sophisticated data model designed to capture the multi-layered, multi-scalar, and often contentious nature of datacenter sustainability. The schema, to be implemented in PostgreSQL, translates the analytical framework of "The Digital Dilemma" 1 into a concrete, relational structure. Its design prioritizes the ability to store and query not a single version of the truth, but a complete, auditable record of all available information, including conflicting reports from different sources. This approach is fundamental to exposing the "Transparency Hierarchy" and "say-do" gaps identified in the research.1 A system that erases this nuance by storing only one "true" value per metric would fail its core mission. By making data provenance a central feature, the platform enables users to perform critical analysis on the data itself.

#### **Core Entities and Relationships**

The database schema is composed of several core entities that model the industry from the highest corporate level down to specific operational metrics and qualitative local impacts.

* **Corporation**: Represents the parent company (e.g., Amazon.com, Inc., Alphabet Inc., Microsoft Corp.). This entity stores high-level, company-wide commitments and data, such as global net-zero target years, Science Based Targets initiative (SBTi) validation status, and links to public filings and lobbying disclosures which often reveal contradictions between public pledges and political actions.  
* **Operating\_Entity**: Represents the specific business unit that operates datacenters (e.g., Amazon Web Services, Google Cloud, Equinix). This entity is linked to a parent Corporation and holds segment-specific data, such as cloud market share 2 or unit-specific sustainability initiatives like Microsoft's use of mass-timber construction.1  
* **Geographic\_Region**: A defined area of significant datacenter concentration (e.g., "Northern Virginia, USA," "Dublin, Ireland," "Singapore"). This entity is the cornerstone of the system's ability to model the paradigm shift from facility efficiency to regional impact.1 It will store data on regional grid carbon intensity, water stress levels (based on established hydrological models), and the local regulatory environment, such as the moratoriums in Dublin and Singapore.3  
* **Datacenter\_Facility**: The core physical asset. This entity stores the canonical information for each individual datacenter, including its name, operator, precise geographic location (latitude/longitude), address, operational status (live, in development, decommissioned), and key physical specifications like known power capacity (MW) and size. This data will be aggregated from numerous public sources.5 Each facility is linked to one  
  Operating\_Entity and one Geographic\_Region.  
* **Metric\_Definition**: A table that defines every quantitative metric the system tracks (e.g., 'PUE', 'WUE', 'Scope 1 GHG Emissions', '24/7 CFE Score'). This provides a centralized dictionary of terms.  
* **Metric\_Observation**: A time-series table that is central to the system's mission. It stores specific, dated values for metrics. Crucially, it links to a Metric\_Definition, a DataSource, and the entity it describes (e.g., a Datacenter\_Facility or Corporation). This structure allows for storing multiple, potentially conflicting observations of the same metric from different sources, making the "say-do" gap queryable.  
* **Qualitative\_Finding**: A table designed to store unstructured or semi-structured information extracted from narrative sources. This is where summaries of community opposition from news articles 10, analyses of renewable energy procurement quality 1, or details on circular economy programs will be stored. Each finding is dated and linked to its source and the relevant facility or company.  
* **DataSource**: A comprehensive catalog of every source of information ingested into the system. This includes corporate sustainability reports 1, SEC filings, news articles 10, government records 12, web directories 6, and community group websites. This table provides a complete, transparent audit trail for every piece of data in the index.

#### **Proposed Unified Datacenter Schema**

The following table provides a high-level overview of the proposed relational schema, detailing the purpose and key fields for the most critical entities.

| Table Name | Purpose | Key Columns | Relationships |
| :---- | :---- | :---- | :---- |
| corporations | Parent companies in the ecosystem. | id, name, stock\_ticker, net\_zero\_target\_year, sbti\_validated | One-to-many with operating\_entities. |
| operating\_entities | Business units operating datacenters. | id, name, corporation\_id, entity\_type (Hyperscaler, Colocation, etc.) | Many-to-one with corporations. One-to-many with datacenter\_facilities. |
| geographic\_regions | Key datacenter hotspots. | id, name, country, grid\_carbon\_intensity, water\_stress\_level, regulatory\_notes | One-to-many with datacenter\_facilities. |
| datacenter\_facilities | Individual datacenter sites. | id, name, operating\_entity\_id, region\_id, address, location (PostGIS Point), status, power\_capacity\_mw | Many-to-one with operating\_entities and geographic\_regions. |
| data\_sources | Catalog of all information sources. | id, name, source\_type (PDF, Web, API), url, publication\_date | One-to-many with metric\_observations and qualitative\_findings. |
| metric\_observations | Time-series data for quantitative metrics. | id, facility\_id (or corp\_id), metric\_name, value, unit, observation\_date, source\_id | Many-to-one with datacenter\_facilities and data\_sources. |
| qualitative\_findings | Sourced, unstructured analysis and facts. | id, facility\_id (or corp\_id), finding\_text, category (Community, Grid, Water), finding\_date, source\_id | Many-to-one with datacenter\_facilities and data\_sources. |

### **Section 1.2: The Ingestion Engine \- Sourcing and Processing Global Data**

The credibility of Project TerraWatt hinges on the quality and breadth of its data. The ingestion engine is therefore designed as a robust, scalable, and semi-automated system for sourcing and processing information from a wide array of heterogeneous sources. The architecture adheres to modern data pipeline best practices, including modularity, idempotency (ensuring repeated ingestion runs don't create duplicate data), fault tolerance, and comprehensive monitoring.4

The core challenge is that much of the most valuable data is not available in clean, structured formats. It is often buried within narrative PDF reports, press releases, and news articles.1 A purely automated ETL (Extract, Transform, Load) approach is therefore insufficient.15 The system must be designed as a collaborative tool that empowers human curators to validate and contextualize machine-extracted data. The ingestion process is thus better described as a curation workflow than a simple ETL job.

#### **A Modular "Adapter" and Human-in-the-Loop (HITL) Architecture**

The ingestion engine will be built around a central orchestration service and a series of source-specific "adapters."

1. **Orchestration**: A dedicated data workflow orchestration tool, such as Dagster or Prefect, will manage the entire ingestion process.14 This tool will schedule regular checks for new data, trigger the appropriate adapters, manage dependencies between steps, handle failures and retries, and provide a central dashboard for monitoring the health of all data pipelines.  
2. **Modular Adapters**: For each distinct type of data source, a dedicated, versioned Python adapter module will be developed. This modularity is essential for maintainability and extensibility.  
   * **PDF Report Adapter**: This adapter is critical for processing sources like "The Digital Dilemma" 1 and corporate sustainability reports. It will employ a suite of Python libraries to deconstruct the documents:  
     PyMuPDF (Fitz) for its high-fidelity raw text and image extraction 17;  
     Camelot and tabula-py for their specialized ability to parse structured tables into dataframes 17; and potentially an Optical Character Recognition (OCR) tool like  
     Pytesseract for any scanned or image-based portions of the documents.19  
   * **Web Scraper Adapter**: This adapter will be responsible for extracting data from HTML web pages, such as commercial datacenter directories (datacentermap.com, datacenters.com) 6 and the official location pages of cloud providers.5 It will use libraries like  
     BeautifulSoup for HTML parsing and httpx for making robust, asynchronous HTTP requests.  
   * **Structured Data Adapter**: This will be the simplest adapter, designed to parse well-defined, machine-readable formats like CSVs, JSON, or GeoJSON files found in public repositories on platforms like GitHub.20  
3. **Human-in-the-Loop (HITL) Validation Workflow**: Recognizing that automated extraction of nuanced, qualitative information is error-prone, the pipeline culminates in a mandatory human review step. This is the only way to ensure the level of data veracity the project requires.  
   * **Fetch**: An automated job, managed by the orchestrator, downloads the source material (e.g., a new sustainability report PDF).  
   * **Extract & Propose**: The relevant adapter processes the source file and generates "proposed" records mapped to the database schema. For instance, it might identify a table of GHG emissions in a PDF and propose a set of new Metric\_Observation records. For narrative text, it might identify keywords like "community opposition" and propose a Qualitative\_Finding record containing the relevant paragraph.  
   * **Review Queue**: These proposed records are not committed directly. Instead, they are inserted into a dedicated "review" table and surfaced in a curation queue, accessible via a secure, internal web application.  
   * **Curate & Approve**: A human data curator reviews each proposed record. They compare the extracted data against the original source document (which is displayed alongside), correct any parsing errors, add necessary context or categorization, and finally approve the record for promotion to the public database.  
   * **Commit**: Once approved, the records are moved from the review table to the main production tables, making them visible through the public API and frontend.

#### **Data Source and Ingestion Strategy Matrix**

The following table outlines an initial list of data sources and the specific technical strategy for ingesting them, guiding the development of the adapter modules.

| Source Name | Source Type | Key Data Points | Adapter Module | Extraction Libraries | Automation Level |
| :---- | :---- | :---- | :---- | :---- | :---- |
| The Digital Dilemma 1 | PDF Report | Scorecard metrics, Regional impacts, Qualitative analysis | PDFReportAdapter\_v1 | PyMuPDF, Camelot | HITL Required |
| Corporate Sustainability Reports (e.g., Microsoft, Google) 1 | PDF Report | GHG Emissions (Scopes 1-3), PUE, WUE, Circularity stats | PDFReportAdapter\_v1 | PyMuPDF, Camelot | HITL Required |
| DatacenterMap.com 7 | Web HTML | Facility locations, Operators, Addresses | WebScraperAdapter\_v1 | BeautifulSoup, httpx | Fully Automated |
| Cloud Provider Location Pages (e.g., Google, AWS) 5 | Web HTML/JSON | Region names, Facility locations, Status (live/planned) | WebScraperAdapter\_v2 | BeautifulSoup, httpx | Fully Automated |
| IPCat Datacenters.csv 20 | CSV (GitHub) | IP Ranges, Operator Names | StructuredDataAdapter\_v1 | pandas | Fully Automated |
| Local News Archives (e.g., for Northern Virginia) 10 | Web HTML | Reports on community opposition, zoning battles, grid strain | WebScraperAdapter\_v3 | BeautifulSoup, httpx | HITL Required |
| Regulatory Filings (e.g., EirGrid reports) 3 | PDF/Web | Grid connection moratoria, energy consumption statistics | PDFReportAdapter\_v1 | PyMuPDF | HITL Required |

## **Part II: System Architecture \- The Technical Blueprint**

### **Section 2.1: The Monorepo Strategy**

To manage the complexity of a system comprising multiple applications, services, and shared libraries, Project TerraWatt will adopt a monorepo structure. This approach consolidates the entire codebase into a single Git repository, which enhances collaboration, simplifies dependency management, and enables unified build and test pipelines.22 The structure and tooling are chosen to create a scalable, reproducible, and highly efficient development environment based on modern best practices.12

#### **Directory Structure**

The monorepo will be organized into top-level directories with clear responsibilities, promoting a logical separation of concerns.

/  
├── apps/  
│   ├── api/          \# Public-facing FastAPI service  
│   ├── web/          \# SvelteKit frontend application  
│   └── curation/     \# Internal HITL review/curation web application  
│  
├── services/  
│   ├── ingestion-orchestrator/ \# Dagster/Prefect service for workflows  
│   └── ingestion-adapters/     \# Collection of Python data source adapters  
│  
├── libs/  
│   ├── datamodel/    \# Shared SQLAlchemy models and Pydantic schemas  
│   └── common/       \# Shared utilities, constants, etc.  
│  
├── docs/             \# Centralized documentation (MkDocs)  
│   └── ARCHITECTURE.md  
│  
├──.github/          \# GitHub-specific files (e.g., CI workflows)  
├── Earthfile         \# Central Earthly build file  
└── pyproject.toml    \# Root project configuration for \`uv\`

#### **Tooling Selection and Rationale**

The choice of tooling is critical for mitigating the common challenges of Python monorepos, such as dependency conflicts and inconsistent build environments.10

* **Dependency and Workspace Management: uv**  
  * uv, an extremely fast Python package installer and resolver from Astral, will be used for all dependency management. Its native support for "workspaces" is a key feature for monorepos, allowing dependencies for different projects (e.g., api, web) to be defined in their respective pyproject.toml files while being managed from the repository root.3 This provides a more modern, performant, and integrated solution compared to managing multiple separate  
    requirements.txt or poetry.lock files.12  
* **Build System: Earthly**  
  * All build, test, linting, and containerization tasks will be defined as targets within a single root Earthfile.22 Earthly functions like a combination of a Makefile and Dockerfile, creating containerized, reproducible, and cacheable builds. This is a significant advantage over simple script runners, as it ensures that the entire build environment, including system-level dependencies (like the Java runtime required by  
    tabula-py 17), is explicitly defined and consistent across developer machines and CI/CD runners. This combination of  
    uv for Python dependencies and Earthly for the entire build environment creates a state-of-the-art, hermetic build system that eliminates "works on my machine" issues and dramatically improves developer velocity and CI reliability.  
* **Testing and CI/CD**  
  * pytest will be the standard framework for all Python testing.23  
  * GitHub Actions will serve as the CI/CD platform. Workflows will be configured to execute Earthly targets. Earthly's build caching, combined with path-based triggers in GitHub Actions, will ensure that tests are only run for the components of the monorepo that have actually changed, optimizing CI run times.

### **Section 2.2: Backend Architecture \- The FastAPI Core**

The backend architecture is designed as a set of distinct, service-oriented components, promoting separation of concerns, scalability, and maintainability.

#### **Framework Choice: FastAPI**

FastAPI is the definitive choice for the backend framework. The system's primary requirements—a high-performance, asynchronous API to serve a data-rich frontend, and I/O-bound data ingestion tasks—align perfectly with FastAPI's design philosophy and capabilities.

* **Performance and Asynchronicity**: Built on the ASGI server Uvicorn and the Starlette toolkit, FastAPI offers native async/await support. This provides a significant performance advantage for handling concurrent network requests (like API calls and web scraping) compared to traditional WSGI-based frameworks such as Django.25  
* **Data Validation and Documentation**: FastAPI's integration with Pydantic is a killer feature. By using standard Python type hints to define data models, the framework automatically provides robust data validation for all incoming requests and generates OpenAPI-compliant JSON schemas. This, in turn, powers automatically generated, interactive API documentation (via Swagger UI and ReDoc).25 This feature drastically accelerates development, improves data integrity, and simplifies frontend-backend integration.  
* **Flexibility**: While Django is a powerful "batteries-included" framework, its opinionated structure and built-in ORM can be restrictive when a more tailored approach is needed.11 FastAPI's micro-framework nature provides the flexibility to choose the best libraries for each job (e.g., SQLAlchemy for database access, Dagster for orchestration) without imposing a monolithic structure.28 For a project with a custom curation UI and complex, asynchronous ingestion pipelines, this flexibility is paramount.

#### **Service Components**

* **Public API (/apps/api)**: This is the primary, public-facing FastAPI application. It will expose a versioned set of RESTful endpoints (e.g., /api/v1/facilities, /api/v1/regions/{id}/impacts) for querying all curated data in the index. The API will be designed to be stateless, allowing for easy horizontal scaling behind a load balancer.  
* **Curation API & UI (/apps/curation)**: This is a separate, self-contained application bundle. It consists of a small, protected FastAPI backend that provides endpoints specifically for the Human-in-the-Loop review process (e.g., fetching items from the review queue, approving/rejecting proposals). This is coupled with a dedicated SvelteKit frontend to create the internal Curation Tool. Keeping this logic entirely separate from the public API enhances security and maintainability.  
* **Ingestion Orchestrator (/services/ingestion-orchestrator)**: This service will be built using a dedicated data workflow orchestration framework like Dagster or Prefect. It is responsible for scheduling, executing, and monitoring the complex, multi-step ingestion pipelines defined by the adapters. This is a more robust and observable solution for managing data workflows than using a simple background task queue like Celery, as it provides features like a UI for visualizing DAGs, run history, and data lineage.14

### **Section 2.3: Frontend Architecture \- The SvelteKit Visualization Layer**

The user-facing web application is the primary vehicle for communicating the project's findings. It must be highly interactive, visually compelling, and exceptionally performant.

#### **Framework Choice: SvelteKit**

SvelteKit is the chosen framework for the frontend application. The decision is driven by the application's core requirement: delivering a high-performance data visualization and mapping experience.

* **Performance**: Unlike React and Vue, which use a Virtual DOM and ship a runtime library to the browser to calculate changes, Svelte is a compiler.29 It processes code at build time, generating highly optimized, imperative vanilla JavaScript that directly manipulates the DOM. This results in significantly smaller bundle sizes and faster initial load times and updates.30 For a map-centric application with potentially thousands of data points and real-time filtering, this "zero-overhead" runtime performance is a decisive advantage.  
* **Developer Experience**: Svelte's syntax is closer to plain HTML, CSS, and JavaScript, resulting in less boilerplate code and a gentler learning curve.29 Its built-in reactivity system is simple and elegant, managed through assignments rather than hooks or complex APIs, which can lead to faster development cycles.33  
* **Ecosystem**: While React's ecosystem is larger, the key libraries required for this project—interactive mapping libraries (Leaflet 34,  
  MapLibre) and data visualization libraries (D3.js)—are framework-agnostic and can be easily integrated into a SvelteKit application. SvelteKit itself is a "batteries-included" application framework that provides essential features like file-system-based routing, server-side rendering (SSR), and code-splitting out of the box.29

#### **Key UI Components**

* **Global Map View**: The application's landing page will feature a full-screen interactive map built with a library like Leaflet or MapLibre. It will display all datacenter facilities from the database. To handle the large number of points, marker clustering will be implemented to ensure smooth performance during zoom and pan operations.34  
* **Analytics and Filtering Panel**: A persistent sidebar will provide users with powerful tools to explore the data. This will include multi-select filters for operators, geographic regions, and key sustainability metrics (e.g., "Show only facilities with WUE \< 0.5 L/kWh"). It will also display aggregate charts and statistics that update dynamically as filters are applied.  
* **Datacenter Profile Page**: Clicking on a datacenter on the map will navigate to a detailed profile page. This page is central to the project's mission. It will display all associated structured metrics (Metric\_Observation) and qualitative findings (Qualitative\_Finding), with each data point clearly attributed to its DataSource. The design will explicitly juxtapose conflicting data points—for example, showing a company's self-reported PUE next to an estimate from an independent analysis.  
* **Comparison View**: A dedicated tool will allow users to select multiple companies or facilities (e.g., AWS vs. Microsoft vs. Google) and view their sustainability scorecards in a side-by-side tabular format, directly operationalizing the comparative analysis presented in the "Digital Dilemma" report.1

### **Section 2.4: Data Persistence and Querying Strategy**

To efficiently handle the system's diverse data types and query patterns, a hybrid storage solution is required. No single database is optimal for both structured relational data and unstructured full-text search.

#### **Primary Datastore: PostgreSQL with PostGIS**

The authoritative source of truth for all structured data will be a PostgreSQL database.

* **Rationale**: PostgreSQL is a world-class, open-source, and highly reliable relational database management system (RDBMS). The core data model is inherently relational, with clear relationships between corporations, facilities, and metrics. The crucial addition is the PostGIS extension, which provides mature and powerful support for geographic data types (GEOMETRY, GEOGRAPHY) and a rich set of spatial functions. This is essential for the map interface, enabling efficient queries like "find all datacenter facilities within the currently visible map bounds" or "find all facilities within 50km of a water-stressed region."

#### **Search and Unstructured Data: Elasticsearch**

To enable powerful search capabilities over the narrative content of ingested documents, Elasticsearch will be used as a secondary index.

* **Rationale**: Users must be able to search for qualitative information that is not captured in structured fields, such as "community opposition over noise pollution" or "innovations in recycled water usage".1 Standard SQL  
  LIKE queries are grossly inefficient and ineffective for this type of full-text search. Elasticsearch is a dedicated search and analytics engine built on Apache Lucene, designed specifically for indexing and searching large volumes of text data with high performance, advanced text analysis (stemming, tokenization), and relevance-ranked results.

#### **Data Flow and Synchronization**

The two systems will work in tandem. During the ingestion workflow, when a new data source is curated and approved, the backend service will perform two actions concurrently:

1. The structured data (e.g., Datacenter\_Facility record, Metric\_Observation records) will be written to the PostgreSQL database via SQLAlchemy.  
2. The full, raw text content of the source document (e.g., the entire text of a PDF report) will be sent to an Elasticsearch indexing pipeline. The Elasticsearch document will be enriched with the primary key of the corresponding DataSource record in PostgreSQL.

When a user performs a search in the frontend, the query hits a dedicated /search endpoint in the API. This endpoint queries Elasticsearch. The search results from Elasticsearch will contain the DataSource ID, which the API then uses to fetch the full, structured records from PostgreSQL to return to the client. This pattern leverages the strengths of both technologies without data duplication.

## **Part III: Implementation Roadmap \- From Plan to Product**

### **Section 3.1: ARCHITECTURE.md**

# **Project TerraWatt: System Architecture**

This document outlines the official system architecture for Project TerraWatt, a global index for datacenter sustainability and accountability. It serves as the canonical reference for all technical components, design principles, and technology choices.

## **1\. Introduction**

### **1.1. Project Mission**

Project TerraWatt is an open-source software system designed to create a living, queryable, and extensible global index of datacenters. Its mission is to operationalize the analytical framework of reports like "The Digital Dilemma" 1 by providing verifiable, site-specific, and regionally-contextualized data on the sustainability and community impact of the digital infrastructure that underpins the global economy.

### **1.2. Guiding Principles**

* **Transparency First**: The system must be designed to expose and juxtapose conflicting data from different sources, making the "say-do" gap between corporate claims and on-the-ground reality a queryable feature.  
* **Design for Verifiability**: Every piece of data in the index must be traceable to a public, citable source. Data provenance is a first-class citizen of the data model.  
* **Focus on Regional Impact**: The architecture must support the analysis of cumulative impacts (energy, water, land use) at a regional level, moving beyond isolated facility-level metrics.  
* **Performance is a Feature**: The user-facing application must be exceptionally fast and responsive to encourage exploration and analysis.

## **2\. High-Level Architecture**

The system is composed of four primary logical blocks: a **Frontend Application**, a **Backend API**, an **Ingestion Service**, and a **Persistence Layer**.

\!

## **3\. Data Architecture**

### **3.1. Unified Datacenter Data Model**

The data is modeled in a relational schema implemented in PostgreSQL. The core entities are Corporation, Operating\_Entity, Geographic\_Region, Datacenter\_Facility, DataSource, Metric\_Observation, and Qualitative\_Finding. This model is designed to capture data at multiple scales and to explicitly store conflicting observations from different sources to highlight transparency gaps.

### **3.2. Ingestion Engine**

Data is sourced via a semi-automated ingestion pipeline managed by a workflow orchestrator (e.g., Dagster).

* **Modular Adapters**: Source-specific Python adapters are used to fetch and parse data from PDFs, web pages, and APIs.  
* **Human-in-the-Loop (HITL)**: All extracted data, especially from unstructured sources, is placed in a review queue. A human curator must validate and approve the data against its original source before it is published to the main database. This ensures data veracity.

## **4\. Backend Architecture**

### **4.1. Framework: FastAPI**

The backend is built using the FastAPI framework due to its high performance with native async support, Pydantic-based data validation, and automatic OpenAPI documentation generation.

### **4.2. Components**

* **Public API (/apps/api)**: A stateless, scalable RESTful API providing public access to all curated data.  
* **Curation Service (/apps/curation)**: A separate, internally-facing application (API \+ UI) for the HITL review workflow.  
* **Ingestion Orchestrator (/services/ingestion-orchestrator)**: A Dagster/Prefect service that schedules and monitors all ingestion workflows.

## **5\. Frontend Architecture**

### **5.1. Framework: SvelteKit**

The frontend is built with SvelteKit. As a compiler, Svelte provides superior performance (smaller bundles, no V-DOM overhead) which is critical for the application's highly interactive map and data visualization components.

### **5.2. Key Components**

* **Global Interactive Map**: A Leaflet/MapLibre map with marker clustering.  
* **Filtering & Analytics Panel**: Dynamic filtering and charting of the dataset.  
* **Datacenter Profile Page**: A detailed view of a single facility, designed to juxtapose all available data points and their sources.  
* **Comparison View**: A side-by-side comparison tool for multiple facilities or companies.

## **6\. Technology Stack**

| Component | Technology | Rationale |
| :---- | :---- | :---- |
| **Monorepo Tooling** | uv, Earthly | High-performance dependency management and reproducible, containerized builds. |
| **Backend Framework** | FastAPI | Performance, async support, auto-validation, and documentation. |
| **Frontend Framework** | SvelteKit | Performance (compiler-based), developer experience, ideal for data visualization. |
| **Data Orchestration** | Dagster or Prefect | Robust, observable workflow management for complex ingestion pipelines. |
| **Primary Datastore** | PostgreSQL \+ PostGIS | World-class RDBMS with powerful geospatial capabilities. |
| **Search Index** | Elasticsearch | High-performance full-text search and analysis. |
| **CI/CD** | GitHub Actions | Native integration with the GitHub repository. |
| **Containerization** | Docker | Standard for containerizing applications for development and deployment. |

## **7\. Development & Operations**

### **7.1. Monorepo Strategy**

The project uses a monorepo to unify code, tooling, and CI/CD. The structure is divided into /apps, /services, /libs, and /docs.

### **7.2. CI/CD Pipeline**

A GitHub Actions workflow is triggered on every pull request. It uses Earthly to lint, test, and build only the affected components of the monorepo, leveraging caching to ensure fast feedback loops. Merges to the main branch trigger a deployment workflow.

### **7.3. Deployment**

All applications (api, web, curation) and services are containerized using Docker. Deployment will be orchestrated via a platform like Kubernetes or a simpler PaaS, depending on initial scale. A docker-compose.yml file is provided for easy local development setup.

### **Section 3.2: The Codex Implementation Plan**

This section provides a sequenced, actionable list of fewer than 100 change requests in Codex format. This plan is designed to be executed in order, taking the project from an empty repository to a functional v1.0.

#### **Phase 0: Foundation & Scaffolding (Tasks 1-10)**

1. \[ \] chore(repo): initialize git repository and create monorepo directory structure (/apps, /libs, /services, /docs)  
2. \[ \] feat(tooling): configure uv workspace in root pyproject.toml and add initial dev dependencies (pytest, ruff)  
3. \[ \] feat(tooling): create initial Earthfile with lint (ruff) and format (black, ruff) targets  
4. \[ \] ci(github): set up initial GitHub Actions workflow to run the Earthly \+lint-check target on pull requests  
5. \[ \] docs(project): create initial README.md and commit the ARCHITECTURE.md document to /docs  
6. \[ \] feat(tooling): add MkDocs to the project for documentation generation from the /docs folder  
7. \[ \] chore(deps): add SQLAlchemy, Alembic, and psycopg2 to a shared library configuration  
8. \[ \] feat(ops): create a root docker-compose.yml for spinning up development services (postgres, elasticsearch)  
9. \[ \] feat(ops): create a base Dockerfile for Python applications using a multi-stage build  
10. \[ \] feat(tooling): configure pre-commit hooks to run formatters automatically

#### **Phase 1: Core Data Model & API (Tasks 11-25)**

11. \[ \] feat(datamodel): implement SQLAlchemy models for Corporation, Operating\_Entity, Geographic\_Region in /libs/datamodel  
12. \[ \] feat(datamodel): implement SQLAlchemy model for Datacenter\_Facility with PostGIS Point type in /libs/datamodel  
13. \[ \] feat(db): configure Alembic in the API app and generate initial migration for core models  
14. \[ \] feat(api): scaffold FastAPI application in /apps/api with a basic health check endpoint  
15. \[ \] feat(api): create Pydantic schemas for all core data models for use in API endpoints  
16. \[ \] feat(api): implement GET endpoint /api/v1/facilities to list all datacenters  
17. \[ \] feat(api): implement GET endpoint /api/v1/facilities/{id} to retrieve a single datacenter  
18. \[ \] feat(api): implement POST endpoint /api/v1/facilities for creating new datacenters (for internal use)  
19. \[ \] test(api): write unit tests for the /facilities endpoints using FastAPI's TestClient  
20. \[ \] feat(api): integrate SQLAlchemy session management into FastAPI using dependencies  
21. \[ \] feat(datamodel): implement SQLAlchemy models for DataSource, Metric\_Observation, and Qualitative\_Finding  
22. \[ \] feat(db): generate new Alembic migration for sustainability and provenance models  
23. \[ \] feat(api): add database connection logic to docker-compose setup for the API service  
24. \[ \] docs(api): verify auto-generated Swagger UI and ReDoc documentation is functional  
25. \[ \] chore(tooling): add Earthly target \+test-api to run pytest for the API app

#### **Phase 2: Basic Frontend Visualization (Tasks 26-40)**

26. \[ \] feat(web): scaffold SvelteKit application in /apps/web using npm create svelte@latest\`\`  
27. \[ \] feat(web): install Leaflet.js and add a basic, non-interactive world map component  
28. \[ \] feat(web): create a data service in SvelteKit to fetch from the /api/v1/facilities endpoint  
29. \[ \] feat(web): render fetched datacenter locations as simple markers on the Leaflet map  
30. \[ \] feat(web): implement marker clustering on the map using a Leaflet plugin to handle large numbers of points  
31. \[ \] feat(web): make map markers clickable, showing a simple popup with the datacenter name  
32. \[ \] style(web): add basic layout and styling to the main map page  
33. \[ \] chore(tooling): add Earthly target \+build-web to build the SvelteKit application  
34. \[ \] feat(ops): add the web application to docker-compose using a Node.js base image  
35. \[ \] feat(web): implement a basic sidebar component for future filters  
36. \[ \] feat(web): add a loading state indicator while data is being fetched from the API  
37. \[ \] refactor(web): structure SvelteKit components into logical folders (e.g., /components/map, /components/ui)  
38. \[ \] feat(web): set up basic end-to-end tests for the web app using Playwright  
39. \[ \] chore(tooling): add Earthly target \+test-web to run Playwright tests  
40. \[ \] ci(github): update CI workflow to run both \+test-apiand+test-web targets

#### **Phase 3: Initial Ingestion Pipeline (Tasks 41-55)**

41. \[ \] feat(ingestion): create a new package in /services/ingestion-adapters/structured\_csv\`\`  
42. \[ \] feat(ingestion): implement a Python script in the adapter to download and parse the datacentermap.com CSV data  
43. \[ \] feat(ingestion): implement logic to map CSV columns to the Datacenter\_Facility Pydantic schema  
44. \[ \] feat(ingestion): set up Dagster/Prefect project in /services/ingestion-orchestrator\`\`  
45. \[ \] feat(ingestion): create a simple Dagster/Prefect pipeline that runs the structured\_csv adapter script  
46. \[ \] feat(curation): scaffold a new SvelteKit app in /apps/curation for the HITL tool  
47. \[ \] feat(curation): create a protected FastAPI backend for the curation tool  
48. \[ \] feat(db): add a proposed\_records table to the database for the review queue  
49. \[ \] feat(ingestion): modify the ingestion pipeline to write proposed records to the proposed\_records table instead of directly to production  
50. \[ \] feat(curation): build a simple UI in the curation app to list all records from the proposed\_records table  
51. \[ \] feat(curation): implement "Approve" and "Reject" buttons that call the curation API to move/delete records  
52. \[ \] test(ingestion): write unit tests for the CSV parsing and mapping logic  
53. \[ \] feat(ops): add the ingestion orchestrator and curation app to the development docker-compose setup  
54. \[ \] docs(ingestion): write documentation for running the initial CSV ingestion pipeline  
55. \[ \] chore(data): perform a one-time run of the CSV pipeline to populate the database with initial locations

#### **Phase 4: Advanced Sustainability Ingestion (Tasks 56-70)**

56. \[ \] feat(ingestion): create a new adapter /services/ingestion-adapters/pdf\_report\`\`  
57. \[ \] feat(ingestion): add PyMuPDFandcamelot-py as dependencies for the PDF adapter  
58. \[ \] feat(ingestion): implement a function to extract all tables from a PDF using Camelot  
59. \[ \] feat(ingestion): write a specific parser for the scorecard tables in the "Digital Dilemma" report 1  
60. \[ \] feat(ingestion): map the extracted table data to Metric\_Observation records and submit to the curation queue  
61. \[ \] feat(ingestion): implement a function to extract raw text from PDF pages using PyMuPDF\`\`  
62. \[ \] feat(ingestion): implement a basic keyword search on the raw text to identify paragraphs related to qualitative findings (e.g., "community," "water")  
63. \[ \] feat(ingestion): map the identified text snippets to Qualitative\_Finding records and submit to the curation queue  
64. \[ \] feat(curation): enhance the curation UI to properly display and allow editing of Metric\_ObservationandQualitative\_Finding proposals  
65. \[ \] feat(api): create new endpoints to serve detailed sustainability data for facilities and corporations  
66. \[ \] test(ingestion): write tests for the PDF table and text extraction logic  
67. \[ \] chore(data): perform a one-time, curated ingestion of the "Digital Dilemma" report  
68. \[ \] refactor(ingestion): generalize the PDF adapter to handle different corporate sustainability report layouts  
69. \[ \] feat(ingestion): create a web scraping adapter to pull data from corporate sustainability web pages  
70. \[ \] feat(api): implement API endpoints to query data by region (e.g., /api/v1/regions/{id}/facilities)

#### **Phase 5: Advanced Frontend & Search (Tasks 71-85)**

71. \[ \] feat(search): add Elasticsearch client library to the API and configure connection in docker-compose  
72. \[ \] feat(ingestion): modify the ingestion pipeline to index the raw text of each DataSource in Elasticsearch  
73. \[ \] feat(api): implement a /api/v1/searchendpoint that queries Elasticsearch and returns a list of matchingDataSource IDs  
74. \[ \] feat(web): add a search bar to the main UI that calls the new search endpoint  
75. \[ \] feat(web): create the detailed DatacenterProfile page component in SvelteKit  
76. \[ \] feat(web): populate the profile page with all structured and qualitative data fetched from the API for a given facility  
77. \[ \] style(web): design the profile page to clearly distinguish between data sources and highlight conflicting data points  
78. \[ \] feat(web): implement the advanced filtering panel in the map view sidebar  
79. \[ \] feat(web): connect the filter state to the API calls to dynamically update the markers shown on the map  
80. \[ \] feat(web): create the ComparisonView component  
81. \[ \] feat(web): implement functionality to select multiple facilities/companies and display their key metrics in a side-by-side table  
82. \[ \] feat(web): add charts and graphs to the profile and comparison pages using a library like D3.js or Chart.js  
83. \[ \] refactor(api): optimize database queries for performance using selectinload and other SQLAlchemy techniques  
84. \[ \] test(web): add Playwright tests for the new profile, search, and comparison features  
85. \[ \] style(web): perform a full UX/UI design pass on the entire application for clarity and usability

#### **Phase 6: Deployment & Operations (Tasks 86-95)**

86. \[ \] feat(ops): create production-ready Dockerfiles for all applications, minimizing image size  
87. \[ \] feat(ops): write Kubernetes deployment manifests (or similar for another PaaS) for all services  
88. \[ \] feat(ops): implement structured logging (e.g., JSON format) in the FastAPI applications  
89. \[ \] feat(ops): add health check endpoints to all services for use by orchestrators  
90. \[ \] feat(ops): set up monitoring and alerting using a tool like Prometheus and Grafana  
91. \[ \] ci(github): create a release workflow that builds and pushes Docker images to a container registry on git tags  
92. \[ \] ci(github): create a deployment workflow that applies Kubernetes manifests on pushes to the main branch  
93. \[ \] docs(ops): create a comprehensive deployment and operations runbook  
94. \[ \] chore(security): perform a security review of all dependencies and application configurations  
95. \[ \] docs(project): finalize all user and developer documentation for a v1.0 release

## **Conclusion: A Vision for a Transparent Digital Infrastructure**

This report has provided a comprehensive engineering blueprint for Project TerraWatt. The proposed system is designed not merely to catalog the world's datacenters but to serve as a vital, open-source tool for accountability. By translating the critical analytical framework of "The Digital Dilemma" 1 into a living software platform, Project TerraWatt will empower researchers, policymakers, investors, and communities to scrutinize the profound environmental and social impacts of the infrastructure that underpins our modern world.

The implementation plan is ambitious yet pragmatic. It leverages a modern, high-performance, and flexible technology stack to build a platform that is both scalable and extensible from day one. The architecture's emphasis on data provenance, its ability to handle conflicting information, and its focus on regional impact analysis are its core technical strengths. The phased implementation roadmap provides a clear, step-by-step path from an empty repository to a powerful, feature-rich version 1.0.

The open-source nature of this project is fundamental to its mission. It invites a global community of developers, data scientists, researchers, and advocates to contribute to its growth—by adding new data sources, refining ingestion adapters, enhancing visualizations, and analyzing the data. This collaborative effort is essential to ensure that the index remains a living, evolving, and trusted resource in the critical decade ahead, providing the transparency necessary to guide the digital economy toward a truly sustainable future.

#### **Works cited**

1. The Digital Dilemma: A Global Data Center Sustainability Scorecard  
2. Open Source Index & Mapping Project, accessed on June 19, 2025, [https://www.openhealthnews.com/resources/open-source-index-mapping-project](https://www.openhealthnews.com/resources/open-source-index-mapping-project)  
3. Document best practices for a monorepo · Issue \#10960 · astral-sh/uv \- GitHub, accessed on June 19, 2025, [https://github.com/astral-sh/uv/issues/10960](https://github.com/astral-sh/uv/issues/10960)  
4. Data Pipeline Architecture: Key Components & Best Practices | Rivery, accessed on June 19, 2025, [https://rivery.io/data-learning-center/data-pipeline-architecture/](https://rivery.io/data-learning-center/data-pipeline-architecture/)  
5. Google Data Centers: Homepage, accessed on June 19, 2025, [https://datacenters.google/](https://datacenters.google/)  
6. Search Data Centers: Colocation, Bare Metal, Cloud, accessed on June 19, 2025, [https://www.datacenters.com/](https://www.datacenters.com/)  
7. Database \- Data Center Map, accessed on June 19, 2025, [https://www.datacentermap.com/datacenters/](https://www.datacentermap.com/datacenters/)  
8. Locations of Google Data Centers, accessed on June 19, 2025, [https://datacenters.google/locations](https://datacenters.google/locations)  
9. Cloud Infrastructure Map, accessed on June 19, 2025, [https://www.cloudinfrastructuremap.com/](https://www.cloudinfrastructuremap.com/)  
10. Monorepo approach to handle multiple projects \- Python discussion forum, accessed on June 19, 2025, [https://discuss.python.org/t/monorepo-approach-to-handle-multiple-projects/78349](https://discuss.python.org/t/monorepo-approach-to-handle-multiple-projects/78349)  
11. Why I still choose Django over Flask or FastAPI \- Loopwerk, accessed on June 19, 2025, [https://www.loopwerk.io/articles/2024/django-vs-flask-vs-fastapi/](https://www.loopwerk.io/articles/2024/django-vs-flask-vs-fastapi/)  
12. niqodea/python-monorepo \- GitHub, accessed on June 19, 2025, [https://github.com/niqodea/python-monorepo](https://github.com/niqodea/python-monorepo)  
13. 7 Data Ingestion Best Practices to Follow, accessed on June 19, 2025, [https://hevodata.com/learn/data-ingestion-best-practices/](https://hevodata.com/learn/data-ingestion-best-practices/)  
14. Data Pipeline Architecture Explained: 6 Diagrams And Best Practices \- Monte Carlo Data, accessed on June 19, 2025, [https://www.montecarlodata.com/blog-data-pipeline-architecture-explained/](https://www.montecarlodata.com/blog-data-pipeline-architecture-explained/)  
15. Data Pipeline Architecture: Diagrams, Best Practices, and Examples \- Airbyte, accessed on June 19, 2025, [https://airbyte.com/data-engineering-resources/data-pipeline-architecture](https://airbyte.com/data-engineering-resources/data-pipeline-architecture)  
16. What is a Data Pipeline? Definition, Best Practices, and Use Cases | Informatica, accessed on June 19, 2025, [https://www.informatica.com/resources/articles/data-pipeline.html.html.html.html](https://www.informatica.com/resources/articles/data-pipeline.html.html.html.html)  
17. A Guide to PDF Extraction Libraries in Python \- Metric Coders, accessed on June 19, 2025, [https://www.metriccoders.com/post/a-guide-to-pdf-extraction-libraries-in-python](https://www.metriccoders.com/post/a-guide-to-pdf-extraction-libraries-in-python)  
18. Python Libraries to Extract Tables From PDF: A Comparison \- Unstract, accessed on June 19, 2025, [https://unstract.com/blog/extract-tables-from-pdf-python/](https://unstract.com/blog/extract-tables-from-pdf-python/)  
19. How To Automate PDF Data Extraction \- 3 Different Methods To Parse PDFs For Analytics, accessed on June 19, 2025, [https://www.theseattledataguy.com/how-to-automate-pdf-data-extraction-3-different-methods-to-parse-pdfs-for-analytics/](https://www.theseattledataguy.com/how-to-automate-pdf-data-extraction-3-different-methods-to-parse-pdfs-for-analytics/)  
20. datacenters.csv \- client9/ipcat \- GitHub, accessed on June 19, 2025, [https://github.com/client9/ipcat/blob/master/datacenters.csv](https://github.com/client9/ipcat/blob/master/datacenters.csv)  
21. lwieske/cloud-datacenter-locations \- GitHub, accessed on June 19, 2025, [https://github.com/lwieske/cloud-datacenter-locations](https://github.com/lwieske/cloud-datacenter-locations)  
22. Building a Monorepo with Python \- Earthly Blog, accessed on June 19, 2025, [https://earthly.dev/blog/python-monorepo/](https://earthly.dev/blog/python-monorepo/)  
23. Python monorepos \- Graphite, accessed on June 19, 2025, [https://graphite.dev/guides/python-monorepos](https://graphite.dev/guides/python-monorepos)  
24. Cracking the Python Monorepo: build pipelines with uv and Dagger \- Reddit, accessed on June 19, 2025, [https://www.reddit.com/r/Python/comments/1iy4h5k/cracking\_the\_python\_monorepo\_build\_pipelines\_with/](https://www.reddit.com/r/Python/comments/1iy4h5k/cracking_the_python_monorepo_build_pipelines_with/)  
25. Django vs FastAPI: Choosing the Right Python Web Framework | Better Stack Community, accessed on June 19, 2025, [https://betterstack.com/community/guides/scaling-python/django-vs-fastapi/](https://betterstack.com/community/guides/scaling-python/django-vs-fastapi/)  
26. Which Is the Best Python Web Framework: Django, Flask, or FastAPI? | The PyCharm Blog, accessed on June 19, 2025, [https://blog.jetbrains.com/pycharm/2025/02/django-flask-fastapi/](https://blog.jetbrains.com/pycharm/2025/02/django-flask-fastapi/)  
27. In 2025, how much does it still make sense to go the Django way vs FastAPI ? Loo... | Hacker News, accessed on June 19, 2025, [https://news.ycombinator.com/item?id=43557087](https://news.ycombinator.com/item?id=43557087)  
28. Django REST vs FastAPI \- Oodles ERP, accessed on June 19, 2025, [https://erpsolutions.oodles.io/developer-blogs/Django-REST--vs-FastAPI/](https://erpsolutions.oodles.io/developer-blogs/Django-REST--vs-FastAPI/)  
29. Choosing Between React and Svelte: Selecting the Right JavaScript Library for 2024 \- Prismic, accessed on June 19, 2025, [https://prismic.io/blog/svelte-vs-react](https://prismic.io/blog/svelte-vs-react)  
30. Comparing front-end frameworks for startups in 2025: Svelte vs React vs Vue \- Merge Rocks, accessed on June 19, 2025, [https://merge.rocks/blog/comparing-front-end-frameworks-for-startups-in-2025-svelte-vs-react-vs-vue](https://merge.rocks/blog/comparing-front-end-frameworks-for-startups-in-2025-svelte-vs-react-vs-vue)  
31. Svelte vs React vs Vue: A Comprehensive Analysis\! | Front End Engineering, accessed on June 19, 2025, [https://www.frontendeng.dev/blog/16-react-svelte-vue-the-ultimate-comparison](https://www.frontendeng.dev/blog/16-react-svelte-vue-the-ultimate-comparison)  
32. React, Angular, Vue, and Svelte: A Comparison \- Ascendient Learning, accessed on June 19, 2025, [https://www.ascendientlearning.com/blog/comparing-angular-react-vue-svelte](https://www.ascendientlearning.com/blog/comparing-angular-react-vue-svelte)  
33. Why Choose Svelte Over Vue or React? : r/sveltejs \- Reddit, accessed on June 19, 2025, [https://www.reddit.com/r/sveltejs/comments/1jy4m01/why\_choose\_svelte\_over\_vue\_or\_react/](https://www.reddit.com/r/sveltejs/comments/1jy4m01/why_choose_svelte_over_vue_or_react/)  
34. Map showing data centers of all major cloud and hosting providers : r/devops \- Reddit, accessed on June 19, 2025, [https://www.reddit.com/r/devops/comments/1bij0hc/map\_showing\_data\_centers\_of\_all\_major\_cloud\_and/](https://www.reddit.com/r/devops/comments/1bij0hc/map_showing_data_centers_of_all_major_cloud_and/)