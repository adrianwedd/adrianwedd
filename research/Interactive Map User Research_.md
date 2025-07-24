

# **User Interaction Report for the Unified Dashboard Interactive Map**

Report ID: 05-UIR-01  
Prepared for: Project Manager, DesignSynth, CODEFORGE  
Date: 17 October 2025

## **Part 1: The User and the Task: Defining the Core Purpose of the Interactive Map**

An interactive map within a professional context is more than a geographic visualization; it is an engine for answering critical questions and supporting complex decisions. Its success is not measured by the volume of data it contains, but by its ability to provide clear, accurate, and timely answers to the specific queries of its users. This section establishes the foundational context for the Unified Dashboard's interactive map by defining its primary users and the essential questions they need to answer. This user-centric framework forms the basis for all subsequent design and feature recommendations, ensuring the final product is a purpose-built tool, not a generic data viewer.

### **1.1. User Personas: A Profile of the Unified Dashboard Map User**

Analysis of professional workflows in planning, environmental consulting, and infrastructure management reveals three distinct user archetypes whose goals and tasks will shape the design of the interactive map. These personas are synthesized from documented professional practices and the capabilities of existing government and commercial geospatial platforms.1

#### **Persona 1: Alana, the Urban Planner**

* **Role & Responsibilities:** Alana is a mid-career planner working for a state or local government authority. Her primary responsibilities include assessing development applications against statutory planning instruments, contributing to the development of long-term strategic metropolitan plans, and ensuring all land use and development activities comply with the relevant planning schemes.3 Her work is detail-oriented, legally grounded, and requires a comprehensive understanding of how various regulations apply to specific land parcels.  
* **Core Tasks:** On a daily basis, Alana's workflow involves interrogating the map to verify the specific zoning and overlay controls for a property. This includes identifying constraints such as heritage listings, bushfire-prone areas, landslip hazard zones, or environmental protection overlays, which are defined as "codes" within frameworks like the Tasmanian Planning Scheme.4 She must analyze the cumulative impact of these constraints on a proposed development, assess its potential effects on surrounding infrastructure, and prepare clear, evidence-based reports for internal review and public notification. Her work directly mirrors the use cases for state-level portals like the NSW Spatial Viewer and VicPlan, which are designed to provide access to this type of regulatory information.5  
* **Goals:** Alana's primary goal is efficiency and accuracy. She needs to be able to access all relevant planning controls for a single parcel of land quickly and with confidence in the data's authority. She must visualize how multiple data layers—such as zoning, land tenure, and environmental overlays—interact spatially. Ultimately, she needs to produce clear, defensible, and easily understood maps and reports that form the basis for legally binding decisions.  
* **Frustrations (Pain Points):** Alana's workflow is often hampered by the fragmented nature of geospatial data in Australia. She may need to consult multiple, disconnected government portals to assemble a complete picture of a single property, a challenge noted in academic reviews of Australian planning systems.3 The lack of interoperability and inconsistent data standards between jurisdictions or even between different government departments creates significant overhead. Furthermore, she often encounters tools that lack historical context, making it difficult to research the planning history of a site—a feature that more advanced systems like VicPlan are beginning to address with historical data sliders.7 The "division of labour" often seen in government, where planners are separated from dedicated GIS technicians, means Alana requires a tool that is powerful enough for analysis but does not demand the steep learning curve of a full-fledged GIS application.3

#### **Persona 2: Ben, the Environmental Consultant**

* **Role & Responsibilities:** Ben is an environmental consultant, typically contracted by developers or government agencies to conduct Environmental Impact Assessments (EIAs) for infrastructure or land development projects. His role is to identify, assess, and report on potential ecological, heritage, and contamination constraints that could affect a project's feasibility and approval pathway.  
* **Core Tasks:** Ben's work begins with a desktop assessment. He uses geospatial portals to conduct an initial "red flag" analysis, searching for known constraints like threatened species habitats, wetlands, recorded heritage sites, conservation areas, and bushfire risk zones.2 This initial map-based research informs the scope of necessary fieldwork. He then uses mobile GIS applications, such as ESRI FieldMaps or Survey123, to collect site-specific data.2 A crucial part of his workflow is integrating this collected field data with the authoritative government datasets he accessed initially. Finally, he must produce high-quality, technically accurate maps that are included in client reports and submitted to regulatory bodies as part of the approval process.  
* **Goals:** Ben's main goal is to conduct a thorough and efficient risk assessment. He needs to identify all potential environmental constraints on a site to prevent costly delays or legal challenges for his clients. A key requirement is the ability to seamlessly integrate his project-specific data with authoritative government layers to create a comprehensive analytical view. The ultimate output must be legally defensible, clearly communicating his findings through professional-grade maps.  
* **Frustrations (Pain Points):** A major frustration for Ben is the inability to easily export data from government portals into his preferred professional GIS software, such as ArcGIS or QGIS.2 Many portals offer data only for viewing or as static PDFs, which prevents him from performing the more advanced spatial analysis his job requires. He is often forced to consult numerous siloed environmental databases—for example, separate portals for flora and fauna records, water data, and heritage information—to gather all necessary information, a problem that consolidated data hubs in South Australia aim to solve.8

#### **Persona 3: Chloe, the Infrastructure Project Manager**

* **Role & Responsibilities:** Chloe is a project manager at a large engineering or construction firm, such as AECOM.9 She oversees the entire lifecycle of major infrastructure projects, from initial site selection and feasibility through to construction and delivery. Her projects could include new roads, pipelines, transmission lines, or renewable energy facilities.  
* **Core Tasks:** Chloe's role is one of coordination and communication. She uses geospatial data for high-level site selection and feasibility analysis, comparing potential locations against land ownership, environmental constraints, and existing infrastructure. She is a key hub of communication, coordinating with a diverse team of specialists including engineers, surveyors, planners like Alana, and environmental consultants like Ben.10 A critical task is tracking project progress against a backdrop of real-world geographic data and communicating project status to a wide range of stakeholders, many of whom are not technically proficient in GIS. Job descriptions for roles like hers frequently list experience with GIS and ESRI products as a key requirement.11  
* **Goals:** Chloe's primary goal is to maintain a "common operating picture" for the entire project team. She needs a single, authoritative platform where engineering designs can be overlaid with cadastral, environmental, and topographic data. Her aim is to facilitate clear communication and collaboration, ensuring that all team members are working from the same, up-to-date information.  
* **Frustrations (Pain Points):** Chloe's biggest challenge is the lack of a single source of truth. When data is scattered across different systems and file formats, it leads to version control issues, miscommunication, and costly errors. She struggles to share dynamic, interactive maps with stakeholders who do not have specialized GIS software, often resorting to static screenshots or PDFs that lose valuable context. Existing tools frequently lack the collaborative markup and annotation features she needs to effectively manage team feedback and track issues directly on the map.

### **1.2. The Map as an Answer Engine: Prioritized User Questions and Information Needs**

To ensure the map's design is goal-oriented, its features must be framed as answers to the specific questions our personas ask during their workflows. This approach shifts the focus from a list of technical capabilities to a set of user-centric solutions. The questions are prioritized into three tiers, reflecting their importance to the core tasks of the user base.

#### **Tier 1: Foundational Questions (Must-Haves for All Personas)**

These are the absolute baseline questions the map must answer to be considered functional for any of the target personas.

* **"What is at this specific location?"** This is the most fundamental query, requiring robust search functionality by address, parcel identifier (PID), and geographic coordinates.  
* **"What are the fundamental land characteristics here?"** Users must be able to instantly identify core attributes like cadastral (property) boundaries, land zoning, and tenure (e.g., Crown land, freehold).  
* **"What constraints apply to this parcel?"** The system must clearly display all applicable planning overlays, such as those for Bushfire Prone Areas, Flood Prone Areas, Heritage significance, or Conservation Covenants.  
* **"How can I share what I'm seeing?"** The ability to create a static, shareable output, such as a printable PDF or a simple shareable link to the current map view, is a non-negotiable requirement for communication and reporting.

#### **Tier 2: Analytical Questions (Key for Professional Workflows)**

These questions represent the next level of interaction, moving from simple look-ups to preliminary analysis.

* **"How do these two different factors relate spatially?"** This requires the ability to overlay multiple data layers and adjust their transparency to see through one layer to another (e.g., comparing a zoning map with an aerial photograph).  
* **"What is the size/length of this feature?"** This necessitates the inclusion of measurement tools to calculate distances and areas directly on the map.  
* **"What is within a certain distance of this point?"** This points to a need for basic proximity analysis or buffering tools to identify features within a specified radius of a point of interest.  
* **"How has this area changed over time?"** This question, particularly vital for planners, requires access to historical aerial imagery and, ideally, historical planning data layers.

#### **Tier 3: Collaborative & Advanced Questions (Power-User Features)**

These questions are characteristic of advanced users who need to create new information or integrate the platform with other professional tools.

* **"How can I mark up this area with my own notes/drawings?"** This requires drawing and annotation tools for adding points, lines, polygons, and text labels to the map for analytical or communicative purposes.  
* **"How can I use this data in my own professional software?"** This is a critical question for consultants and requires the ability to export selected data layers in standard GIS formats like KML, Shapefile, or GeoJSON.  
* **"How can I find all parcels that meet criteria X and Y?"** This query requires advanced attribute filtering capabilities, allowing users to search the data based on its characteristics (e.g., "show all parcels larger than 500 square meters zoned 'Light Industrial'").

The evolution of national mapping platforms provides a compelling argument for this tiered approach. The Australian Government's decision to decommission the older NationalMap in favor of the new Digital Atlas of Australia was driven by a recognized need to move beyond simple data viewing. The new platform explicitly emphasizes advanced "visualisation and analytics," acknowledging that professional users require tools to actively question and synthesize information, not just passively consume it.12 This strategic shift at a national level underscores that for the Unified Dashboard to be successful, it cannot merely replicate the functionality of a basic data browser. It must be conceived and designed as a decision support tool, where features for analysis, comparison, and interrogation are central to its value proposition, not peripheral add-ons.

## **Part 2: Deconstructing Interaction: A Comparative Analysis of Geospatial Portals**

To design an intuitive and effective user interface, it is essential to learn from established conventions and innovative solutions in the field. This section presents a systematic comparative analysis of the primary interaction patterns found in existing Australian state-level geospatial portals, including Tasmania's LISTmap, the NSW Spatial Viewer, Victoria's VicPlan, the Queensland Globe, and South Australia's SAPPA.5 By deconstructing how these systems handle core tasks, a library of effective UI/UX patterns can be established to inform the design of the Unified Dashboard.

### **2.1. Finding Place and Parcel: An Analysis of Search and Discovery Patterns**

The primary entry point for any map-based query is the search function. While all portals offer this basic capability, the breadth and flexibility of their search tools vary significantly, revealing much about their intended audience.

* **Core Functionality and Standard Practice:** At a minimum, all major portals support search by a property's street address and its legal identifier, typically a Lot on Plan or Parcel ID number.5 This dual approach caters to users who know the physical location and those working from legal documents. The standard interaction pattern involves a search bar that provides type-ahead suggestions as the user enters text. Upon selecting a valid result from this list, the map automatically pans and zooms to the location, highlighting the selected parcel with a distinct border, often in yellow or red, to provide clear visual confirmation.5  
* **Best-in-Class Example:** Tasmania's LISTmap portal stands out for its exceptionally comprehensive search functionality. It demonstrates a deep understanding of its expert user base by accepting a vast array of search term types. Beyond addresses and property identifiers (PIDs), users can search by place names, title references, multiple coordinate system formats (including Map Grid of Australia (MGA), latitude/longitude, and Degrees/Minutes/Seconds (DMS)), street atlas references, and even specific survey infrastructure identifiers like State Permanent Marks.16

The design of a portal's search function is a strong indicator of its target user's level of expertise. A system that primarily offers an address search is geared towards the general public, akin to a consumer mapping application. The inclusion of Lot/Plan numbers signals a focus on property professionals, such as real estate agents and developers. A portal like LISTmap, however, by incorporating technical identifiers like survey marks and multiple geodetic coordinate systems, explicitly caters to the advanced needs of surveyors, engineers, environmental scientists, and planners. For the Unified Dashboard to effectively serve its diverse personas, its search functionality must accommodate this full spectrum. It requires the consumer-level simplicity of an address search for a user like Chloe the Project Manager, while also providing the expert-level power of a PID or coordinate search for Alana the Planner and Ben the Consultant. A graceful UI solution would be a simple, prominent search bar for common queries, with an "Advanced Search" option or syntax guide that reveals the full range of powerful search capabilities.

### **2.2. Taming Complexity: A Review of Layer Management and Filtering Approaches**

The core value of a geospatial portal lies in its ability to display multiple layers of thematic data. The user's ability to manage these layers effectively is paramount to the system's usability.

* **Standard Practice:** The most common approach to layer management is a dedicated panel or menu, typically on the left side of the screen, containing a hierarchical list of available data layers. These layers are grouped by theme, such as "Administrative Boundaries," "Environment," or "Planning," to aid discovery.15 Each layer is accompanied by a checkbox to toggle its visibility on the map. A nearly universal and critical feature is an opacity or transparency slider for each layer, which allows users to see through one layer to another, a fundamental technique for spatial comparison.19  
* **Innovative Practice:** Victoria's VicPlan introduces a particularly powerful "time slider" tool. This feature allows users to view historical versions of planning scheme maps and property boundaries, providing invaluable context for understanding how regulations and land parcels have evolved over time.7 This is a high-value feature for planners like Alana, who often need to research the history of a site.  
* **Filtering:** Filtering capabilities vary. Basic filtering is achieved by simply toggling entire layers or layer groups on and off. More advanced filtering—querying features within a layer based on their specific attributes (e.g., "find all parcels with a 'General Residential' zoning")—is a core function of professional GIS but is less common in public-facing portals. LISTmap provides a basic implementation of this with an attribute search tool that allows users to build simple queries to find specific features within a layer.20

A common design challenge arises from the placement of the layer list. While the left-hand sidebar is a standard convention, it creates a fundamental conflict: the tool needed to control the map's content takes up valuable screen real estate that could be used to view the map itself. To see more of the map, the user must often collapse or hide the layer list. The NSW Spatial Viewer offers a refined solution by using a left panel for layer selection and a separate right panel for displaying the results of a property query.5 This effectively separates the act of "controlling the view" from "inspecting the results." General UI/UX best practices for map design reinforce this principle, emphasizing the need to reduce cognitive load and maximize the map canvas by making UI panels collapsible or contextual.21 Therefore, the Unified Dashboard's design should prioritize map real estate. An intelligently grouped, collapsible layer panel is essential. Furthermore, the design should consider separating the comprehensive layer

*list* (used for discovering and toggling layers) from the layer *legend* (which should dynamically display the symbology for only the layers currently visible on the map), thereby reducing visual clutter and improving clarity.

### **2.3. Navigating the Canvas: A Study of Exploration and Information Drill-Down**

Once a user has configured their desired layers, they interact with the map through two primary modes: navigating the canvas and drilling down for more information about specific features.

* **Core Functionality:** Standard navigation controls are universal and well-understood. These include panning the map via click-and-drag, and zooming via the mouse scroll wheel, on-screen \+/- buttons, or pinch-to-zoom gestures on touch devices.16  
* **Information Drill-Down Pattern:** The method for displaying detailed attribute information about a selected feature is a key point of divergence among existing portals and has a significant impact on usability.  
  * **Modal Pop-up/Info-Box:** The traditional method, seen in systems like LISTmap, involves clicking a feature to open a modal pop-up window (an "info-box") directly on the map.22 While direct, this approach has a major drawback: the pop-up inevitably obscures a portion of the map, hindering the user's ability to see the selected feature in its full spatial context or compare it with adjacent features.  
  * **Dedicated Information Panel:** A more modern and effective pattern, adopted by the NSW Spatial Viewer and VicPlan, utilizes a dedicated information panel located in a sidebar (typically on the right).5 When a user clicks a feature on the map, its detailed attributes are loaded into this panel. This approach keeps the map canvas fully visible and unobscured, allowing the user to maintain spatial context at all times.

This distinction highlights a core principle of effective map interaction design: managing the two distinct user modes of "map navigation" (panning and zooming) and "object interaction" (clicking a parcel or point).21 A common usability failure occurs when these modes conflict—for instance, a user attempting to click a small feature might accidentally drag and pan the map instead. The dedicated information panel pattern elegantly resolves this conflict. The click action has a single, unambiguous purpose: to populate the information panel. The map canvas is reserved for navigation. This creates a clear, consistent, and non-occluding interaction model that is essential for the complex analytical tasks of the Unified Dashboard's professional users. It allows a user to click on multiple features in sequence and easily compare their detailed attributes in the panel, all without losing the critical visual context of the map itself.

### **2.4. The Power Toolkit: An Inventory of Essential Map-Adjacent Features**

Beyond viewing and navigation, geospatial portals offer a range of tools that augment the user experience, transforming the platform from a simple viewer into a more powerful analytical and communicative tool. The specific tools offered reveal the portal's underlying design philosophy and its commitment to serving professional workflows.

The following table compares the availability of key tools across major Australian state government portals, providing a clear picture of the current standard of practice.

**Table: Common Map Tool Comparison**

| Tool | LISTmap (TAS) | NSW Spatial Viewer | VicPlan (VIC) | QLD Globe | SAPPA (SA) |
| :---- | :---- | :---- | :---- | :---- | :---- |
| **Measurement (Line/Area)** | Yes 23 | Yes 5 | Yes 7 | Yes 14 | Yes 15 |
| **Drawing/Annotation** | Yes 23 | No | Yes 7 | Yes 24 | No |
| **Print/Export to PDF** | Yes 16 | Yes 5 | Yes 6 | Yes 14 | Yes 15 |
| **Report Generation** | Basic Property Report | Yes (Property Report) 5 | Yes (Planning Report) 6 | No | Yes |
| **Change Basemap** | Yes 25 | Yes 5 | Yes 7 | Yes 24 | Yes 15 |
| **Share/Bookmark** | Yes 23 | No | No | No | No |
| **Data Export (GIS format)** | Yes 23 | Yes (via link to data portal) | No | Yes 14 | No |

This comparison reveals a spectrum of capability. A portal with only basic measurement and print functions operates primarily as a "Map Viewer." In contrast, portals like LISTmap, which provide a rich suite of tools including drawing, annotation, shareable bookmarks, and direct data export to GIS formats, are functioning as "Light GIS" applications.23 These platforms empower users not only to consume data but also to create new information (markups and annotations) and to extract data for use in their own professional software environments. This "Light GIS" model aligns perfectly with the needs of users like Ben the Environmental Consultant, who requires data export for his ArcGIS workflow, and mirrors the collaborative and creative capabilities of platforms like Google My Maps and ArcGIS Online.26 To adequately serve its professional user base, the Unified Dashboard must therefore aim for the "Light GIS" end of this spectrum. While it will not replace the deep analytical power of a full desktop GIS like QGIS or ArcGIS Pro 12, it must provide the core toolkit for preliminary analysis, annotation, reporting, and data interoperability that forms an integral part of the daily workflows for planners, consultants, and project managers. LISTmap's toolset serves as an excellent baseline model for the features that should be considered essential.

## **Part 3: Synthesis and Recommendations: Designing the Unified Dashboard Map Interface**

This section synthesizes the findings from the user persona analysis and the competitive review into a set of concrete, actionable design recommendations. The objective is to provide the DesignSynth team with a clear, evidence-based blueprint for creating an intuitive, efficient, and powerful map interface tailored to the specific needs of its professional users.

### **3.1. Recommended UI Framework and Layout**

To balance the competing needs of information density, map visibility, and tool accessibility, a flexible, multi-panel layout is recommended. This framework is inspired by the effective separation of concerns seen in the NSW Spatial Viewer and aligns with established UI/UX best practices for complex data applications.5

* Left Panel (Collapsible): The "Control Panel"  
  This panel serves as the primary hub for controlling the map's content. It should be located on the left side of the interface and must be easily collapsible to maximize the map view. It will house two key functions:  
  1. **Search:** Positioned at the top of the panel for immediate access, this will be the main entry point for all location-based queries.  
  2. **Layer Management:** Below the search, this section will contain the hierarchical list of all available data layers, allowing users to discover and toggle content.  
* Center Panel (Main View): The Map Canvas  
  This is the largest and most central component of the UI. Its sole purpose is to display the map itself. All primary navigation interactions—panning and zooming—will occur within this space. The design should ensure that this canvas remains as uncluttered and unobscured as possible.  
* Right Panel (Context-Sensitive): The "Information & Tools Panel"  
  This panel provides a dedicated space for detailed information and advanced tools, preventing them from cluttering the main map canvas. It should be hidden by default and appear only when triggered by a specific user action:  
  1. **Information Display:** When a user clicks on a feature (e.g., a property parcel) on the map, this panel will slide into view, populated with that feature's detailed attributes.  
  2. **Tool Interface:** When a user activates a tool like Measurement, Drawing, or Advanced Filtering, the relevant controls and options for that tool will appear within this panel.

This three-panel structure creates a logical workflow. The user controls the map's content on the left, views the result in the center, and inspects details or uses tools on the right. This clear separation of concerns reduces cognitive load and provides a predictable, scalable framework for adding future functionality.

### **3.2. Core Interaction Design Recommendations**

The following recommendations detail the expected behavior and design of the key interactive components within the proposed UI framework.

* **Search:**  
  * The primary search bar should be powerful and flexible, capable of accepting multiple input types including Street Address, Property Identifier (PID), Lot/Plan, various coordinate formats, and place names, following the comprehensive model set by LISTmap.16  
  * The interface should provide clear, type-ahead suggestions as the user enters their query to guide them toward valid results and reduce errors.  
  * While the default search should be simple, an easily accessible dropdown menu or clear iconography should allow users to specify the type of search they are performing (e.g., "Search by Coordinates"), catering to expert workflows.  
* **Layer Management:**  
  * The layer list within the left panel should use a hierarchical, collapsible tree structure to organize layers into logical thematic groups (e.g., Planning, Environment, Infrastructure).  
  * Each layer must have a primary checkbox for toggling visibility and a separate, easily discoverable icon (e.g., a gear or ellipsis) that reveals secondary controls, most importantly an opacity/transparency slider.  
  * A "filter layers" text box should be positioned at the top of the layer list. This is a crucial feature for usability, allowing users to quickly find a specific layer by name within what could be a very long list.  
  * The panel should include a dedicated "Legend" or "Active Layers" tab. This tab would dynamically display the symbology for *only* the layers currently turned on, providing a clean, context-sensitive legend instead of a static, overwhelming one.  
* **Information Drill-Down:**  
  * Upon a click event on a map feature, the feature itself should be visually highlighted on the map (e.g., with a bright, colored border as used by the NSW viewer 5), and the right-hand Information Panel should appear, populated with its detailed attributes.  
  * The content within the Information Panel must be well-structured and highly readable, using clear headings to group related information (e.g., "Property Details," "Planning Zones," "Environmental Overlays," "Valuation Information").  
  * Where data originates from a statutory document or has associated metadata, the panel should provide direct hyperlinks to the source legislation or official metadata page. This practice, seen in the NSW and VIC portals, adds a layer of authority and trust and is invaluable for professional users.5  
* **Handling Data Density:**  
  * To prevent visual clutter when many point features are in close proximity, the map must implement automatic feature clustering at higher (zoomed-out) scales. Instead of hundreds of individual pins, the user would see a single cluster icon with a number indicating the quantity of features within it, a best practice for performance and readability.21  
  * The system must utilize zoom-based rendering. This means that certain layers or more detailed feature labels only become visible as the user zooms further into the map. This is a standard and essential technique for managing performance and cognitive load in data-rich map applications.21

### **3.3. Prioritized Feature Set for the Unified Dashboard Map**

The following matrix provides a prioritized list of features for the interactive map. The priority is determined by a weighted analysis of each feature's importance to the core workflows of the three user personas. This serves as a strategic guide for the Project Manager to inform development sequencing and resource allocation.

**Table: Feature Prioritization Matrix**

| Feature | Alana (Planner) | Ben (Consultant) | Chloe (Project Manager) | Priority | Justification |
| :---- | :---- | :---- | :---- | :---- | :---- |
| **Multi-Criteria Search** | **Must-Have** | **Must-Have** | **Must-Have** | **1 (Core)** | Foundational requirement for all personas to locate properties and assets using their preferred identifiers. 5 |
| **Layer Management & Opacity** | **Must-Have** | **Must-Have** | **Must-Have** | **1 (Core)** | Critical for comparing overlapping data layers, a core analytical task for all professional users. 19 |
| **Measurement Tools (Area/Dist)** | **Should-Have** | **Must-Have** | **Must-Have** | **1 (Core)** | Essential for preliminary site analysis, area calculations, and feasibility studies in consulting and project management. 5 |
| **Print/Export to PDF w/ Legend** | **Must-Have** | **Must-Have** | **Must-Have** | **1 (Core)** | A non-negotiable requirement for creating reports, sharing findings with stakeholders, and official documentation. 16 |
| **Basemap Switcher (Street/Satellite)** | **Must-Have** | **Must-Have** | **Must-Have** | **1 (Core)** | Provides essential real-world context (satellite) and cartographic clarity (street map), vital for all users. 7 |
| **Drawing/Annotation Tools** | **Should-Have** | **Should-Have** | **Should-Have** | **2 (High)** | Highly valuable across all personas for preliminary sketches, collaborative communication, and highlighting areas of interest. 23 |
| **Export Data (KML/Shapefile)** | **Could-Have** | **Must-Have** | **Should-Have** | **2 (High)** | A critical power-user feature for the consultant's GIS integration workflow; enables interoperability with professional tools. 23 |
| **Shareable Bookmarks** | **Should-Have** | **Should-Have** | **Must-Have** | **2 (High)** | Essential for the project manager's collaborative workflow, allowing a specific map view (extent, layers, transparency) to be shared. 23 |
| **Historical Data Viewer (Slider)** | **Must-Have** | **Could-Have** | **Could-Have** | **3 (Medium)** | A high-value differentiator, critical for the planner's contextual analysis. Inspired by the innovative VicPlan feature. 7 |
| **Advanced Attribute Filtering** | **Should-Have** | **Should-Have** | **Could-Have** | **3 (Medium)** | Elevates the tool from a simple "viewer" to an "analytical engine," allowing users to ask complex questions of the data. |

This matrix provides a clear, evidence-based rationale for development priorities. For instance, "Export Data" is ranked as a high priority (Priority 2\) because it is a "Must-Have" for the Environmental Consultant persona, whose professional workflow is significantly impaired without it. Conversely, the "Historical Data Viewer," while a "Must-Have" for the Planner, is ranked as Priority 3 because it is a "Could-Have" for the other personas, making it less foundational than the features in the higher priority tiers. This framework allows the Project Manager to make informed decisions and trade-offs based on direct user impact, ensuring the development process remains user-centric and strategically aligned.

## **Part 4: From Design to Development: A Blueprint for Implementation**

This final section translates the design recommendations into actionable artifacts for the CODEFORGE development team and the Project Manager. It provides a set of foundational user stories to guide development sprints and addresses the critical platform considerations necessary to support the proposed user experience.

### **4.1. Foundational User Stories for Development**

These user stories are framed from the perspective of the personas, clearly stating their goal and the reason for it. They serve as the building blocks for the development backlog.

#### **Search & Navigation:**

* "As **Alana**, I want to search for a property using its Property Identifier (PID), so that I can quickly access its planning details without needing to know the street address."  
* "As **Chloe**, I want to enter a full street address and have the map instantly zoom to that location with the property highlighted, so I can orient my team during a project meeting."

#### **Layer Analysis:**

* "As **Ben**, I want to overlay the 'Threatened Flora Communities' layer on top of the 'Cadastral Parcels' layer and set the flora layer to 50% transparency, so I can clearly identify which properties are potentially impacted by vegetation constraints."  
* "As **Alana**, I want to activate a time-slider tool and set the date to 2010 to view the historical zoning map, so that I can understand the planning context of a current development application on a site that was previously zoned differently."

#### **Tools & Output:**

* "As **Ben**, I want to use the measurement tool to trace the boundary of a wetland polygon and get its area in hectares, so I can include this quantitative data in my environmental impact statement."  
* "As **Chloe**, I want to draw a circle with a 5-kilometer radius around a proposed wind turbine site and export the current map view as a high-resolution PDF with a legend, so I can share a clear map of the potential visual impact area with local community stakeholders."  
* "As **Ben**, I want to select the 'Native Vegetation Communities' layer, filter it to my project's geographic extent, and export the result as an ESRI Shapefile, so I can perform more complex spatial analysis in my desktop ArcGIS Pro software."  
* "As **Chloe**, I want to create a shareable link (bookmark) that saves my current map view, including the active layers and zoom level, so I can email it to an engineering contractor to review a specific area of concern."

### **4.2. Data and Platform Considerations**

The success of the recommended user interface is fundamentally dependent on the capabilities of the underlying technical platform. The user experience is merely the visible portion of a much larger system.

* **The Challenge of Fragmentation:** A recurring theme in the analysis of Australian planning and geospatial workflows is the significant pain point caused by data fragmentation. Planners and consultants are often forced to navigate multiple, non-interoperable systems to build a complete picture of a single location, a direct consequence of fragmented data governance and a lack of common standards across agencies and jurisdictions.3 The very name of the "Unified Dashboard" project implies a core mission to solve this exact problem.  
* **The Power of Web Services:** The key to unification lies in a platform architecture built around modern spatial web services. The approach taken by Tasmania's LIST, which actively promotes its web service endpoints for integration into other business systems, provides a relevant model.30 Enterprise-grade platforms like Esri's ArcGIS Online are architected specifically to connect to and integrate data from numerous disparate sources, forming the backbone of many modern government and commercial solutions.10  
* **Recommendation:** The architecture for the Unified Dashboard must be a primary strategic consideration. It should be built upon a modern web GIS platform—whether a commercial-off-the-shelf solution like the Esri platform or a robust open-source stack utilizing components like PostGIS, GeoServer, and a front-end library like Mapbox GL JS or its open-source fork, MapLibre 31—that excels in three key areas:  
  1. **Data Federation:** The platform must be able to consume and display data "live" from a variety of web service protocols (e.g., WMS, WFS, Esri REST APIs) provided by different government agencies. This avoids the immense cost and complexity of trying to host and maintain copies of all the data in one central repository.  
  2. **Scalability:** The system must be designed to handle large, complex geospatial datasets and a high volume of concurrent users without performance degradation, a key feature of enterprise SaaS solutions.27  
  3. **Security:** It must provide a robust and configurable security model to manage user authentication and control access to sensitive or restricted datasets.27

The ultimate goal of the UI is to abstract away the backend complexity from the end-user. A planner like Alana does not know or care that the zoning data is served from a state planning department's server while the environmental data comes from a different agency's server. Her frustration stems from having to visit two different websites to see them. The triumph of the Unified Dashboard's UI will be its ability to present those two layers seamlessly within the same layer list, making them feel as though they belong together. This is a critical directive for the CODEFORGE and Project Manager teams. The elegant and intuitive front-end design recommendations in this report are predicated on the technical capacity to achieve this data federation on the backend. The user interface is the tip of the iceberg; the robust, interoperable platform is the mass below the surface that makes the entire experience possible.

#### **Works cited**

1. Local government | Esri Australia, accessed on July 21, 2025, [https://esriaustralia.com.au/industries/government/local](https://esriaustralia.com.au/industries/government/local)  
2. Job Listings \- Environment Institute of Australia and New Zealand, accessed on July 21, 2025, [https://www.eianz.org/job-listings/gis-analyst](https://www.eianz.org/job-listings/gis-analyst)  
3. 'Evidence-‐informed' metropolitan planning in Australia ..., accessed on July 21, 2025, [https://www.unisa.edu.au/contentassets/c7cd69c367ef4d81a0107477a6dac704/ahuri-final-report\_evidence-informed-metropolitan-planning\_v310720.pdf](https://www.unisa.edu.au/contentassets/c7cd69c367ef4d81a0107477a6dac704/ahuri-final-report_evidence-informed-metropolitan-planning_v310720.pdf)  
4. Tasmanian Planning Scheme | PlanBuild Tasmania, accessed on July 21, 2025, [https://www.planbuild.tas.gov.au/tasmanian-planning-schemes](https://www.planbuild.tas.gov.au/tasmanian-planning-schemes)  
5. Using the Spatial Viewer \- the NSW Planning Portal, accessed on July 21, 2025, [https://www.planningportal.nsw.gov.au/sites/default/files/documents/2022/Using%20the%20Spatial%20Viewer.pdf](https://www.planningportal.nsw.gov.au/sites/default/files/documents/2022/Using%20the%20Spatial%20Viewer.pdf)  
6. Planning property report, accessed on July 21, 2025, [https://www.planning.vic.gov.au/planning-schemes/planning-property-report](https://www.planning.vic.gov.au/planning-schemes/planning-property-report)  
7. Using VicPlan \- Planning, accessed on July 21, 2025, [https://www.planning.vic.gov.au/planning-schemes/using-vicplan](https://www.planning.vic.gov.au/planning-schemes/using-vicplan)  
8. Map Viewers and Portals \- Data.SA, accessed on July 21, 2025, [https://data.sa.gov.au/useful\_links](https://data.sa.gov.au/useful_links)  
9. Careers \- AECOM, accessed on July 21, 2025, [https://aecom.com/careers/](https://aecom.com/careers/)  
10. GISflow™ | Deloitte Australia, accessed on July 21, 2025, [https://www.deloitte.com/au/en/products/gisflow.html](https://www.deloitte.com/au/en/products/gisflow.html)  
11. 245 jobs – Gis Project Manager in Australia \- Jora, accessed on July 21, 2025, [https://au.jora.com/GIS-Project-Manager-jobs-in-Australia](https://au.jora.com/GIS-Project-Manager-jobs-in-Australia)  
12. NationalMap | Geoscience Australia, accessed on July 21, 2025, [https://www.ga.gov.au/scientific-topics/national-location-information/nationalmap](https://www.ga.gov.au/scientific-topics/national-location-information/nationalmap)  
13. The LIST \- Private Forests Tasmania, accessed on July 21, 2025, [https://pft.tas.gov.au/the-list](https://pft.tas.gov.au/the-list)  
14. Data and mapping | Department of Natural Resources and Mines ..., accessed on July 21, 2025, [https://www.nrmmrrd.qld.gov.au/data-mapping](https://www.nrmmrrd.qld.gov.au/data-mapping)  
15. South Australian property and planning atlas | PlanSA, accessed on July 21, 2025, [https://plan.sa.gov.au/our\_planning\_system/plan\_sa/south\_australian\_property\_and\_planning\_atlas](https://plan.sa.gov.au/our_planning_system/plan_sa/south_australian_property_and_planning_atlas)  
16. Navigating LISTmap, accessed on July 21, 2025, [https://www.thelist.tas.gov.au/app/content/the-list/news\_and\_information/resources/listmaphelp.pdf](https://www.thelist.tas.gov.au/app/content/the-list/news_and_information/resources/listmaphelp.pdf)  
17. Navigating LISTmap \- Disaster Resilience Education Tasmania, accessed on July 21, 2025, [https://disasterresiliencetas.com.au/wp-content/uploads/2019/05/listmaphelp.pdf](https://disasterresiliencetas.com.au/wp-content/uploads/2019/05/listmaphelp.pdf)  
18. NSW Map, accessed on July 21, 2025, [https://www.arcgis.com/apps/View/index.html?appid=63fa2b441c2c49e4b726cffa89629e46](https://www.arcgis.com/apps/View/index.html?appid=63fa2b441c2c49e4b726cffa89629e46)  
19. Managing layers in LISTmap \- YouTube, accessed on July 21, 2025, [https://www.youtube.com/watch?v=vfgUkPZfoys](https://www.youtube.com/watch?v=vfgUkPZfoys)  
20. How to search layers in LISTmap. \- YouTube, accessed on July 21, 2025, [https://www.youtube.com/watch?v=avBqzHG7dH0](https://www.youtube.com/watch?v=avBqzHG7dH0)  
21. Map UI Design: Best Practices, Tools & Real-World Examples \- Eleken, accessed on July 21, 2025, [https://www.eleken.co/blog-posts/map-ui-design](https://www.eleken.co/blog-posts/map-ui-design)  
22. List map instructions, accessed on July 21, 2025, [https://nre.tas.gov.au/Documents/List-map-instructions.pdf](https://nre.tas.gov.au/Documents/List-map-instructions.pdf)  
23. LISTmap Context Help, accessed on July 21, 2025, [https://maps.thelist.tas.gov.au/listmap/help/listmap\_context\_help.jsp](https://maps.thelist.tas.gov.au/listmap/help/listmap_context_help.jsp)  
24. Mapping new territory with the Queensland Globe, accessed on July 21, 2025, [https://www.data.qld.gov.au/article/case-studies/Queensland-Globe](https://www.data.qld.gov.au/article/case-studies/Queensland-Globe)  
25. Brief instructions on how to generate a map from LISTmap for Certificate of Titles or PID Numbers listed in Public Notices \- Private Forests Tasmania, accessed on July 21, 2025, [https://pft.tas.gov.au/volumes/documents/Private-Timber-Reserves/2022\_PTR-Instructions-on-how-to-generate-LISTmap-September-2020.pdf](https://pft.tas.gov.au/volumes/documents/Private-Timber-Reserves/2022_PTR-Instructions-on-how-to-generate-LISTmap-September-2020.pdf)  
26. Everything You Need to Know About Google My Maps \- Lenovo, accessed on July 21, 2025, [https://www.lenovo.com/us/en/glossary/google-my-maps/](https://www.lenovo.com/us/en/glossary/google-my-maps/)  
27. Web GIS Mapping Software | Create Web Maps with ArcGIS Online, accessed on July 21, 2025, [https://www.esri.com/en-us/arcgis/products/arcgis-online/overview](https://www.esri.com/en-us/arcgis/products/arcgis-online/overview)  
28. ArcGIS Online \- Microsoft AppSource, accessed on July 21, 2025, [https://appsource.microsoft.com/en-ae/product/web-apps/esri.sol-14320-fil?tab=Overview](https://appsource.microsoft.com/en-ae/product/web-apps/esri.sol-14320-fil?tab=Overview)  
29. King County iMap \- King County, Washington, accessed on July 21, 2025, [https://kingcounty.gov/en/dept/kcit/data-information-services/gis-center/maps-apps/imap](https://kingcounty.gov/en/dept/kcit/data-information-services/gis-center/maps-apps/imap)  
30. LIST Spatial Web Services User Guide \- Department of Natural Resources and Environment Tasmania, accessed on July 21, 2025, [https://www.thelist.tas.gov.au/app/content/the-list/news\_and\_information/resources/list\_spatial\_web\_services\_user\_guide.pdf](https://www.thelist.tas.gov.au/app/content/the-list/news_and_information/resources/list_spatial_web_services_user_guide.pdf)  
31. Mapbox \- Wikipedia, accessed on July 21, 2025, [https://en.wikipedia.org/wiki/Mapbox](https://en.wikipedia.org/wiki/Mapbox)